import React, { PureComponent } from 'react'

import auth from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import RNExitApp from 'react-native-exit-app'

import Navigator from 'react-native-easy-router'
import * as Keychain from 'react-native-keychain'
import SpashScreen from "react-native-splash-screen"
import AsyncStorage from '@react-native-community/async-storage'
import { SafeAreaProvider } from 'react-native-safe-area-context'

import Home from "./Home/Home"
import Connected from "./Connected/Connected"
import NotificationPages from "./Notification/Notification"

import { ModalPortal } from 'react-native-modals'

import Synchronization from './Utils/Synchronization';

export default class App extends PureComponent {

    state = { renderNavigator: false }

    HOME = "HOME"
    CONNECTED = "CONNECTED"
    NOTIFICATION_ASKING_KEY = "NOTIFICATION_ASKING_KEY"

    async componentDidMount() {

        // Utilisation de Pass en local
        if (await Synchronization.isNotUsingSync()) return this.navigate(this.CONNECTED)

        // Sinon on vérifie si il est bien connecté
        this.removeAuthStateChangedListener = auth().onAuthStateChanged(async user => { //FIXME: REMOVE THIS
            this.removeAuthStateChangedListener()

            if (user != null) {

                // Ouvre t-il l'appli depuis une notification ?
                try {
                    const NOTIFICATION_ASKING_KEY = await AsyncStorage.getItem("NOTIFICATION_ASKING_KEY")

                    if (NOTIFICATION_ASKING_KEY !== null) {

                        this.setState({ NOTIFICATION_ASKING_KEY }, _ => this.navigate(this.NOTIFICATION_ASKING_KEY))

                        try {
                            await AsyncStorage.removeItem('NOTIFICATION_ASKING_KEY')
                        } catch (err) {
                            console.error("Erreur lors de la suppression de NOTIFICATION_ASKING_KEY", err)
                        }

                    } else {
                        this.navigate(this.CONNECTED)
                    }

                } catch (err) {
                    console.error("Erreur lors de la récupération de NOTIFICATION_ASKING_KEY", err)
                    this.navigate(this.CONNECTED)
                }

            } else {
                this.navigate(this.HOME)
            }
        })
    }

    navigate = newPage => this.setState({ renderNavigator: newPage })

    componentWillUnmount() {
        this.removeAuthStateChangedListener && this.removeAuthStateChangedListener()
    }

    onSignIn = _ => {
        this.navigator.reset(this.CONNECTED)
    }

    onSignOut = async deleteKey => {

        Keychain.resetInternetCredentials("AUTH-TYPE")
        Keychain.resetInternetCredentials("AUTH-CODE")
        Keychain.resetInternetCredentials("IDENTITY_VERIFICATION_FINGERPRINT")

        if (deleteKey === true) {
            Keychain.resetGenericPassword()
        }

        let deviceID = await AsyncStorage.getItem("deviceID")

        const { uid } = auth().currentUser
        const docPath = `Users/${uid}/Devices/${deviceID}`

        firestore().doc(docPath).delete().then(_ => { //FIXME: REMOVE THIS

            this.removeAuthStateChangedListener()

            try {
                auth().signOut()
                this.navigator.reset(this.HOME)
            } catch (er) { }

        }).catch(err => {
            console.error("ERREUR DE LA SUPPRESSION DE L'APPAREIL", err)
            auth().signOut()
            this.navigator.reset(this.HOME)
        })
    }

    onReady = SpashScreen.hide

    onExit = RNExitApp.exitApp

    renderConnected = props => {
        return <Connected {...props} onReady={this.onReady} onSignOut={this.onSignOut} />
    }

    renderHome = props => {
        return <Home {...props} onReady={this.onReady} onSignIn={this.onSignIn} />
    }

    renderNotification_AskingKey = props => {
        return <NotificationPages.AskingKey {...props} onReady={this.onReady} deviceID={this.state.NOTIFICATION_ASKING_KEY} onExit={this.onExit} />
    }

    render() {
        return <SafeAreaProvider>

            <ModalPortal />

            {this.state.renderNavigator && <Navigator
                navigatorRef={ref => (this.navigator = ref)}
                screens={{
                    HOME: this.renderHome,
                    CONNECTED: this.renderConnected,
                    NOTIFICATION_ASKING_KEY: this.renderNotification_AskingKey
                }}
                initialStack={this.state.renderNavigator} />}

        </SafeAreaProvider>
    }
}