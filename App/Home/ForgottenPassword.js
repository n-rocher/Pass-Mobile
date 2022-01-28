import React from 'react';
import { View, Alert, StyleSheet } from 'react-native';


import TextInput from '../Common/TextInput'
import { Button, ButtonStyle } from '../Common/Button'
import Typography from '../Common/Typography'
import Logo from '../Common/Logo'

import I18N from "../Translation/Config"
import auth from '@react-native-firebase/auth';

export default class ForgottenPassword extends React.Component {

    goToSignIn = _ => {
        this.props.navigator.pop()
    }

    signin = async _ => {
        const email = this.email.data()

        if (email != "") {
            try {

                await auth().sendPasswordResetEmail(email);

                Alert.alert(I18N.t("ForgottenPassword.Title"), I18N.t("ForgottenPassword.EmailSend"))

                this.goToSignIn()

            } catch (e) {
                Alert.alert(I18N.t("ForgottenPassword.Title"), e.message)
            }
        }
    }

    render() {

        return (
            <View style={styles.container}>

                <Logo size={35} style={{ marginBottom: 25 }} />

                <View style={styles.FormBlock}>

                    <TextInput ref={e => this.email = e} name={I18N.t("Input.Email")} textContentType={"emailAddress"} keyboardType={"email-address"} autoCompleteType={"email"} autoCorrect={false} />

                    <View style={styles.RowSpaceInside}>

                        <Button link text onPress={this.goToSignIn}>
                            <Typography.Text style={ButtonStyle.TextLink}>{I18N.t("Button.Back")}</Typography.Text>
                        </Button>

                        <Button onPress={this.signin} text dark>
                            <Typography.Text style={ButtonStyle.TextWhite}>{I18N.t("Button.Send")}</Typography.Text>
                        </Button>

                    </View>

                </View>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    FormBlock: {
        width: "85%",
    },
    RowSpaceInside: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 25
    }
})