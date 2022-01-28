import React, { Component } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ToastAndroid } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import QRCodeScanner from 'react-native-qrcode-scanner';
import AsyncStorage from '@react-native-community/async-storage';

import { Button, ButtonStyle } from '../../Common/Button';
import Logo from '../../Common/Logo';

import KeyManagement from "../../Utils/KeyManagement"

import I18N from "../../Translation/Config"
import Typography from "../../Common/Typography"

import { askThePrivateKey } from "../../API/Data" //FIXME: REVOIR CE FICHIER

import { RSA } from "@egendata/react-native-simple-crypto";

import Synchronization from "../../Utils/Synchronization"

export default class PrivateKey extends Component {

    constructor(props) {
        super(props)

        this.state = {
            QrCode: false,
            ConnectedDevices: false,
            menu: true
        }
    }

    open_QR_CODE = _ => this.setState({ menu: false, QrCode: true, ConnectedDevices: false })
    open_CONNECTED_DEVICES = _ => this.setState({ menu: false, QrCode: false, ConnectedDevices: true }, this.connected_clients_method)
    back_to_menu = _ => this.setState({ menu: true, QrCode: false, ConnectedDevices: false })

    onQrCodeSuccess = async raw => {
        const data = raw.data

        if (data.indexOf("Pass-Key") === 0) {
            let possible_key = "[" + data.slice(8) + "]"
            if (this.test_key(possible_key) === false) {
                this.scanner.reactivate()
            }
        } else {
            this.scanner.reactivate()
            ToastAndroid.show("Cette clé est invalide.", ToastAndroid.SHORT) // TODO: Translation
        }
    }

    connected_clients_method = _ => {

        // Génération des clés RSA
        RSA.generateKeys(2048).then(keypair => {

            // On fait la demande
            askThePrivateKey(keypair.public).then(({ data, deviceID }) => {

                // Si on reçoit des données, on les déchiffre
                RSA.decrypt(data.encrypted_key, keypair.private).then(decrypted => {

                    AsyncStorage.setItem('deviceID', deviceID)
                    this.test_key(decrypted, deviceID)

                }).catch(err => {
                    console.error("Erreur lors du dechiffrage de la clé.")
                    console.dir(err)
                    Alert.alert("Client connectés", "Erreur lors du dechiffrage de la clé.") //TODO: Translation
                })

            }).catch(err => {

                const message = {
                    "NO_CONNECTED_DEVICE": "Aucun appareil est connecté à votre compte.", //TODO: Translation
                    "UNKNOW_STATE": "Etat inconnu.", //TODO: Translation
                    "CREATING_DEMAND": "Une erreur est survenue lors de la création de la demande. Veuillez reessayer." //TODO: Translation
                }

                let err_message = message[err]

                if (err_message === undefined) {
                    console.warn("Erreur Clients Connectés", err)
                    err_message = "Erreur inconnu."
                }

                Alert.alert("Client connectés", err_message) //TODO: Translation
            })

        }).catch(err => {
            Alert.alert("Client connectés", "Une erreur est survenue lors de la génération de votre clé privée RSA pour transferer votre clé privée en toute sécurité. Veuillez reessayer.") //TODO: Translation
        })
    }

    test_key = async (key_raw, deviceID = false) => {

        const key = KeyManagement.parse_key(key_raw)

        let valid_key = key !== false

        if (valid_key) {

            valid_key = false

            try {
                const verificationKey = await Synchronization.getVerificationKey()

                if (verificationKey.exist && Synchronization.testKey(verificationKey.verificationKey, key)) {
                    valid_key = true
                } 

            } catch (err) {
                console.error("PrivateKey -> Synchronization.testKey", err)
            }

            if (valid_key) {
                ToastAndroid.show("Cette clé est valide !", ToastAndroid.SHORT) // TODO: Translation

                await KeyManagement.set_key(key, KeyManagement.ONLINE)
                this.props.onKeyLoaded(deviceID)

                return true
            }

        }

        if (!valid_key) {
            ToastAndroid.show("Cette clé est invalide.", ToastAndroid.SHORT) // TODO: Translation
            return false
        }

    }

    // TODO: Si il a perdu sa clé
    //       --> On demande email + mot de passe
    //       --> Il recoit un mail avec un lien pour supprimer ses données
    //       --> Il se reconnecte et une clé est créé

    render() { // TODO: Translation
        return (
            <View style={styles.container}>
                <Logo size={35} />

                {
                    this.state.QrCode && <>
                        <QRCodeScanner
                            ref={(node) => { this.scanner = node }}
                            onRead={this.onQrCodeSuccess}
                            showMarker={true}
                        />
                        <Button onPress={this.back_to_menu} mixed>
                            <Icon style={ButtonStyle.IconText} name="chevron-left" size={22} color="#000" />
                            <Typography.Text style={ButtonStyle.Text}>{I18N.t("Button.Back")}</Typography.Text>
                        </Button>
                    </>
                }

                {this.state.ConnectedDevices &&
                    <>
                        <Typography.Header level={2} style={styles.Title}>Clients connectés</Typography.Header>
                        <Typography.Text style={styles.ConnectedDevicesInfo}>Veuillez ouvrir un de vos clients déjà connecté à votre compte et acceptez la connection.{"\n"}Vérifiez aussi si il s'agit bien de vous avec les informations affichées sur l'autre client.</Typography.Text>

                        <ActivityIndicator style={{ marginTop: 25, marginBottom: 15 }} color="#1E88E5" animating={true} size="large" />

                        <Typography.Text style={{ ...styles.ConnectedDevicesInfo, textAlign: "center" }}>En attente de la réception d'information...</Typography.Text>
                    </>
                }

                {this.state.menu &&
                    <>
                        <Typography.Header level={2} style={styles.Title}>Récupération de la clé secrète pour la synchronisation en ligne</Typography.Header>

                        <Typography.Text style={styles.Info}>Vous pouvez récupèrer votre clé secrète via les paramètres "Sécurité" d'un de vos clients déjà connecté.</Typography.Text>

                        <Button onPress={this.open_QR_CODE} mixed style={{ marginVertical: 7.5 }}>
                            <Icon style={ButtonStyle.IconText} name="camera" size={22} color="#000" />
                            <Typography.Text style={ButtonStyle.Text}>{I18N.t("Edit.TFA.Button")}</Typography.Text>
                        </Button>

                        <Button onPress={this.open_CONNECTED_DEVICES} mixed style={{ marginVertical: 7.5 }}>
                            <Icon style={ButtonStyle.IconText} name="smartphone" size={22} color="#000" />
                            <Typography.Text style={ButtonStyle.Text}>Clients connectés</Typography.Text>
                        </Button>
                    </>
                }

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },

    QrCode: {
        width: 40,
        height: 40,
    },

    Title: {
        marginVertical: 25,
        textAlign: "center"
    },

    Info: {
        width: "90%",
        marginBottom: 25
    },

    ConnectedDevicesInfo: {
        width: "90%",
        marginBottom: 25
    }
})