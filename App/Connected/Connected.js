import React from 'react'
import { AppState, View, Alert } from "react-native"

import Navigator from 'react-native-easy-router'

import Security from './Security/Security';
import PrivateKey from './PrivateKey/PrivateKey';
import Authenticated from './Authenticated/Authenticated';

import AskingKey from "../Notification/AskingKey"

import Database from "../Utils/Database"
import Synchronization, { ERROR as SYNC_ERROR } from "../Utils/Synchronization"

export default class Connected extends React.PureComponent {

    state = {
        askToAnswer: false,
        deviceID: null
    }

    componentDidMount() {
        this.changeAppStateListener = AppState.addEventListener("change", this.lockTheWindow)
        // TODO: this.startCloudMessaging()
    }

    componentWillUnmount() {
        this.changeAppStateListener && this.changeAppStateListener.remove()
        Synchronization.end()
    }

    lockTheWindow = event => {
        if (event === "background") {
            this.navigator.reset("Security")
        }
    }

    onAuthenticationSucceed = _ => {

        // Initialisation de la base de donnée hors ligne
        Database.init()
            .then(_ => { })
            .catch(_ => {

                // Creation de la base de donnée hors ligne si elle n'existe pas
                Database.createDatabase()

            })
            .finally(_ => {

                // Lien Synchronisation - Base de donnée
                Synchronization.setDatabase(Database)

                // Initialisation de la synchronisation
                Synchronization.init().then(_ => {

                    // Lets go
                    Database.synchronizeWith(Synchronization)
                    this.onKeyLoaded()

                    // Lancement de la synchornisation
                    Synchronization.start()

                }).catch(err => {

                    if (err === SYNC_ERROR.NOT_USING_SYNCHRONISATION) return this.onKeyLoaded()

                    console.error("SYNC-INIT", err.code, err.message)

                    // Erreur dans le lien, FIXME: on redemande la clé par défault mais peut etre une autre erreur
                    this.navigator.reset("PrivateKey")

                })

            })


    }

    onKeyLoaded = _ => {

        this.navigator.reset("Authenticated")

        /* TODO: Enregistrer l'appareil dans le compte de l'utilisateur
        
        // Récupération le deviceID de cet appareil depuis les settings electron
        if (deviceID === false) {
            deviceID = await AsyncStorage.getItem("deviceID")
            if (deviceID === null) deviceID = false
        }

        const { uid } = auth().currentUser
        const docPath = `Users/${uid}/Devices`

        const credentials = await AsyncStorage.getItem('notification.credentials')

        if (credentials !== null) {

            const applyFirestoreChanges = (lastTry = 5) => {

                let firebaseDocument;

                if (deviceID != false) {
                    firebaseDocument = firestore()
                        .doc(docPath + "/" + deviceID)
                        .update({
                            state: "DONE",
                            FCM_TOKEN: credentials,
                            last_use: new Date()
                        })
                } else {

                    const body = {
                        type: "mobile",
                        os: "Android"
                    }

                    firebaseDocument = firestore()
                        .collection(docPath)
                        .add({
                            ...body,
                            state: "DONE",
                            FCM_TOKEN: credentials,
                            added: new Date(),
                            last_use: new Date()
                        })
                }

                firebaseDocument
                    .then(docRef => {

                        if (deviceID === false) {
                            AsyncStorage.setItem("deviceID", docRef.id)
                        }

                        this.navigator.reset("Authenticated")
                    })
                    .catch(err => {

                        console.error("Erreur lors de la mise a jour du token sur le doc firestore", err)
                        console.error(err.code)

                        if (err.code === "firestore/not-found") {

                            AsyncStorage.removeItem("deviceID")
                            deviceID = false

                            if (lastTry > 0) {
                                applyFirestoreChanges(lastTry - 1)
                            } else {
                                console.error("Erreur interne de l'application.")
                            }

                        }
                    })
            }

            applyFirestoreChanges()

        } else {
            console.error("Erreur lors de l'obtention du token FCM")
        }*/

    }

    renderSecurity = props => {
        return <Security
            {...props}
            onReady={this.props.onReady}
            onAuthenticationSucceed={this.onAuthenticationSucceed}
            onAuthenticationFailed={this.props.onSignOut} />
    }

    renderPrivateKey = props => {
        return <PrivateKey {...props} onKeyLoaded={this.onKeyLoaded} />
    }

    renderAuthenticated = props => {
        return <Authenticated {...props} onSignOut={this.props.onSignOut} />
    }

    renderAskingKey = props => {
        return <AskingKey {...props} onExit={this.navigator.pop} />
    }

    /*
    startCloudMessaging = _ => {

        this.checkMessagingPermission()

        messaging().onMessage(remoteMessage => {
            if (remoteMessage.data.type === "ASKING_KEY") {
                this.setState({ deviceID: remoteMessage.data.deviceID })
                Alert.alert("Client connectés", "Venez vous de demander votre clé privée sur un nouveau client ?",
                    [
                        {
                            text: "Ce n'est pas moi",
                            onPress: () => null,
                            style: "cancel"
                        },
                        { text: "Analyser la demande", onPress: () => this.navigator.push("AskingKey", { deviceID: this.state.deviceID }) }
                    ],
                    { cancelable: false })
            }
        })
    }

    checkMessagingPermission = async _ => {
        const enabled = await messaging().hasPermission()

        // If Premission granted proceed towards token fetch
        if (enabled) {
            this.getMessagingToken()
        } else {
            // If permission hasn’t been granted to our app, request user in requestPermission method. 
            try {
                await messaging().requestPermission()
                // User has authorised
                this.getMessagingToken()
            } catch (error) {
                // User has rejected permissions
                console.log('permission rejected')
            }
        }
    }

    getMessagingToken = async _ => {
        let fcmToken = await AsyncStorage.getItem('notification.credentials')
        if (!fcmToken) {
            fcmToken = await messaging().getToken()
            if (fcmToken) {
                await AsyncStorage.setItem('notification.credentials', fcmToken)
            }
        }
    }*/

    render() {
        return <View style={{ height: "100%" }}>
            <Navigator
                navigatorRef={ref => (this.navigator = ref)}
                screens={{
                    Security: this.renderSecurity,
                    PrivateKey: this.renderPrivateKey,
                    Authenticated: this.renderAuthenticated,
                    AskingKey: this.renderAskingKey
                }}
                initialStack='Security' />
        </View>
    }
}