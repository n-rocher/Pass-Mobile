import React, { Component } from 'react';
import { Alert, ScrollView, Text, TextInput, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import KeyManagement from '../../../Utils/KeyManagement';

import { Button, ButtonStyle } from '../../../Common/Button';
import Typography from "../../../Common/Typography"

import I18N from "../../../Translation/Config"

export default class Security extends Component {

    state = {
        key: ""
    }

    SHOW_KEY = async _ => {
        KeyManagement.get_key(KeyManagement.ONLINE).then(key => {
            this.setState({ key: "[" + key.toString() + "]" })
        })
    }

    CHANGE_KEY = async _ => {
        const { key } = this.state

        console.warn("BEFORE PARSE", key)

        const key_parsed = KeyManagement.parse_key(key)

        console.warn("AFTER PARSE", key_parsed)

        if (key_parsed === false) {
            Alert.alert(I18N.t("Settings.Security.SecretKey.Title"), "Clé non valide")
        } else {
            KeyManagement.set_key(key_parsed, KeyManagement.ONLINE).then(e => {
                Alert.alert(I18N.t("Settings.Security.SecretKey.Title"), "Clé valide et enregistrée !")
            })
        }
    }

    DELETE_KEY = async _ => {
        Alert.alert(I18N.t("Settings.Security.SecretKey.Title"), "non implémenté")
    }


    FIX_PASSWORD = _ => this.FIX_ITEM_TYPE("password")
    FIX_FOLDER = _ => this.FIX_ITEM_TYPE("folder")
    FIX_ITEM_TYPE = type => {
        console.error("FIX_ITEM_TYPE-" + type, "NOT IMPLEMENTED")
    }


    FIX_PARENT = _ => {
        console.error("FIX_PARENT", "NOT IMPLEMENTED")
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.ScrollBlock} keyboardShouldPersistTaps='handled'>

                <Typography.Header style={styles.H1}>Development</Typography.Header>

                <Typography.Header level={2} style={styles.H2}>{I18N.t("Settings.Security.SecretKey.Title")}</Typography.Header>

                <Button onPress={this.SHOW_KEY} mixed>
                    <Icon style={ButtonStyle.IconText} name="key" size={22} color="#000" />
                    <Typography.Text style={ButtonStyle.Text}>Show AES KEY</Typography.Text>
                </Button>


                <TextInput
                    multiline
                    numberOfLines={3}
                    style={{ marginVertical: 10, borderWidth: 1, color: "black" }}
                    onChangeText={text_key => this.setState({ key: text_key })}
                    value={this.state.key}
                />

                <Button onPress={this.CHANGE_KEY} mixed style={{ marginBottom: 15 }}>
                    <Icon style={ButtonStyle.IconText} name="key" size={22} color="#000" />
                    <Typography.Text style={ButtonStyle.Text}>Change AES KEY</Typography.Text>
                </Button>


                <Button onPress={this.DELETE_KEY} mixed >
                    <Icon style={ButtonStyle.IconText} name="key" size={22} color="#000" />
                    <Typography.Text style={ButtonStyle.Text}>Delete AES KEY</Typography.Text>
                </Button>

                <Typography.Header level={2} style={styles.H2}>Item fixing</Typography.Header>

                <Button onPress={this.FIX_FOLDER} mixed style={{ marginBottom: 15 }}>
                    <Icon style={ButtonStyle.IconText} name="folder" size={22} color="#000" />
                    <Typography.Text style={ButtonStyle.Text}>Fix type for folder</Typography.Text>
                </Button>

                <Button onPress={this.FIX_PASSWORD} mixed style={{ marginBottom: 15 }}>
                    <Icon style={ButtonStyle.IconText} name="user" size={22} color="#000" />
                    <Typography.Text style={ButtonStyle.Text}>Fix type for password</Typography.Text>
                </Button>

                <Button onPress={this.FIX_PARENT} mixed style={{ marginBottom: 15 }}>
                    <Icon style={ButtonStyle.IconText} name="archive" size={22} color="#000" />
                    <Typography.Text style={ButtonStyle.Text}>Fix parent</Typography.Text>
                </Button>


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
    }
})