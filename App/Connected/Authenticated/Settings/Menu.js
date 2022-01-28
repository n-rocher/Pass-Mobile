import React, { Component } from 'react';
import { View, ScrollView, TouchableNativeFeedback, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import I18N from "../../../Translation/Config"
import Typography from "../../../Common/Typography"

export default class Menu extends Component {

    animation = "fade"

    onPressAccount = _ => {
        this.props.navigator.push("Account", { ParentNavigator: this.props.ParentNavigator }, { animation: this.animation })
    }

    onPressSecurity = _ => {
        this.props.navigator.push("Security", { ParentNavigator: this.props.ParentNavigator }, { animation: this.animation })
    }

    onPressPreferences = _ => {
        this.props.navigator.push("Preferences", { ParentNavigator: this.props.ParentNavigator }, { animation: this.animation })
    }

    onPressPrivacy = _ => {
        this.props.navigator.push("Privacy", { ParentNavigator: this.props.ParentNavigator }, { animation: this.animation })
    }

    onPressAbout = _ => {
        this.props.navigator.push("About", { ParentNavigator: this.props.ParentNavigator }, { animation: this.animation })
    }

    onPressDevelopment = _ => {
        this.props.navigator.push("Development", { ParentNavigator: this.props.ParentNavigator }, { animation: this.animation })
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.ScrollBlock} keyboardShouldPersistTaps='handled'>
                <Typography.Header style={styles.H1}>{I18N.t("Settings.Menu")}</Typography.Header>
                <Link onPress={this.onPressAccount} icon="user" name={I18N.t("Settings.Account.Title")} />
                <Link onPress={this.onPressSecurity} icon="lock" name={I18N.t("Settings.Security.Title")} />
                <Link onPress={this.onPressPreferences} icon="settings" name={I18N.t("Settings.Preferences.Title")} />
                <Link onPress={this.onPressPrivacy} icon="shield" name={I18N.t("Settings.Privacy.Title")} />
                <Link onPress={this.onPressAbout} icon="help-circle" name={I18N.t("Settings.About.Title")} />
                {__DEV__ && <Link onPress={this.onPressDevelopment} icon="sliders" name={"Development"} /> }
            </ScrollView>
        )
    }
}

class Link extends Component {
    render() {
        return (
            <View style={[styles.linkBlock, this.props.style]} >
                <TouchableNativeFeedback onPress={this.props.onPress} delayPressIn={0} background={TouchableNativeFeedback.SelectableBackground()}>
                    <View style={styles.linkBlockInside} pointerEvents='box-only'>
                        <Icon style={styles.linkBlockIcon} name={this.props.icon} size={22} color="#000" />
                        <Typography.Text style={styles.linkBlockText}>{this.props.name}</Typography.Text>
                    </View>
                </TouchableNativeFeedback>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    linkBlock: {
        borderRadius: 5,
        overflow: "hidden",
        marginVertical: 5
    },
    linkBlockInside: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 20
    },
    linkBlockIcon: {
        marginHorizontal: 10
    },
    linkBlockText: {
        marginLeft: 5
    },
    ScrollBlock: {
        minHeight: 150,
        alignSelf: "center",
        width: "90%"
    },
    H1: {
        marginTop: 25,
        marginBottom: 15
    }
})