import React from 'react';
import { View, Text, Alert, StyleSheet } from 'react-native';

import auth from '@react-native-firebase/auth';
import Preference from 'react-native-default-preference';

import TextInput from '../Common/TextInput';
import { Button, ButtonStyle } from '../Common/Button';
import Logo from '../Common/Logo'
import Typography from '../Common/Typography'

import I18N from "../Translation/Config.js"

import Synchronisation from "../Utils/Synchronization"

export default class SignIn extends React.PureComponent {

    state = { email: "" }

    componentDidMount() {
        Preference.get("email").then(val => {
            this.setState({ email: val })
        })
    }

    goToSignUp = _ => {
        this.props.navigator.push("SignUp")
    }

    goToForgottenPassword = _ => {
        this.props.navigator.push("ForgottenPassword")
    }

    signIn = async _ => {
        const email = this.email.data()
        const password = this.password.data()

        if (email != "" && password != "") {
            try {
                const d = await auth().signInWithEmailAndPassword(email, password)
                await Synchronisation.setUseSync(true)
                this.props.onSignIn(d)
            } catch (e) {
                Alert.alert(I18N.t("SignIn.Title"), e.message)
            }
        }
    }

    clickNoSync = _ => {
        Alert.alert(
            "Connexion sans synchronisation",
            "Êtes-vous sur de ne pas vouloir synchroniser vos données ? En cas de perte / casse de votre téléphone ou en cas de suppression de l'application vous n'aurez pas de moyen de retrouver vos données.",
            [
                { text: "Annuler", onPress: _ => { } },
                { text: "Continuer", onPress: this.validUseNoSync }
            ]
        )
    }

    validUseNoSync = _ => {
        Synchronisation.setUseSync(false)
        this.props.onSignIn()
    }

    render() {
        return (
            <View style={styles.container}>

                <Logo size={35} style={{ marginBottom: 25 }} />

                <View style={styles.FormBlock}>

                    <TextInput
                        ref={e => this.email = e}
                        data={this.state.email}
                        name={I18N.t("Input.Email")}
                        returnKeyType={"next"}
                        onSubmitEditing={_ => this.password.focus()}
                        textContentType={"emailAddress"}
                        keyboardType={"email-address"}
                        autoCompleteType={"email"}
                        autoCorrect={false} />

                    <TextInput
                        ref={e => this.password = e}
                        name={I18N.t("Input.Password")}
                        textContentType={"newPassword"}
                        password showhide />

                    <Button link text onPress={this.goToForgottenPassword}>
                        <Typography.Text style={ButtonStyle.TextLink}>{I18N.t("SignIn.Link.ForgottenPassword")}</Typography.Text>
                    </Button>

                    <View style={styles.RowSpaceInside}>

                        <Button link text onPress={this.goToSignUp}>
                            <Typography.Text style={ButtonStyle.TextLink}>{I18N.t("SignIn.Link.SignUp")}</Typography.Text>
                        </Button>

                        <Button onPress={this.signIn} text dark>
                            <Typography.Text style={ButtonStyle.TextWhite}>{I18N.t("SignIn.ValidForm")}</Typography.Text>
                        </Button>

                    </View>

                    <View style={styles.noSyncButton}>
                        <Button link text onPress={this.clickNoSync}>
                            <Typography.Text style={ButtonStyle.TextLinkGrey}>{I18N.t("SignIn.Link.NoSync")}</Typography.Text>
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
    },
    noSyncButton: {
        marginTop: 25,
        textAlign: "center"
    }
});