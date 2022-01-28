import React, { Component } from 'react'
import { ScrollView, View, StyleSheet, StatusBar, ActivityIndicator, Alert } from 'react-native'

import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth'
import changeNavigationBarColor from 'react-native-navigation-bar-color'
import Icon from 'react-native-vector-icons/Feather'

import Button, { ButtonStyle } from "../Common/Button"
import Typography from "../Common/Typography"
import Logo from '../Common/Logo'

import { RSA } from "@egendata/react-native-simple-crypto"

import { refuseDevice, allowDevice } from "../API/Data" //FIXME: To change this
import I18N from "../Translation/Config"

import KeyManagement from "../Utils/KeyManagement"

import moment from "moment"
import 'moment/locale/fr'
moment.locale('fr')

export default class AskingKey extends Component {

    LOADING = "LOADING"
    DONE = "DONE"
    NETWORK_ERROR = "NETWORK_ERROR"
    NOT_FOUND = "NOT_FOUND"

    state = {
        state: this.LOADING,
        os: "",
        location: ""
    }

    constructor(props) {
        super(props)
        this.uid = auth().currentUser.uid
    }

    componentDidMount() {
        this.props.onReady && this.props.onReady()
        changeNavigationBarColor("#FFFFFF", true)
        this.getDeviceInfo()
    }

    getDeviceInfo = _ => {
        this.setState({ state: this.LOADING })

        firestore()
            .doc(`Users/${this.uid}/Devices/${this.props.deviceID}`)
            .get()
            .then(snap => {
                const data = snap.data()
                if (snap.exists && data && data.state === "WAITING_FOR_KEY") {
                    this.setState({ ...data, state: this.DONE })
                } else {
                    this.setState({ state: this.NOT_FOUND })
                }
            })
            .catch(err => {
                this.setState({ state: this.NETWORK_ERROR })
            })
    }

    refuseDevice = _ => {
        refuseDevice(this.props.deviceID, this.props.onExit)
    }

    allowDevice = async _ => {

        const key = JSON.stringify(Array.from(await KeyManagement.get_key()))

        if (key !== false) {

            RSA.encrypt(key, this.state.publicKey).then(encrypted_key => {

                allowDevice(this.props.deviceID, encrypted_key)
                    .then(this.props.onExit)
                    .catch(err => {
                        console.error(err)
                        Alert.alert("Clients connectés", err.message)
                    })

            }).catch(err => {
                console.error(err)
                Alert.alert("Clients connectés", "Erreur lors du chiffrement de votre clé privée. \n\n" + err.message) //FIXME: Traduction
            })
        } else {
            Alert.alert("Clients connectés", "Erreur lors de l'accès à votre clé privée.") //FIXME: Traduction
        }

    }

    render() {
        return <ScrollView style={{flex:1}} contentContainerStyle={styles.Page}>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            {this.state.state === this.LOADING && this.render_LOADING()}
            {this.state.state === this.DONE && this.render_DONE()}
            {this.state.state === this.NETWORK_ERROR && this.render_NETWORK_ERROR()}
            {this.state.state === this.NOT_FOUND && this.render_NOT_FOUND()}
        </ScrollView>
    }

    render_LOADING() {
        return <>
            <ActivityIndicator style={{ marginBottom: 15 }} color="#1E88E5" animating={true} size="large" />
            <Typography.Header level={2} style={styles.Loading}>{I18N.t("Loading.Data")}</Typography.Header>
        </>
    }

    render_NETWORK_ERROR() {
        return <>
            <Logo size={35} />

            <Typography.Header level={2}>{I18N.t("Error.Title")}</Typography.Header>
            <Typography.Text style={{...styles.H3, ...styles.Error}}>{I18N.t("Error.Internet")}</Typography.Text>
            <Button onPress={this.getDeviceInfo} mixed><Icon style={ButtonStyle.IconText} name="refresh-cw" size={22} /><Typography.Text style={ButtonStyle.Text}>{I18N.t("Button.RetryData")}</Typography.Text></Button>
        </>
    }

    render_NOT_FOUND() {
        return <>
            <Logo size={35} />

            <Typography.Header level={2}>{I18N.t("Error.Title")}</Typography.Header>
            <Typography.Text light style={{...styles.H3, ...styles.Error}}>{I18N.t("Error.AskingKeyEntityNotFound")}</Typography.Text>
            <Button onPress={this.props.onExit} mixed><Icon style={ButtonStyle.IconText} name="x" size={22} /><Typography.Text style={ButtonStyle.Text}>{I18N.t("Button.Close")}</Typography.Text></Button>
        </>
    }

    render_DONE() {
        const type = this.state.type == "desktop" ? I18N.t("Device.Computer") : (this.state.type == "mobile" ? I18N.t("Device.Phone") : I18N.t("Device.Other"))

        return <>
            <Logo size={35} style={{marginBottom: 25}} />

            <Typography.Header level={2}>{I18N.t("AskingKey.Title")}</Typography.Header>

            <Typography.Header level={3} style={styles.H2}>{I18N.t("AskingKey.DeviceType")}</Typography.Header>
            <Typography.Text>{type}</Typography.Text>

            <Typography.Header level={3} style={styles.H2}>{I18N.t("AskingKey.DeviceInformation")}</Typography.Header>
            <Typography.Text>{this.state.os}</Typography.Text>

            <Typography.Header level={3} style={styles.H2}>{I18N.t("AskingKey.Location")}</Typography.Header>
            <Typography.Text>{this.state.geo}</Typography.Text>

            <Typography.Header level={3} style={styles.H2}>{I18N.t("AskingKey.Date")}</Typography.Header>
            <Typography.Text>{moment(this.state.added).fromNow()}</Typography.Text>

            <Typography.Text light style={styles.H3}>{I18N.t("AskingKey.Warning")}</Typography.Text>

            <View style={styles.Aside}>
                <Button onPress={this.refuseDevice} red><Typography.Text style={ButtonStyle.TextWhite}>{I18N.t("Button.Deny")}</Typography.Text></Button>
                <Button onPress={this.allowDevice}><Typography.Text style={ButtonStyle.Text}>{I18N.t("Button.Accept")}</Typography.Text></Button>
            </View>
        </>
    }
}

const styles = StyleSheet.create({
    Aside: {
        flexDirection: "row",
        justifyContent: "space-between"
    },

    H2: {
        marginTop: 15,
    },
    H3: {
        fontSize: 13,
        marginVertical: 25,
        backgroundColor: "#eee",
        paddingVertical: 15,
        paddingHorizontal: 10,
        textAlign: "justify",
        borderRadius: 5
    },
    Error: {
        backgroundColor: "#FFC4C4"
    },
    Loading: {
        marginTop: 15,
        textAlign: "center"
    },
    Page: {
        backgroundColor: "white",
        padding: 25,
        height: "100%",
        justifyContent: "center"
    }
})