import React, { Component } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

import I18N from "../../../Translation/Config"
import Typography from "../../../Common/Typography"

export default class Preferences extends Component {
    constructor(props){
        super(props)

        this.state = {}
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.ScrollBlock} keyboardShouldPersistTaps='handled'>
                <Typography.Header style={styles.H1}>{I18N.t("Settings.Preferences.Title")}</Typography.Header>
                <Typography.Text style={styles.Corp}>{I18N.t("Settings.Preferences.Description")}</Typography.Text>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    ScrollBlock: {
        minHeight: 150,
        alignSelf: "center",
        width: "90%"
    },
    H1 : {
        marginTop:25,
        marginBottom:15
    },
    Corp: {
        marginBottom:25,
    }
})