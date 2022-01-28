import React, { Component } from 'react'
import { ScrollView, Text, StyleSheet } from 'react-native'

import * as Keychain from 'react-native-keychain';

import CodeKeyBoard from '../../../Common/CodeKeyBoard'
import Typography from '../../../Common/Typography'

import I18N from "../../../Translation/Config"

import BACKKEY_ICON from "../../../../images/backspace.png"

export default class ChangePinCode extends Component {

    state = {
        firstCode: "",
        title: I18N.t("Settings.Security.IdentityValidation.EditPin.Button")
    }

    onRightButtonPress = code => {
        if(this.state.firstCode === "") {
            this.setState({firstCode: code, title: I18N.t("AddPinPage.Retype")}, this.codeKeyBoard.clear)
        } else {
            if(code === this.state.firstCode) {
                Keychain.setInternetCredentials("AUTH-CODE", "_", code)
                this.props.onEditingDone()
            } else {
                this.codeKeyBoard.failed()
            }
        }
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.ScrollBlock}>
                <Typography.Header style={styles.H1}>{this.state.title}</Typography.Header>

                <CodeKeyBoard
                    ref={ref => (this.codeKeyBoard = ref)}
                    numberColor="#1E88E5"
                    keyboardColor="#000"

                    leftButton={{ type: "Image", source: BACKKEY_ICON, onPress: "REMOVE_LAST_DIGIT" }}
                    rightButton={{type:"Icon", icon:"check" }}
                    onRightButtonPress={this.onRightButtonPress}
                />
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
    }
})