import React, { Component } from 'react';
import { View, Image, StyleSheet, ScrollView } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

import { Button } from '../../../Common/Button';
import TextInput from '../../../Common/TextInput';
import AskForPermission from "../../../Common/AskForPermission"
import Typography from "../../../Common/Typography"

import I18N from "../../../Translation/Config"

import OtpView from "./OtpView"

import Database from "../../../Utils/Database"

export default class ShowView extends Component {

    state = {
        site: "",
        url: "",
        otp: undefined,
        login: "",
        password: ""
    }

    componentDidMount() {

        this.UnsubscribeUpdate = Database.listeningChangesFor(this.props.password_data.id, data => {
            this.setState(data)
        })

        /*  this.UnsubscribeUpdate = getPassword(this.props.password_data.documentRef, data => {
              this.setState(data)
          })*/
    }

    componentWillUnmount() {
        this.UnsubscribeUpdate && this.UnsubscribeUpdate()
    }

    back = _ => {
        this.UnsubscribeUpdate && this.UnsubscribeUpdate()
        this.props.navigator.pop()
    }

    goToEdit = _ => {
        this.permission.Ask().then(_ => {
            this.props.navigator.push('EditView', { password_data: this.props.password_data, DetailPage: this }, { animation: 'right' })
        })
    }

    render() {

        const urlValid = this.state.url != "https://" && this.state.url != "http://" && this.state.url != ""

        return <>
            <AskForPermission ref={e => this.permission = e} type="edit_account" />

            { /* -------------- HEADER -------------- */}

            <View style={styles.HeaderBlock}>

                <Button onPress={this.back}>
                    <Icon name="chevron-left" size={22} color="#000" />
                </Button>

                <Typography.Header level={2} numberOfLines={1} style={styles.HeaderName}>
                    {urlValid && <Image style={styles.HeaderLogo} source={{ uri: "https://logo.clearbit.com/" + (this.state.url || "").replace("https://", "") }} />}
                    {urlValid && " "}
                    {this.state.site}
                </Typography.Header>

                <Button onPress={this.goToEdit}>
                    <Icon name="edit-2" size={22} color="#000" />
                </Button>

            </View>

            { /* -------------- HEADER -------------- */}



            { /* -------------- MAIN -------------- */}

            <ScrollView contentContainerStyle={styles.FormBlock}>

                <OtpView otp={this.state.otp || this.state.tfa} />

                <TextInput name={I18N.t("Input.Email")} editable={false} value={this.state.login} copy />
                <TextInput name={I18N.t("Input.Password")} editable={false} value={this.state.password} secure password showhide copy />

                {urlValid && <TextInput name={I18N.t("Input.URL")} editable={false} value={this.state.url} open />}

            </ScrollView>

            { /* -------------- MAIN -------------- */}

        </>
    }
}

const styles = StyleSheet.create({
    HeaderBlock: {
        borderBottomColor: "#DDD",
        borderBottomWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15
    },
    HeaderLogo: {
        height: 25,
        width: 25
    },
    HeaderName: {
        flex: 1,
        textAlign: "center",
        paddingHorizontal: 15
    },
    FormBlock: {
        alignSelf: "center",
        width: "90%",
    }
})