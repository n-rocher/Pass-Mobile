import React from 'react';
import { View, TextInput, ToastAndroid, StyleSheet, TouchableOpacity, Clipboard, Linking } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import I18N from "../Translation/Config.js"

import AskForPermission from "./AskForPermission"

import Typography from "./Typography"

export default class TextInput_MINE extends React.Component {

    state = {
        text: this.props?.value || "",
        oldProps: this.props,
        textHidden: this.props.password ? true : false
    }

    static getDerivedStateFromProps(newProps, state) {
        text = state.oldProps?.value !== newProps?.value ? { text: newProps?.value || "" } : {}
        return { oldProps: newProps, ...text }
    }

    data = _ => this.state.text
    value = _ => this.state.text

    focus = _ => {
        this.input.focus()
    }

    clear = _ => {
        this.setState({ text: "" })
    }

    blur = _ => {
        this.input.focus()
    }

    show = _ => {
        if (this.props.secure) {
            if (this.state.textHidden == true) {
                this.permission.Ask().then(_ => this.setState({ textHidden: false }))
            }
        } else {
            this.setState({ textHidden: false })
        }
    }

    showHideClick = _ => {
        if (this.props.secure) {
            if (this.state.textHidden == true) {
                this.permission.Ask().then(_ => this.setState({ textHidden: false }))
            } else {
                this.setState({ textHidden: true })
            }
        } else {
            this.setState({ textHidden: !this.state.textHidden })
        }
    }

    copyText = _ => {
        if (this.props.secure) {
            this.permission.Ask()
                .then(_ => {
                    this.copyTextFunc()
                })
        } else {
            this.copyTextFunc()
        }
    }

    copyTextFunc = _ => {
        Clipboard.setString(this.props.value)
        ToastAndroid.show(I18N.t("TextInput.CopiedField"), ToastAndroid.SHORT)
    }

    openLink = _ => {
        Linking.openURL(this.props.value)
    }

    clearSearch = _ => {
        this.props.onChangeText ? this.props.onChangeText("") : null
    }

    render() {
        return (
            <View style={[this.props.style, (this.props.noMargin == false ? {} : styles.InputBlock), (this.props.noMarginTop && { marginTop: 0 })]}>

                <AskForPermission ref={e => this.permission = e} type="password" />

                {this.props.name ?
                    <Typography.Header level={2} style={styles.InputName}>{this.props.name}</Typography.Header>
                    : null}

                <View style={styles.InputTextButtonBlock}>

                    {this.props.editable == false ?

                        <Typography.Text style={{...styles.InputTextButtonTextInput, ...styles.InputUneditable, ...{ paddingRight: !this.props.showhide && !this.props.copy ? 10 : 0 }}}
                        >{[...this.state.text].map(e => this.state.textHidden ? "∗" : e)}
                        </Typography.Text>

                        :

                        <TextInput
                            {...this.props}
                            blurOnSubmit={this.props.returnKeyType != "next" ? true : false}
                            ref={e => this.input = e}
                            placeholderTextColor={"#9e9e9e"}
                            style={{ ...styles.InputTextButtonTextInput, paddingRight: !this.props.showhide && !this.props.copy ? 10 : 0 }}
                            onChangeText={(text) => {
                                this.setState({ text })
                                this.props.onChangeText ? this.props.onChangeText(text) : null
                            }}
                            value={this.state.text}
                            secureTextEntry={this.state.textHidden}
                        />
                    }

                    {this.props.showhide ?
                        <TouchableOpacity onPress={this.showHideClick} activeOpacity={0.7} >
                            <Icon name={this.state.textHidden ? "eye" : "eye-off"} size={22} style={styles.InputTextButtonButton} color="#000" />
                        </TouchableOpacity>
                        : null}

                    {this.props.copy ?
                        <TouchableOpacity onPress={this.copyText} activeOpacity={0.7} >
                            <Icon name="clipboard" size={22} style={styles.InputTextButtonButton} color="#000" />
                        </TouchableOpacity>
                        : null}

                    {this.props.open ?
                        <TouchableOpacity onPress={this.openLink} activeOpacity={0.7} >
                            <Icon name="external-link" size={22} style={styles.InputTextButtonButton} color="#000" />
                        </TouchableOpacity>
                        : null}

                    {this.props.search ?
                        <TouchableOpacity onPress={this.clearSearch} activeOpacity={0.7}>
                            <Icon name={this.state.text != "" ? "x" : "search"} size={22} style={styles.InputTextButtonButton} color="#000" />
                        </TouchableOpacity>
                        : null}

                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    InputBlock: {
        paddingVertical: 15
    },
    InputName: {
        paddingBottom: 5
    },

    InputTextButtonBlock: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#DDD",
    },
    InputTextButtonTextInput: {
        flex: 1,
        height: 55,
        padding: 0,
        paddingLeft: 10,
        lineHeight: 21,
        fontFamily: "Poppins-Regular",
        fontSize: 15,
        color: "black"
    },
    InputUneditable: {
        lineHeight: 57.5,
    },
    InputTextButtonButton: {
        textAlign: "center",
        width: 55,
        height: 55,
        lineHeight: 55,
    },
});