import React, { Component } from 'react';
import { View, ToastAndroid, AppState, StatusBar, StyleSheet, Alert } from 'react-native';

import * as Keychain from 'react-native-keychain';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import changeNavigationBarColor from 'react-native-navigation-bar-color';

import I18N from "../../Translation/Config"
import CodeKeyBoard from '../../Common/CodeKeyBoard'
import Logo from '../../Common/Logo'

import FINGERPRINT_ICON from "../../../images/fingerprint.png"

export default class CodeID extends Component {

    state = { try: 5 }

    async componentDidMount() {
        AppState.addEventListener("change", this.appStateListener)

        changeNavigationBarColor("#1E88E5")

        if (AppState.currentState === "active") {
            // Si on arrive sur la page de PIN et que l'utilisateur a activé l'empreinte digitale
            Keychain.getInternetCredentials("IDENTITY_VERIFICATION_FINGERPRINT").then(data => {
                var val = false
                if (data != false) {
                    val = JSON.parse(data.password)
                }

                if (val) {
                    // Affichage prompt empreinte digitale
                    this.authentication_fingerprint()
                }
            })
        }

    }

    componentWillUnMount() {
        AppState.removeEventListener("change", this.appStateListener)
        FingerprintScanner.release()
        changeNavigationBarColor("#FFFFFF")
    }

    appStateListener = newState => {
        if (newState !== "active") {
            FingerprintScanner.release()
        }
    }

    getCode = async _ => {
        if(!this.digits) {
            this.digits = await Keychain.getInternetCredentials("AUTH-CODE")
        }
    }

    onNumber = async code => {

        await this.getCode()
        
        if (code.length === this.digits.password.length) {
            setTimeout(_ => {
                if (code === this.digits.password) {

                    // Code valide
                    this.onAuthenticationSucceed()

                } else {

                    this.setState({
                        try: this.state.try - 1
                    }, _ => {
                        this.codeKeyBoard.failed()

                        if (this.state.try <= 3 && this.state.try > 0) {

                            // Si il y a entre 0 et 3 essai restant on affiche une bulle d'info
                            ToastAndroid.show(I18N.t("Login.Pin.RemainingTrials", { val: this.state.try }), ToastAndroid.SHORT)

                        } else if (this.state.try == 0) {

                            // Si il n'y a plus d'essai on deconnecte la personne
                            this.onAuthenticationFailed()

                        }
                    })
                }
            }, 250)
        }
    }

    onFingerprints = _ => {
        Keychain.getInternetCredentials("IDENTITY_VERIFICATION_FINGERPRINT").then(data => {
            var val = false
            if (data != false) {
                val = JSON.parse(data.password)
            }

            if (val) {
                // Affichage prompt empreinte digitale
                this.authentication_fingerprint()
            } else {
                // Affichage d'une erreur
                Alert.alert(I18N.t("Login.FingerPrint.Title"), I18N.t("Login.FingerPrint.Error.Disabled"))
            }
        })
    }

    authentication_fingerprint = _ => {
        FingerprintScanner
            .isSensorAvailable()
            .then(_ => {
                changeNavigationBarColor("#002247")
                FingerprintScanner.authenticate({
                    title: I18N.t("Login.FingerPrint.Title"),
                    description: I18N.t("Login.FingerPrint.Description"),
                    cancelButton: I18N.t("Button.Cancel")
                })
                    .then(_ => {
                        FingerprintScanner.release()
                        changeNavigationBarColor("#1E88E5")
                        this.onAuthenticationSucceed()
                    }).catch(err => {
                        FingerprintScanner.release()
                        changeNavigationBarColor("#1E88E5")
                    })
            })
    }

    onAuthenticationFailed = this.props.onAuthenticationFailed
    onAuthenticationSucceed = this.props.onAuthenticationSucceed

    render() { 

        return (
            <View style={styles.container}>

                <StatusBar backgroundColor="#1E88E5" barStyle="light-content" />

                <Logo light height={50} /> 

                <CodeKeyBoard
                    ref={ref => (this.codeKeyBoard = ref)}

                    leftButton={I18N.t("Login.Pin.Forgotten")}
                    onLeftButtonPress={this.onAuthenticationFailed}
                    rightButton={{ type: "Image", source: FINGERPRINT_ICON }}
                    onRightButtonPress={this.onFingerprints}

                    onNumber={this.onNumber} />

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1E88E5",
    }
})