import React, { Component } from 'react'
import { View, StyleSheet, Image, ScrollView, Alert } from 'react-native'

import Icon from 'react-native-vector-icons/Feather'

import TextInput from '../../../Common/TextInput'
import { Button, ButtonStyle } from '../../../Common/Button'
import Typography from "../../../Common/Typography"

import Database from "../../../Utils/Database"

import I18N from "../../../Translation/Config"

import PasswordGenerator from './PasswordGenerator'
import OtpEditor from './OtpEditor'

export default class EditView extends Component {

    state = {
        login: "",
        password: "",
        site: "",
        url: "https://",
        otp: undefined
    }

    back = this.props.navigator.pop

    componentDidMount() {

        if (this.props.password_data?.id) {
            this.UnsubscribeUpdate = Database.listeningChangesFor(this.props.password_data.id, data => {
                this.setState(data)
            })
        }

        // Arrivée du scan OTP
        if (this.props.otp && this.props.OTP_SCAN) this.action_with_otp(this.props.otp)
    }

    componentWillUnmount() {
        this.UnsubscribeUpdate && this.UnsubscribeUpdate()
    }

    save = _ => {

        const data = {
            userId: this.props?.password_data?.userId,
            site: this.site.value(),
            url: this.url.value(),
            login: this.login.value(),
            password: this.password.value(),
            otp: this.otpEditor.data()
        }

        if (this.props.password_data?.id) {
            Database.editItem(this.props.password_data.id, data)
        } else {
            Database.createPassword(data, this.props?.password_data?.parentId)
        }

        Alert.alert(this.props.password_data ? I18N.t("Edit.EditTitle") : I18N.t("Edit.AddTitle"), I18N.t("Edit.Sucess"))
        this.back()

    }

    delete_accounts = _ => {

        const otpUsed = this.otpEditor.data() != undefined

        Alert.alert(I18N.t("Edit.DeleteAccount.Title"), (otpUsed ? I18N.t("Edit.DeleteAccount.MessageTfaOn") : I18N.t("Edit.DeleteAccount.MessageTfaOff")), [
            otpUsed ? {} : {
                text: I18N.t("Button.Cancel"),
                onPress: () => null,
                style: 'cancel',
            },

            otpUsed ? {} : { text: I18N.t("Button.Delete"), onPress: this.delete_accounts_sure },

        ], { cancelable: true })
    }

    delete_accounts_sure = _ => {

        this.props.DetailPage.UnsubscribeUpdate && this.props.DetailPage.UnsubscribeUpdate()
        this.UnsubscribeUpdate && this.UnsubscribeUpdate()

        Database.deleteItem(this.props.password_data.id)

        this.props.navigator.popTo(this.props.navigator.stack[0].id, { animation: "fade" })
    }

    onGenerateNewPassword = pwd => {
        this.password.show()
        this.setState({ password: pwd })
    }

    isUrlValid = _ => this.state.url != "https://" && this.state.url != "http://" && this.state.url != ""

    render() {

        const urlValid = this.isUrlValid()

        return (
            <>

                { /* -------------- HEADER -------------- */}

                <View style={styles.HeaderBlock}>

                    <Button onPress={this.back}>
                        <Icon name="chevron-left" size={22} color="#000" />
                    </Button>

                    {
                        this.state.site ?
                            <Typography.Header numberOfLines={1} style={styles.HeaderName}>
                                {urlValid && <Image style={styles.HeaderLogo} source={{ uri: "https://logo.clearbit.com/" + (this.state.url || "").replace("https://", "") }} />}
                                {urlValid && " "}
                                {this.state.site}
                            </Typography.Header>
                            :
                            <Typography.Header numberOfLines={1} style={styles.HeaderName}>{I18N.t("Edit.AddTitle")}</Typography.Header>
                    }

                    <Button onPress={this.save} dark>
                        <Icon name="check" size={22} color="#fff" />
                    </Button>

                </View>
                { /* -------------- HEADER -------------- */}



                { /* -------------- MAIN -------------- */}

                <ScrollView keyboardShouldPersistTaps='handled' contentContainerStyle={styles.FormBlock}>

                    <TextInput
                        name={I18N.t("Input.WebSite")}
                        ref={e => this.site = e}
                        returnKeyType={"next"}
                        onSubmitEditing={this.url?.focus}
                        value={this.state.site} />

                    <TextInput
                        ref={e => this.url = e}
                        name={I18N.t("Input.URL")}
                        onSubmitEditing={this.login?.focus}
                        returnKeyType={"next"}
                        value={this.state.url}
                        link />

                    <TextInput
                        name={I18N.t("Input.Login")}
                        ref={e => this.login = e}
                        returnKeyType={"next"}
                        onSubmitEditing={this.password?.focus}
                        value={this.state.login}
                        autoCompleteType={"off"}
                        autoCorrect={false} />

                    <TextInput
                        name={I18N.t("Input.Password")}
                        ref={e => this.password = e}
                        value={this.state.password}
                        autoCompleteType={"off"}
                        password
                        showhide />

                    <PasswordGenerator onGenerateNewPassword={this.onGenerateNewPassword} />

                    <OtpEditor
                        ref={r => this.otpEditor = r}
                        otp={this.state.otp || this.state.tfa}
                        setParentState={data => this.setState(data)}
                        navigator={this.props.navigator}
                    />

                    {this.props?.password_data?.id ?
                        <>
                            <Typography.Header level={2} style={{ marginBottom: 5 }}>{I18N.t("Edit.DangerZone")}</Typography.Header>

                            <Button onPress={this.delete_accounts} red mixed>
                                <Icon style={ButtonStyle.IconText} name="trash" size={22} color="#fff" />
                                <Typography.Text style={ButtonStyle.TextWhite}>{I18N.t("Edit.DeleteAccount.Button")}</Typography.Text>
                            </Button>
                        </>
                        : null}

                </ScrollView>

                { /* -------------- MAIN -------------- */}
            </>
        );
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
        height: 20,
        width: 20
    },
    HeaderName: {
        flex: 1,
        textAlign: "center",
        paddingHorizontal: 15
    },
    FormBlock: {
        alignSelf: "center",
        width: "90%",
        paddingBottom: 25
    }
});