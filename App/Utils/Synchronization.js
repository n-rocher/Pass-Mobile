import KeyManagement from "./KeyManagement"
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import Preference from 'react-native-default-preference';
import { getModel, getBrand, getSystemName, getSystemVersion } from 'react-native-device-info';
import NetInfo from "@react-native-community/netinfo";

import { ERROR as SYNC_ERROR } from "./Database"

import Queue, { wrapFunction } from "./Queue";

export const ERROR = {
    NOT_USING_SYNCHRONISATION: "not-using-synchronization",
    NEED_A_KEY: "need-a-key"
}

const VERIFICATION_DATA = "Pass."

const TAG = {
    USING_SYNCHRONISATION: "using-synchronization"
}

class Synchronization {

    queue;
    local_database;
    is_in_sync = false
    listenerForRealtimeUpdate = null

    queueToDelete = null
    queueToUpdate = null

    constructor() {

        this.queue = new Queue(this, this.afterSync)

        this.queueToDelete = new ActionCacheQueue("DELETE", this.queue, this, this.deleteItem)
        this.queueToUpdate = new ActionCacheQueue("UDPATE", this.queue, this, this.updateItem)

        firestore().settings({
            ssl: true,
            persistence: false
        })
    }

    end() {
        this.queue.end()
        this.listenerForRealtimeUpdate && this.listenerForRealtimeUpdate()
    }

    setDatabase(database) {
        this.local_database = database
    }

    async isUsingSync() {
        return (await Preference.get(TAG.USING_SYNCHRONISATION)) === "true"
    }

    async isUsingSyncNotSet() {
        return (await Preference.get(TAG.USING_SYNCHRONISATION)) === null
    }

    async isNotUsingSync() {
        return (await Preference.get(TAG.USING_SYNCHRONISATION)) === "false"
    }

    async setUseSync(trueOrFalse) {
        await Preference.set(TAG.USING_SYNCHRONISATION, JSON.stringify(trueOrFalse))
    }



    // Gestion des clés et gestion de la donnée
    init() {
        return new Promise(async (resolve, reject) => {

            if (!(await this.isUsingSync())) {

                // Utilisation de Pass en local
                return reject(ERROR.NOT_USING_SYNCHRONISATION)

            }


            const netState = await NetInfo.fetch()

            if (!netState.isConnected) return resolve() // On continue si il n'a pas internet, utilisation du cache

            this.getVerificationKey().then(async ({ exist, verificationKey }) => {

                if (exist) {

                    // Si verificationKey => il y a des donnnées

                    KeyManagement
                        .get_key(KeyManagement.ONLINE)
                        .then(online_key => {
                            if (this.testKey(verificationKey, online_key)) {

                                // Clé valide => Ready
                                resolve()

                            } else reject(ERROR.NEED_A_KEY)
                        }).catch(_ => reject(ERROR.NEED_A_KEY))

                } else {

                    // Si pas de verificationKey => pas de données

                    // Create key
                    const online_key = await KeyManagement.create_key(KeyManagement.ONLINE)

                    // Create verification key
                    let newVerificationKey;
                    try {
                        newVerificationKey = KeyManagement.encrypt_data_sync(KeyManagement.encrypt_data_sync(VERIFICATION_DATA, online_key), online_key)
                    } catch (err) {
                        return reject(err)
                    }

                    this.setVerificationKey(newVerificationKey).then(_ => {

                        // Clé générée + code de vérification envoyé => Ready
                        resolve({ ready: true })

                    }).catch(err => {
                        reject(err)
                    })
                }

            }).catch(err => {
                reject(err)
            })

        })
    }

    getVerificationKey() {
        return new Promise((resolve, reject) => {

            const userID = auth().currentUser.uid

            firestore()
                .doc(`Users/${userID}`)
                .get()
                .then(snapshot => {

                    const data = snapshot.data()

                    if (snapshot.exists && data?.verificationKey) {
                        resolve({ exist: true, verificationKey: data.verificationKey })
                    } else {
                        resolve({ exist: false })
                    }

                }).catch(err => {
                    console.error("ERROR::GET_VERIFICATION_KEY", err)
                    reject(err)
                })
        })
    }

    setVerificationKey(verificationKey) {
        return new Promise((resolve, reject) => {

            const userID = auth().currentUser.uid

            firestore()
                .doc(`Users/${userID}`)
                .set({ verificationKey, verificationKeyCreatedDate: new Date() })
                .then(_ => {

                    resolve()

                }).catch(err => {
                    console.error("ERROR::SET_VERIFICATION_KEY", err)
                    reject(err)
                })
        })
    }

    testKey(verificationKey, testingKey) {
        let verificationData;

        try {
            verificationData = KeyManagement.decrypt_data_sync(KeyManagement.decrypt_data_sync(verificationKey, testingKey), testingKey)
        } catch (_) {
            verificationData = ""
        }

        return verificationData === VERIFICATION_DATA
    }


    // Synchronisation

    async start() {

        /* let notSynced = await Preference.get('not-synced')
        notSynced = (notSynced || "").split("\n")


        for(let line of notSynced) {
            line = line.split("-")

            if(line.length == 3) { // [DELETE-UPDATE]-ID-ENCRYPTED_DATA-UPDATED_DATE

            }

        }*/

        this.queueToDelete.restore()
        this.queueToUpdate.restore()

        this.queue.add(wrapFunction(this.synchroniseFromDatabase, this, this.local_database.getAllItemsIdUpdateDate()))

    }

    synchroniseFromDatabase(local_items) {
        return new Promise(async resolve => {

            let onlyOnce = true

            this.listenerForRealtimeUpdate = firestore().collection("Item").where("userId", "array-contains", auth().currentUser.uid)
                .onSnapshot(async data => {

                    // Mise a jour de tout les items a chaque ouverture d'appli
                    if (onlyOnce && data.docChanges().length === data.size) {
                        onlyOnce = false

                        const online_items = data.docs.map(x => {
                            const y = x.data()
                            const data = {
                                id: y.id,
                                updateDate: y.updateDate.toDate(),
                                data: y.data
                            }

                            // On ajoute a la queue la mise a jour des éléments
                            this.queue.add(wrapFunction(online_item => {
                                return new Promise((resolve, reject) => {
                                    this.local_database
                                        .saveItemFromSynchronization(online_item)
                                        .then(_ => {
                                            resolve()
                                        })
                                        .catch(err => {
                                            if (err.code == SYNC_ERROR.ONLINE_ITEM_NEED_UPDATE) {
                                                this.updateItem(err.data.id)
                                                return resolve()
                                            }
                                            reject(err)
                                        })
                                })
                            }, this, data))

                            return data
                        })

                        let online_items_id = online_items.map(x => x.id)
                        const local_items_id = local_items.map(x => x[0])

                        // On récupère uniquement les id en trop en local puis on les supprimes de la bdd
                        const to_delete_local = local_items_id.filter(v => !online_items_id.includes(v))
                        to_delete_local.map(id_to_delete => {
                            this.queue.add(wrapFunction(id_to_delete => {
                                return new Promise((resolve) => {
                                    this.local_database.deleteItem(id_to_delete, true)
                                    resolve()
                                })
                            }, this, id_to_delete))
                        })

                        return resolve() // On sort de la queue, mais la fonction reste en mémoire pour les appels en temps réel

                    }

                    //Dans le cas de mise a jour en direct
                    if (!onlyOnce) {

                        for (const update of data.docChanges()) {

                            // En cas d'ajout ou de modification d'un item en direct
                            if (update.type === "added" || update.type === "modified") {

                                try {
                                    const y = update.doc.data()

                                    const data = {
                                        id: y.id,
                                        updateDate: y.updateDate.toDate(),
                                        data: y.data
                                    }

                                    // On ajoute a la queue la mise a jour des éléments
                                    this.queue.add(wrapFunction(online_item => {
                                        return new Promise((resolve, reject) => {
                                            this.local_database
                                                .saveItemFromSynchronization(online_item)
                                                .then(_ => {
                                                    resolve()
                                                })
                                                .catch(err => {
                                                    if (err.code == SYNC_ERROR.ONLINE_ITEM_NEED_UPDATE) {
                                                        this.updateItem(err.data.id)
                                                        return resolve()
                                                    }
                                                    reject(err)
                                                })
                                        })
                                    }, this, data))
                                } catch (err) {
                                    console.error("[SYNC] Error lors de l'ajout de l'item dans la queue de synchronisation", err)
                                }

                            }


                            // En cas de suppression en direct
                            if (update.type === "removed") {
                                try {
                                    const id_doc = update.doc.data().id
                                    this.queue.add(wrapFunction(id_to_delete => {
                                        return new Promise((resolve) => {
                                            this.local_database.deleteItem(id_to_delete, true)
                                            resolve()
                                        })
                                    }, this, id_doc))

                                } catch (err) {
                                    console.error("[SYNC] Error lors de l'ajout de l'item dans la queue de synchronisation", err)
                                }
                            }
                        }
                    }
                })
        })
    }


    deleteItem(id_to_delete, addFromCache = false) {

        console.warn("deleteItem" + id_to_delete + addFromCache)

        if (!addFromCache) this.queueToDelete.push(id_to_delete)

        this.queue.add(wrapFunction(id_to_delete => {
            return new Promise((resolve, reject) => {

                this.getOnlineId(id_to_delete).then(online_id => {
                    if (online_id) {
                        firestore()
                            .collection("Item")
                            .doc(online_id)
                            .delete()
                            .then(() => {
                                this.queueToDelete.remove(id_to_delete)
                                resolve()
                            }).catch(err => {
                                reject(err)
                            })
                    } else {
                        this.queueToDelete.remove(id_to_delete)
                        resolve()
                    }
                }).catch(err => {
                    reject(err)
                })
            })
        }, this, id_to_delete))

    }

    updateItem(id_to_update, addFromCache = false) {

        if (!addFromCache) this.queueToUpdate.push(id_to_update)

        this.queue.add(wrapFunction(id_to_update => {
            return new Promise((resolve, reject) => {

                // Récupération des données de l'item
                this.local_database.getItemToSynchronization(id_to_update).then(local_enc_item => {

                    // On récupère l'item en ligne
                    this.getOnlineId(id_to_update).then(online_id => {

                        if (online_id) {

                            // On met à jour l'item
                            firestore()
                                .collection("Item")
                                .doc(online_id)
                                .update(local_enc_item)
                                .then(_ => {
                                    this.queueToUpdate.remove(id_to_update)
                                    resolve()
                                })
                                .catch(err => {
                                    console.error("[SYNC -> updateItem -> firestore.update]", err)
                                    reject(err)
                                })

                        } else {

                            // On ajoute l'item
                            firestore()
                                .collection("Item")
                                .add({ ...local_enc_item, userId: [auth().currentUser.uid] })
                                .then(_ => {
                                    this.queueToUpdate.remove(id_to_update)
                                    resolve()
                                })
                                .catch(err => {
                                    console.error("[SYNC -> updateItem -> firestore.add]", err)
                                    reject(err)
                                })

                        }

                    }).catch(err => {
                        console.error("[SYNC -> updateItem -> this.getOnlineId]", err)
                        reject(err)
                    })

                }).catch(_ => {
                    this.queueToUpdate.remove(id_to_update) // Item introuvable en local donc on oubli
                })

            })
        }, this, id_to_update))
    }

    getOnlineId(id) {
        return new Promise((resolve, reject) => {
            firestore()
                .collection("Item")
                .where("userId", "array-contains", auth().currentUser.uid)
                .where("id", "==", id)
                .get()
                .then(data => {
                    if (data.size > 0) {
                        resolve(data.docs[0].id) // Récupération de l'id online
                    } else {
                        resolve(null) // Création d'un nouvel objet
                    }
                })
                .catch(err => {
                    console.error(err)
                    reject(err)
                })
        })
    }

    afterSync() {
        this.is_in_sync = false
    }

}

const SAVING_MS_TIME = 500
const ACTION_CACHE_QUEUE_TAG = "ACTION-CACHE-QUEUE-"

class ActionCacheQueue {

    list = []
    type = ""
    queue = null
    context = null
    fn = null

    constructor(type, queue, context, fn) {
        this.type = type
        this.queue = queue
        this.context = context
        this.fn = fn
    }

    async restore() {
        let local_list = await Preference.get(ACTION_CACHE_QUEUE_TAG + this.type)
        local_list = local_list ? JSON.parse(local_list) : []

        console.log(ACTION_CACHE_QUEUE_TAG + this.type, local_list)

        this.list = local_list

        for (const item_id of local_list) {
            this.fn.apply(this.context, [item_id, true])
        }

    }

    save = throttle(_ => Preference.set(ACTION_CACHE_QUEUE_TAG + this.type, JSON.stringify(this.list)), SAVING_MS_TIME)

    push(id) {
        this.list.push(id)
        this.save()
    }

    remove(id) {
        this.list = this.list.filter(x => x !== id)
        this.save()
    }

}


function throttle(callback, delay) {
    var last
    var timer
    return function () {
        var context = this
        var now = +new Date()
        var args = arguments
        if (last && now < last + delay) {
            clearTimeout(timer)
            timer = setTimeout(function () {
                last = now
                callback.apply(context, args)
            }, delay)
        } else {
            last = now;
            callback.apply(context, args)
        }
    }
}




const sync = new Synchronization()

export default sync;