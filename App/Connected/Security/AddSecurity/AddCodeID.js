import React, { Component } from 'react';
import { View, Vibration, Text, TouchableNativeFeedback, StyleSheet, Alert } from 'react-native';

import FingerprintScanner from 'react-native-fingerprint-scanner';
import * as Keychain from 'react-native-keychain';

import Logo from "../../../Common/Logo"
import Typography from "../../../Common/Typography"
import CodeKeyBoard from '../../../Common/CodeKeyBoard';

import I18N from "../../../Translation/Config"

export default class AddPinPage extends Component {

    constructor(props) {
        super(props)

        this.state = {
            firstCode: "",
            title: I18N.t("AddPinPage.AddPin")
        }
    }

    onValidPress = code => {
        if (this.state.firstCode === "") {
            if(code.length >= 4) this.setState({ firstCode: code, title: I18N.t("AddPinPage.Retype") }, this.codeKeyBoard.clear)
        } else {
            if (code === this.state.firstCode) {

                //On enregistre le code pin
                Keychain.setInternetCredentials("AUTH-TYPE", "_", this.props.TYPE.toString())
                Keychain.setInternetCredentials("AUTH-CODE", "_", code)
                Keychain.resetInternetCredentials("IDENTITY_VERIFICATION_FINGERPRINT")

                // TODO: Faire un screen a par pour l'ajout du fingerprint
                FingerprintScanner.release()
                FingerprintScanner
                    .isSensorAvailable()
                    .then(_ => {
                        Alert.alert(I18N.t("AddPinPage.PinSaved"), I18N.t("AddPinPage.FingerPrint.Asking"), [
                            {
                                text: I18N.t("Button.No"), onPress: _ => {
                                    this.props.onAuthenticationAdded()
                                    FingerprintScanner.release()
                                }
                            },
                            {
                                text: I18N.t("Button.Yes"),
                                onPress: () => {
                                    FingerprintScanner
                                        .authenticate({
                                            title: I18N.t("AddPinPage.FingerPrint.Title"),
                                            description: I18N.t("AddPinPage.FingerPrint.Description"),
                                            cancelButton: I18N.t("Button.Cancel")
                                        })
                                        .then(_ => {

                                            Keychain.setInternetCredentials("IDENTITY_VERIFICATION_FINGERPRINT", "_", "true")

                                            Alert.alert(I18N.t("AddPinPage.FingerPrint.Title"), I18N.t("AddPinPage.FingerPrint.Sucess"))
                                            FingerprintScanner.release()
                                            this.props.onAuthenticationAdded()

                                        }).catch(err => {
                                            Alert.alert(I18N.t("AddPinPage.FingerPrint.Title"), I18N.t("AddPinPage.FingerPrint.Error"))
                                            FingerprintScanner.release()
                                            this.props.onAuthenticationAdded()
                                        })
                                },
                            },
                        ], { cancelable: false })

                    }).catch(_ => {
                        Alert.alert(I18N.t("AddPinPage.PinSaved"), I18N.t("AddPinPage.Sucess"))
                        this.props.onAuthenticationAdded()
                    })

            } else {
                this.codeKeyBoard.failed()
            }
        }
    }

    onCancelPress = code => {
        if (this.state.firstCode != "" && code.length === 0) {
            this.setState({
                title: I18N.t("AddPinPage.AddPin"),
                firstCode: ""
            })
        }

        this.codeKeyBoard.clear()
    }

    render() {
        return (
            <View style={styles.container}>

                <Logo size={35} />

                <Typography.Header level={2} style={styles.Title}>{this.state.title}</Typography.Header>

                <CodeKeyBoard
                    ref={ref => (this.codeKeyBoard = ref)}
                    numberColor="#1E88E5"
                    colorTheme='light'
                    keyboardColor="#000000"
                    leftButton={{ type: "Icon", icon: "x", color: "#000" }}
                    onLeftButtonPress={this.onCancelPress}
                    rightButton={{ type: "Icon", icon: "check" }}
                    onRightButtonPress={this.onValidPress}
                />

            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    Title: {
        marginTop: 25
    }
})