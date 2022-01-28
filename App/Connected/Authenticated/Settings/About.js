import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

import Logo from "../../../Common/Logo"
import Typography from "../../../Common/Typography"

import { getVersion } from "react-native-device-info"

import I18N from "../../../Translation/Config"

export default function About() {
    return (
        <ScrollView contentContainerStyle={styles.ScrollBlock} keyboardShouldPersistTaps='handled'>
            <Typography.Header style={styles.H1}>{I18N.t("Settings.About.Title")}</Typography.Header>
            <Logo size={35} style={{ marginBottom: 25 }} />
            <Typography.Text style={styles.Corp}>{I18N.t("Settings.About.Version", { version: getVersion() })}</Typography.Text>
            <Typography.Text style={styles.Corp}>{I18N.t("Settings.About.CreatedInNantes")}</Typography.Text>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    ScrollBlock: {
        minHeight: 150,
        alignItems: "center"
    },
    H1: {
        marginVertical: 25
    },
    Corp: {
        marginBottom: 25,
    }
})