import React, { Component } from 'react'
import { View, TouchableNativeFeedback, StyleSheet } from 'react-native'

import Slider from "react-native-slider"
import Icon from 'react-native-vector-icons/Feather'

import GeneratePassword from "../../../Utils/GeneratePassword"

import { CheckBox } from '../../../Common/FormElement'
import Typography from "../../../Common/Typography"

export default class PasswordGenerator extends Component {
    constructor(props) {
        super(props)
        this.state = {
            PwdGeneratorLength: 15,
            PWD_GEN_LTTR: true,
            PWD_GEN_CHFR: true,
            PWD_GEN_SYMB: true
        }
    }

    generatePassword = _ => {
        const pwd = GeneratePassword({
            length: this.state.PwdGeneratorLength,
            numbers: this.state.PWD_GEN_CHFR,
            uppercase: this.state.PWD_GEN_LTTR,
            lowercase: this.state.PWD_GEN_LTTR,
            symbols: this.state.PWD_GEN_SYMB,
            strict: true
        })

        this.props.onGenerateNewPassword(pwd)
    }

    PWD_GEN_LTTR = _ => {
        if(this.state.PWD_GEN_CHFR || this.state.PWD_GEN_SYMB) {
            this.setState({ PWD_GEN_LTTR: !this.state.PWD_GEN_LTTR }, this.generatePassword)
        }
    }

    PWD_GEN_CHFR = _ => {
        if(this.state.PWD_GEN_LTTR || this.state.PWD_GEN_SYMB) {
            this.setState({ PWD_GEN_CHFR: !this.state.PWD_GEN_CHFR }, this.generatePassword)
        }
    }

    PWD_GEN_SYMB = _ => {
        if(this.state.PWD_GEN_CHFR || this.state.PWD_GEN_LTTR) {
            this.setState({ PWD_GEN_SYMB: !this.state.PWD_GEN_SYMB }, this.generatePassword)
        }
    }

    on_password_generator_length_change = value => {
        if(this.state.PwdGeneratorLength != value) this.setState({ PwdGeneratorLength: value }, this.generatePassword)
    }


    render() {
        return (
            <View style={styles.Generateur}>

                <View style={styles.GenerateurTop}>
                    <Typography.Header level={3} style={styles.GenerateurTitle}>Générateur de mot de passe</Typography.Header>

                    <View style={styles.GenerateurIcon}>
                        <TouchableNativeFeedback
                            onPress={this.generatePassword}
                            delayPressIn={0}
                            background={TouchableNativeFeedback.Ripple("#fff", false)}>
                                <View style={styles.GenerateurIcon}>
                                    <Icon name={"refresh-cw"} size={22} color="#fff" />
                                </View>
                        </TouchableNativeFeedback>
                    </View>
                </View>

                <View style={styles.GenerateurOption}>
                    <Typography.Text>Longueur du mot de passe : {this.state.PwdGeneratorLength}</Typography.Text>

                    <Slider
                        value={this.state.PwdGeneratorLength}
                        onValueChange={this.on_password_generator_length_change}
                        minimumValue={10}
                        maximumValue={42}
                        trackStyle={{ height: 8, borderRadius: 50 }}
                        minimumTrackTintColor={"rgb(100, 100, 100)"}
                        maximumTrackTintColor={"rgb(225, 225, 225)"}
                        thumbTintColor={"#000000"}
                        step={1}
                    />

                    <CheckBox
                        marginNone
                        onPress={this.PWD_GEN_LTTR}
                        checked={this.state.PWD_GEN_LTTR}
                        text={"Lettres"}
                    />

                    <CheckBox
                        marginNone
                        onPress={this.PWD_GEN_CHFR}
                        checked={this.state.PWD_GEN_CHFR}
                        text={"Chiffres"}
                    />

                    <CheckBox
                        marginNone
                        onPress={this.PWD_GEN_SYMB}
                        checked={this.state.PWD_GEN_SYMB}
                        text={"Symboles"}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    Generateur: {
        marginBottom: 20,
        borderRadius: 5,
        borderWidth: 1,
    },
    GenerateurTop: {
        paddingHorizontal: 15,
        paddingVertical:10,
        backgroundColor: "black",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems:"center",
    },
    GenerateurIcon: {
        height: 35,
        width: 35,
        borderRadius: 100,
        overflow: "hidden",
        alignItems:"center",
        justifyContent: "center"
    },
    GenerateurTitle: {
        color: "white"
    },
    GenerateurOption: {
        flexDirection: "column",
        padding: 15,
        paddingBottom: 5
    }
});