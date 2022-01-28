import React from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback, ToastAndroid } from 'react-native';
import { TOTP, Authenticator } from '@otplib/core'
import { keyDecoder, keyEncoder } from '@otplib/plugin-thirty-two'
import { Svg, Circle } from 'react-native-svg';
import Icon from 'react-native-vector-icons/Feather';

import Clipboard from "@react-native-community/clipboard"

import I18N from "../../../Translation/Config"
import Typography from "../../../Common/Typography"

const { createDigest, createRandomBytes } = require("../../../Utils/crypto_util")

/*******************************************************************************************/
global.Buffer = global.Buffer || require('buffer').Buffer // Permet l'utilisation de otplib
/*******************************************************************************************/

export default class OtpView extends React.PureComponent {

    constructor(props) {
        super(props)

        this.state = {
            otp_token: "",
            seconds: 0,
            period: 0,
            circleValue: 0
        }
    }

    componentDidMount() {
        this.otp_token_generation()
    }

    componentDidUpdate(prevProps) {
        if (prevProps !== this.props) {
            this.otp_token_generation()
        }
    }

    componentWillUnmount() {
        this.stopLoop();
    }

    startLoop = _ => {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.loop)
        }
    }

    loop = _ => {
        const timeout = this.state.start + this.state.period
        const elapsed = (new Date()).getTime() - this.state.start

        this.setState({ circleValue: elapsed / this.state.period })

        if ((new Date()).getTime() < timeout) {
            this.frameId = requestAnimationFrame(this.loop)
        } else {
            this.otp_token_generation()
        }
    }

    stopLoop = _ => {
        cancelAnimationFrame(this.frameId)
        this.frameId = null
    }

    otp_token_generation = _ => {

        if (this.props.otp && this.props.otp !== {} && this.props.otp.secret) {

            var TokenGenerator = null

            switch (this.props.otp.type) {
                case "totp":
                    TokenGenerator = new TOTP({ createDigest })
                    break;
                default:
                case "authenticator":
                    TokenGenerator = new Authenticator({
                        createDigest,
                        createRandomBytes,
                        keyDecoder,
                        keyEncoder
                    })
                    break;
            }

            TokenGenerator.options = {
                algorithm: this.props.otp.algorithm != null ? this.props.otp.algorithm.toLowerCase() : "sha1",
                digits: this.props.otp.digits != null ? parseInt(this.props.otp.digits) : 6,
                step: this.props.otp.period != null ? parseInt(this.props.otp.period) : 30
            }

            try {
                const token = TokenGenerator.generate(this.props.otp.secret)
                const secondsUntilNextTokenGetGenerated = TokenGenerator.timeRemaining() * 1000

                this.stopLoop();

                const period = TokenGenerator.options.step * 1000
                const start = (new Date()).getTime() - period + secondsUntilNextTokenGetGenerated

                this.setState({ otp_token: token, start: start, period: period }, this.startLoop)
            } catch (err) {
                console.error(err)
            }
        }
    }

    copy = _ => {
        Clipboard.setString(this.state.otp_token)
        ToastAndroid.show(I18N.t("Detail.Tfa.Copied"), ToastAndroid.SHORT)
    }

    render() {
        return this.props.otp !== undefined && this.props.otp.secret !== "" && <>
            <Typography.Header level={2} style={styles.Title}>{I18N.t("Detail.Tfa.Title")}</Typography.Header>
            <View style={styles.otpBlock}>
                <TouchableNativeFeedback onPress={this.copy} delayPressIn={0} background={TouchableNativeFeedback.SelectableBackground()}>
                    <View style={styles.otpBlockInside} pointerEvents='box-only'>

                        <View style={styles.left}>
                            <Svg
                                style={{
                                    transform: [
                                        { rotate: "-90deg" },
                                    ]
                                }}>
                                <Circle
                                    r="25%"
                                    cx="50%"
                                    cy="50%"
                                    stroke="#999"
                                    strokeDasharray={this.state.circleValue * 35 + " 35"}
                                    strokeWidth="50%"></Circle>
                            </Svg>
                        </View>

                        <Typography.Text black style={{ letterSpacing: 10 }}>{this.state.otp_token}</Typography.Text>

                        <Icon style={styles.otpIcon} name="clipboard" size={22} color="#000" />

                    </View>
                </TouchableNativeFeedback>
            </View>
        </>
    }
}

const styles = StyleSheet.create({
    Title: {
        paddingBottom: 10,
        paddingTop: 15
    },
    otpBlock: {
        borderRadius: 5,
        borderWidth: 0,
        backgroundColor: "#F2F2F2",
        overflow: "hidden",
        marginBottom: 10
    },
    otpBlockInside: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center"
    },
    otpIcon: {
        position: "absolute",
        right: 15
    },
    left: {
        position: "absolute",
        left: 15,
        height: 22,
        width: 22,
        backgroundColor: "rgb(210, 210, 210)",
        borderRadius: 1000,
    }
});