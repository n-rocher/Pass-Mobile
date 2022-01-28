import React, { Component } from 'react';
import { View, Alert, Modal, ToastAndroid, TouchableOpacity, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import FingerprintScanner from 'react-native-fingerprint-scanner';
import * as Keychain from 'react-native-keychain';

import CodeKeyBoard from "../Common/CodeKeyBoard"
import Typography from "../Common/Typography"
import I18N from "../Translation/Config.js"

export default class AskForPermission extends Component {

    constructor(props) {
        super(props)

        this.state = {
            modalVisible: false,
            lastDate: null,
            try: 3
        }
    }

    setModalVisible(visible) {
        this.setState({ modalVisible: visible });
    }

    // Methode se chargeant de tout 
    Ask = _ => {
        return new Promise(async (resolve, reject) => {

            switch (this.props.type) {
                case "password":
                    const pref_password = await Keychain.getInternetCredentials("IDENTITY_VERIFICATION_PASSWORD")
                    if (pref_password != false && JSON.parse(pref_password.password) == false) {
                        resolve()
                        return
                    }
                    break;
                case "edit_account":
                    const pref_edit_account = await Keychain.getInternetCredentials("IDENTITY_VERIFICATION_EDIT")
                    if (pref_edit_account != false && JSON.parse(pref_edit_account.password) == false) {
                        resolve()
                        return
                    }
                    break;
            }

            this.setState({
                modalVisible: false,
                numbers: [],
                numbersScreen: [false, false, false, false],
                try: 5
            })

            this.valid_permission = _ => {
                this.setState({ lastDate: (new Date()).getTime() })
                this.close()
                resolve()
            }

            this.reject_permission = _ => {
                this.close()
                Alert.alert(I18N.t("AskForPermission.Title"), I18N.t("AskForPermission.Error.UnIdentified"))
                reject()
            }

            const now = new Date()

            if (this.props.AskEveryTime || this.state.lastDate == null || (now.getTime() - this.state.lastDate) > 60000) {

                Keychain.getInternetCredentials("IDENTITY_VERIFICATION_FINGERPRINT").then(data => {
                    var val = false
                    if (data != false) {
                        val = JSON.parse(data.password)
                    }

                    if (val) {
                        // Affichage prompt empreinte digitale
                        this.authentication_fingerprint()
                    } else {
                        // Affichage prompt Code
                        this.setModalVisible(true)
                    }
                }).catch(err => {
                    console.error(err)
                })

            } else {
                this.valid_permission()
            }
        })
    }

    authentication_fingerprint = _ => {
        FingerprintScanner.release()
        FingerprintScanner
            .isSensorAvailable()
            .then(_ => {
                FingerprintScanner
                    .authenticate({
                        title: I18N.t("AskForPermission.FingerPrint.Title"),
                        description: I18N.t("AskForPermission.FingerPrint.Description"),
                        cancelButton: I18N.t("Button.Cancel")
                    })
                    .then(t => {
                        FingerprintScanner.release()
                        this.valid_permission()
                    }).catch(_ => {
                        FingerprintScanner.release()
                        this.setModalVisible(true)
                    })
            }).catch(_ => {
                this.setModalVisible(true)
            })
    }

    onNumber = async code => {
        this.digits = await Keychain.getInternetCredentials("AUTH-CODE")
        if (code.length === this.digits.password.length) {
            setTimeout(_ => {
                if (code === this.digits.password) {

                    // Code valide
                    this.valid_permission()

                } else {

                    // Code invalide
                    this.setState({
                        try: this.state.try - 1
                    }, _ => {
                        this.codeKeyBoard.failed()

                        if (this.state.try <= 3 && this.state.try > 0) {

                            // Si il y a entre 0 et 3 essais restant on affiche une bulle d'info
                            ToastAndroid.show(I18N.t("Login.Pin.RemainingTrials", { val: this.state.try }), ToastAndroid.SHORT)

                        } else if (this.state.try == 0) {

                            this.reject_permission()

                        }
                    })
                }
            }, 250)
        }
    }

    close = _ => {
        this.setModalVisible(false)
    }

    render() {
        return (
            <Modal
                animationType="slide"
                transparent={true}
                supportedOrientations="portrait"
                visible={this.state.modalVisible}
                onRequestClose={this.close}>
                <View style={styles.back}>
                    <View style={styles.inside}>

                        <TouchableOpacity
                            style={styles.CloseButton}
                            onPress={this.close}>
                            <Icon name="x" size={24} color="#fff" />
                        </TouchableOpacity>

                        <Typography.Header style={styles.Header}>{I18N.t("AskForPermission.Pin.Title")}</Typography.Header>

                        <CodeKeyBoard
                            ref={ref => (this.codeKeyBoard = ref)}
                            numberColorNotActive="rgba(255, 255, 255, 0.25)"
                            keyboardBorder
                            onNumber={this.onNumber}
                        />

                    </View>
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    back: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, .5)',
        justifyContent: "center",
        alignItems: "center"
    },
    inside: {
        borderRadius: 10,
        paddingHorizontal: 25,
        paddingVertical: 25,
        backgroundColor: 'rgba(0,0,0,.85)',
        alignItems: "center"
    },
    CloseButton: {
        position: "absolute",
        top: 15,
        left: 15
    },
    Header: {
        width: "80%",
        marginTop: 25,
        textAlign: "center",
        color: "#fff"
    }
});