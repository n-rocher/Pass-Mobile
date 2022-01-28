import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

import KeyManagement from "./KeyManagement"

const VERIFICATION_DATA = "Pass."

function getVerificationKey() {
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

function setVerificationKey(verificationKey) {
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

function testKey(verificationKey, testingKey) {
    let verificationData;

    try {
        verificationData = KeyManagement.decrypt_data_sync(KeyManagement.decrypt_data_sync(verificationKey, testingKey), testingKey)
    } catch (_) {
        verificationData = ""
    }

    return verificationData === VERIFICATION_DATA
}

function init_sync() {
    return new Promise((resolve, reject) => {
        getVerificationKey().then(async ({ exist, verificationKey }) => {

            console.log("getVerificationKey", exist, verificationKey)

            if (exist) {

                // Si verificationKey => il y a des donnnées

                KeyManagement
                    .get_key()
                    .then(online_key => {

                        if (testKey(verificationKey, online_key)) {
                            // Clé valide => Ready
                            resolve({ ready: true })
                        } else {
                            // Clé non valide => Charger une autre clé
                            resolve({ ready: false, requireLoadingKey: true })
                        }
                    }).catch(_ => {
                        // Clé non trouvé ou corrompu => Charger une autre clé
                        resolve({ ready: false, requireLoadingKey: true })
                    })

            } else {

                // Si pas de verificationKey => pas de données

                // Create key
                const online_key = await KeyManagement.create_key()

                // Create verification key
                let newVerificationKey;
                try {
                    newVerificationKey = KeyManagement.encrypt_data_sync(KeyManagement.encrypt_data_sync(VERIFICATION_DATA, online_key), online_key)
                } catch (err) {
                    return reject(err)
                }

                setVerificationKey(newVerificationKey).then(_ => {

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

export default async function IsPrivateKeyValid() {
    return new Promise((resolve, reject) => {
        init_sync()
            .then(data => {
                console.info("INIT SYNCHRONISATION", data)
                if (data.ready) {
                    resolve()
                } else {
                    reject()
                }
            }).catch(err => {
                console.error("ERROR::INIT SYNCHRONISAT<iON", err)
                reject(err)
            })
    })
}