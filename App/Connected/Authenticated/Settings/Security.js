import React, { Component } from 'react';
import { Alert, ScrollView, View, StyleSheet, Dimensions  } from 'react-native';

import Modal from 'react-native-modal'

import Icon from 'react-native-vector-icons/Feather';
import FingerprintScanner from 'react-native-fingerprint-scanner';
import * as Keychain from 'react-native-keychain';
import QRCode from 'react-native-qr-generator'

import { Button, ButtonStyle } from '../../../Common/Button';
import { RadioBox, CheckBox } from '../../../Common/FormElement';
import AskForPermission from "../../../Common/AskForPermission"
import Typography from "../../../Common/Typography"

import KeyManagement from "../../../Utils/KeyManagement"

import I18N from "../../../Translation/Config"

export default class Security extends Component {
    constructor(props) {
        super(props)

        this.state = {
            IDENTITY_VERIFICATION_FINGERPRINT: true,
            IDENTITY_VERIFICATION_PASSWORD: true,
            IDENTITY_VERIFICATION_EDIT: true,
            IDENTITY_VERIFICATION_APP: true,
            USING_PASS_TRUST: false,
            KeyModal: null,
        }
    }

    componentDidMount() {
        this.get_setting("IDENTITY_VERIFICATION_FINGERPRINT", false)
        this.get_setting("IDENTITY_VERIFICATION_PASSWORD", true)
        this.get_setting("IDENTITY_VERIFICATION_EDIT", true)
        this.get_setting("IDENTITY_VERIFICATION_APP", true)
        this.get_setting("USING_PASS_TRUST", false)
    }

    get_setting = (name, df) => {
        Keychain.getInternetCredentials(name).then(data => {
            var val = df
            if (data != false) {
                val = JSON.parse(data.password)
            }
            var obj = {}
            obj[name] = val
            this.setState(obj)
        })
    }

    set_setting = (name, value) => {
        Keychain.setInternetCredentials(name, "_", JSON.stringify(value)).then(_ => {
            var obj = {}
            obj[name] = value
            this.setState(obj)
        })
    }

    IDENTITY_VERIFICATION_FINGERPRINT = _ => {
        this.permission.Ask().then(_ => {
            if (this.state.IDENTITY_VERIFICATION_FINGERPRINT == true) {
                this.set_setting("IDENTITY_VERIFICATION_FINGERPRINT", false)
            } else {
                this.verif_fingerprint().then(_ => {
                    this.set_setting("IDENTITY_VERIFICATION_FINGERPRINT", true)
                })
            }
        })
    }

    verif_fingerprint = _ => new Promise((resolve, _) => {
        FingerprintScanner
            .isSensorAvailable()
            .then(_ => {
                FingerprintScanner
                    .authenticate({
                        title: I18N.t("Settings.Security.FingerPrint.Title"),
                        description: I18N.t("Settings.Security.FingerPrint.Description"),
                        cancelButton: I18N.t("Button.Cancel")
                    })
                    .then(_ => {

                        resolve()
                        FingerprintScanner.release()

                    }).catch(err => {

                        Alert.alert(I18N.t("Settings.Security.FingerPrint.Title"), I18N.t("Settings.Security.FingerPrint.Error.Rejected"))
                        FingerprintScanner.release()

                    })
            }).catch(_ => {
                Alert.alert(I18N.t("Settings.Security.FingerPrint.Title"), I18N.t("Settings.Security.FingerPrint.Error.NoSensor"))
            })
    })

    IDENTITY_VERIFICATION_PASSWORD = _ => {
        this.permission.Ask()
            .then(_ => {
                this.set_setting("IDENTITY_VERIFICATION_PASSWORD", !this.state.IDENTITY_VERIFICATION_PASSWORD)
            })
    }

    IDENTITY_VERIFICATION_EDIT = _ => {
        this.permission.Ask()
            .then(_ => {
                this.set_setting("IDENTITY_VERIFICATION_EDIT", !this.state.IDENTITY_VERIFICATION_EDIT)
            })
    }

    IDENTITY_VERIFICATION_APP = _ => {
        this.permission.Ask()
            .then(_ => {
                this.set_setting("IDENTITY_VERIFICATION_APP", !this.state.IDENTITY_VERIFICATION_APP)
            })
    }

    USING_PASS_TRUST = _ => {
        this.permission.Ask()
            .then(_ => {

                // TODO: Change the account strategie
                Alert.alert("Clé secrète", "Non disponible pour le moment")
                this.set_setting("USING_PASS_TRUST", true)

            })
    }

    USING_CLIENT_SHARE = _ => {
        this.permission.Ask()
            .then(_ => {

                // TODO: Change the account strategie
                Alert.alert("Clé secrète", "Non disponible pour le moment")
                this.set_setting("USING_PASS_TRUST", false)

            })
    }

    EDIT_PIN_CODE = _ => {
        this.permission.Ask()
            .then(_ => {
                this.props.navigator.push("ChangePinCode", {
                    onEditingDone: _ => this.props.navigator.pop({ animation: 'left' })
                }, { animation: 'none' })
            })
    }

    SHOW_KEY = _ => {
        this.permission.Ask()
            .then(async _ => {
                const key = await KeyManagement.get_key(KeyManagement.ONLINE)
                this.setState({ KeyModal: JSON.stringify(key) })
            })
    }

    render() {

        const qrcode_width = Dimensions.get('window').width * 0.75

        return (
            <ScrollView contentContainerStyle={styles.ScrollBlock} keyboardShouldPersistTaps='handled'>

                <AskForPermission ref={e => this.permission = e} AskEveryTime />

                <Typography.Header style={styles.H1}>{I18N.t("Settings.Security.Title")}</Typography.Header>

                <Typography.Header level={2} style={styles.H2}>{I18N.t("Settings.Security.IdentityValidation.Title")}</Typography.Header>
                <Typography.Text style={styles.Corp}>{I18N.t("Settings.Security.IdentityValidation.Description")}</Typography.Text>
                <Button onPress={this.EDIT_PIN_CODE} mixed style={{ marginBottom: 15 }}>
                    <Icon style={ButtonStyle.IconText} name="shield" size={22} color="#000" />
                    <Typography.Text style={ButtonStyle.Text}>{I18N.t("Settings.Security.IdentityValidation.EditPin.Button")}</Typography.Text>
                </Button>
                <CheckBox
                    onPress={this.IDENTITY_VERIFICATION_FINGERPRINT}
                    checked={this.state.IDENTITY_VERIFICATION_FINGERPRINT}
                    text={I18N.t("Settings.Security.IdentityValidation.FingerPrint.Title")}
                    subText={I18N.t("Settings.Security.IdentityValidation.FingerPrint.Description")}
                />



                <Typography.Header level={2} style={styles.H2}>{I18N.t("Settings.Security.InsideApp.Title")}</Typography.Header>
                <Typography.Text style={styles.Corp}>{I18N.t("Settings.Security.InsideApp.Description")}</Typography.Text>
                <CheckBox
                    onPress={this.IDENTITY_VERIFICATION_PASSWORD}
                    checked={this.state.IDENTITY_VERIFICATION_PASSWORD}
                    text={I18N.t("Settings.Security.InsideApp.Password.Title")}
                    subText={I18N.t("Settings.Security.InsideApp.Password.Description")}
                />
                <CheckBox
                    onPress={this.IDENTITY_VERIFICATION_EDIT}
                    checked={this.state.IDENTITY_VERIFICATION_EDIT}
                    text={I18N.t("Settings.Security.InsideApp.EditAccount.Title")}
                    subText={I18N.t("Settings.Security.InsideApp.EditAccount.Description")}
                />
                <CheckBox
                    onPress={this.IDENTITY_VERIFICATION_APP}
                    checked={this.state.IDENTITY_VERIFICATION_APP}
                    text={I18N.t("Settings.Security.InsideApp.App.Title")}
                    subText={I18N.t("Settings.Security.InsideApp.App.Description")}
                />



                <Typography.Header level={2} style={styles.H2}>{I18N.t("Settings.Security.DataProtection.Title")}</Typography.Header>
                <Typography.Text style={styles.Corp}>{I18N.t("Settings.Security.DataProtection.Description")}</Typography.Text>

                {
                    /*
                <RadioBox
                    onPress={this.USING_PASS_TRUST}
                    selected={this.state.USING_PASS_TRUST}
                    text={I18N.t("Settings.Security.DataProtection.PassTrust.Title")}
                    subText={I18N.t("Settings.Security.DataProtection.PassTrust.Description")}
                />
                    */
                }


                <RadioBox
                    //onPress={this.USING_PASS_TRUST}
                    selected={!this.state.USING_PASS_TRUST}
                    text={I18N.t("Settings.Security.DataProtection.SharingBetweenClient.Title")}
                    subText={I18N.t("Settings.Security.DataProtection.SharingBetweenClient.Description")} />


                <Typography.Header level={2} style={styles.H2}>{I18N.t("Settings.Security.SecretKey.Title")}</Typography.Header>
                <Typography.Text style={styles.Corp}>{I18N.t("Settings.Security.SecretKey.Description")}</Typography.Text>
                <Button onPress={this.SHOW_KEY} mixed >
                    <Icon style={ButtonStyle.IconText} name="key" size={22} color="#000" />
                    <Typography.Text style={ButtonStyle.Text}>{I18N.t("Settings.Security.SecretKey.ShowKey.Button")}</Typography.Text>
                </Button>

                <Modal
                    isVisible={!!this.state.KeyModal}
                    useNativeDriver={true}
                    onBackButtonPress={_ => this.setState({ KeyModal: null })}
                    onBackdropPress={_ => this.setState({ KeyModal: null })}>
                    <View style={styles.ModalContainer}>
                        <QRCode
                            value={"Pass-Key" + this.state.KeyModal}
                            size={qrcode_width}
                            bgColor='black'
                            fgColor='white' />
                    </View>
                </Modal>

            </ScrollView>
        )
    }
}

const styles = StyleSheet.create({
    ScrollBlock: {
        minHeight: 150,
        alignSelf: "center",
        width: "90%"
    },
    H1: {
        textAlign: "center",
        marginTop: 25
    },
    H2: {
        marginTop: 25,
        marginBottom: 15
    },
    Corp: {
        marginBottom: 25
    },

    Aside: {
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    ModalContainer: {
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
    }
})