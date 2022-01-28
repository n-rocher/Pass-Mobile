import React, { Component } from 'react'
import { View, Text, TouchableNativeFeedback, Alert, StyleSheet } from 'react-native'

import Icon from 'react-native-vector-icons/Feather'

import Dropdown from '../../../Common/Dropdown'
import TextInput from '../../../Common/TextInput'
import Typography from '../../../Common/Typography'
import { Button, ButtonStyle } from '../../../Common/Button'

import I18N from "../../../Translation/Config"

const INITIAL_STATE = {
    secret: "",
    backup: "",
    digits: "6",
    period: "30",
    algorithm: "sha1",
    type: "authenticator",
    showMore: false
}

export default class OtpEditor extends Component {

    otpSecret = null
    otpDigits = null
    otpPeriod = null
    otpBackup = null
    otpChoice = null
    otpAlgo = null

    state = INITIAL_STATE

    componentDidUpdate(oldProps) {
        if (this.props != oldProps) {
            this.setState({
                algorithm: this.props.otp?.algorithm || "sha1",
                secret: this.props.otp?.secret,
                digits: this.props.otp?.digits || "6",
                period: this.props.otp?.period || "30",
                backup: this.props.otp?.backup,
                type: this.props.otp?.type || "authenticator",
            })
        }
    }

    data = _ => {
        let d = {
            algorithm: this.otpAlgo ? this.otpAlgo.value() : this.state.algorithm,
            secret: this.otpSecret ? this.otpSecret.value() : this.state.secret,
            digits: this.otpDigits ? this.otpDigits.value() : this.state.digits,
            period: this.otpPeriod ? this.otpPeriod.value() : this.state.period,
            type: this.otpChoice ? this.otpChoice.value() : this.state.type,
            backup: this.otpBackup ? this.otpBackup.value() : this.state.backup
        }

        return !!d.secret ? d : undefined
    }

    open_otp_SCAN = _ => {
        this.props.navigator.push("OtpQrCodeScanner", { ...this.props, otpEditor: true, onOtpFound: this.onOtpFound })
    }

    onOtpFound = otp => {

        if (otp.label.account) {
            this.props.setParentState({
                login: otp.label.account
            })
        }

        if (otp.query.issuer) {
            this.props.setParentState({
                site: otp.query.issuer
            })
        } else if (otp.label.issuer) {
            this.props.setParentState({
                site: otp.label.issuer
            })
        }

        if (["totp", "authenticator"].includes(otp.type)) {
            this.setState({
                algorithm: otp.query.algorithm.toLowerCase() || "sha1",
                secret: otp.query.secret,
                digits: otp.query.digits || "6",
                period: otp.query.period || "30",
                type: otp.type,
                period: otp.query.period
            })
        }
    }

    delete_otp = _ => {
        Alert.alert(I18N.t("Edit.DeleteTFA.Title"), I18N.t("Edit.DeleteTFA.Message"), [
            {
                text: I18N.t("Button.Cancel"),
                onPress: () => null,
                style: 'cancel',
            },
            {
                text: I18N.t("Button.Delete"), onPress: _ => {
                    this.setState(INITIAL_STATE)
                }
            },
        ], { cancelable: true })
    }

    showMore = _ => this.setState({ showMore: !this.state.showMore })

    render() {
        return (
            <View style={styles.Container}>

                <View style={styles.Header}>
                    <Typography.Header level={3} style={styles.HeaderTitle}>{I18N.t("Detail.Tfa.Title")}</Typography.Header>

                    <View style={styles.HeaderIcon}>
                        <TouchableNativeFeedback
                            onPress={this.generatePassword}
                            delayPressIn={0}
                            background={TouchableNativeFeedback.Ripple("#fff", false)}>
                            <View style={styles.HeaderIcon}>
                                <Icon name={"camera"} size={22} color="#fff" />
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>

                <View style={styles.Content}>

                    <Button onPress={this.open_otp_SCAN} mixed>
                        <Icon style={ButtonStyle.IconText} name="camera" size={22} color="#000" />
                        <Typography.Text style={ButtonStyle.Text}>{I18N.t("Edit.TFA.Button")}</Typography.Text>
                    </Button>

                    <View style={[styles.ShowMoreButtonContainer, (this.state.showMore ? styles.ShowMoreButtonOpened : styles.ShowMoreButtonClosed)]}>
                        <TouchableNativeFeedback
                            onPress={this.showMore}
                            delayPressIn={0}
                            background={TouchableNativeFeedback.Ripple("#CCC", false)}>
                            <View style={styles.ShowMoreButtonInside}>
                                <Icon name={"chevron-" + (!this.state.showMore ? "down" : "up")} size={16} color="#000" />
                                <Typography.Text style={styles.ShowMoreButtonText}>Options avancées</Typography.Text>
                                <Icon name={"chevron-" + (!this.state.showMore ? "down" : "up")} size={16} color="#000" />
                            </View>
                        </TouchableNativeFeedback>
                    </View>

                    {this.state.showMore &&
                        <>
                            <TextInput
                                name={"Secret"}
                                ref={e => this.otpSecret = e}
                                value={this.state.secret}
                                autoCompleteType={"off"}
                                noMarginTop
                                autoCorrect={false} />

                            <Dropdown
                                name="Type"
                                ref={e => this.otpChoice = e}
                                title="Choix du type"
                                defaultValue={this.state.type}
                                list={[{ value: "authenticator", text: "Authenticator (Défaut)" }, { value: "totp", text: "TOTP" }]}
                            />

                            <Dropdown
                                name="Algorithme"
                                ref={e => this.otpAlgo = e}
                                title="Choix de l'algorithme"
                                defaultValue={this.state.algorithm}
                                list={[{ value: "sha1", text: "SHA1 (Défaut)" }, { value: "sha256", text: "SHA256" }, { value: "sha512", text: "SHA512" }]}
                            />

                            <TextInput
                                name={"Nombre de chiffre (6 ou 8 chiffres)"}
                                ref={e => this.otpDigits = e}
                                value={this.state.digits.toString()}
                                maxLength={1}
                                keyboardType="number-pad" />

                            <TextInput
                                name={"Période"}
                                ref={e => this.otpPeriod = e}
                                value={this.state.period.toString()}
                                keyboardType="number-pad" />

                            <TextInput
                                name={"Codes de secours"}
                                ref={e => this.otpBackup = e}
                                multiline={true}
                                value={this.state.backup}
                                autoCompleteType={"off"}
                                autoCorrect={false} />

                            {this.state.secret != "" &&
                                <Button onPress={this.delete_otp} red mixed style={{ marginBottom: 15 }}>
                                    <Icon style={ButtonStyle.IconText} name="trash" size={22} color="#fff" />
                                    <Typography.Text style={ButtonStyle.TextWhite}>{I18N.t("Edit.DeleteTFA.Button")}</Typography.Text>
                                </Button>
                            }

                        </>
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    Container: {
        marginBottom: 20,
        borderRadius: 5,
        borderWidth: 1,
    },
    Header: {
        paddingHorizontal: 15,
        height: 50,
        backgroundColor: "black",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    HeaderIcon: {
        height: 35,
        width: 35,
        borderRadius: 100,
        overflow: "hidden",
        alignItems: "center",
        justifyContent: "center"
    },
    HeaderTitle: {
        color: "white"
    },
    Content: {
        flexDirection: "column",
        paddingHorizontal: 15,
        paddingTop: 15,
    },
    ShowMoreButtonContainer: {
        borderRadius: 5,
        overflow: "hidden"
    },
    ShowMoreButtonOpened: {
        marginTop: 15,
    },
    ShowMoreButtonClosed: {
        marginVertical: 15,
    },
    ShowMoreButtonInside: {
        borderRadius: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        height: 30
    },
    ShowMoreButtonText: {
        fontSize: 16,
        paddingHorizontal: 10
    }
})