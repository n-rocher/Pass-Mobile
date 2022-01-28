import React from 'react';
import { ScrollView, View, Alert, Text, StyleSheet } from 'react-native';

import auth from '@react-native-firebase/auth';

import TextInput from '../Common/TextInput';
import { Button, ButtonStyle } from '../Common/Button';
import Logo from '../Common/Logo'
import Typography from '../Common/Typography'

import I18N from "../Translation/Config.js"

export default class SignUp extends React.PureComponent {

    goToSignIn = _ => {
        this.props.navigator.pop()
    }

    validForm = async _ => {
        const prenom = this.prenom.data()
        const nom = this.nom.data()
        const email = this.email.data()
        const password = this.password.data()

        if(email != "" && password != "" && prenom != "" && nom != ""){
            try {
                const d = await auth().createUserWithEmailAndPassword(email, password);

                const update = {
                    displayName: prenom + ' ' + nom
                }

                Alert.alert(I18N.t("SignUp.Title"), I18N.t("SignUp.Valid"))
              
                try {
                    await auth().currentUser.updateProfile(update);
                } catch(e){
                    console.error("[SignUp] Update Profil", e)
                }

                this.props.onSignIn(d)

            } catch (e) {
                Alert.alert(I18N.t("SignUp.Title"), e.message)
            }
        }
    }

    render() {
        return (
            <ScrollView contentContainerStyle={styles.container}>
                
                <Logo size={35} style={{ marginBottom: 25 }} />

                <View style={styles.FormBlock}>

                    <TextInput ref={e => this.prenom = e} name={I18N.t("Input.FirstName")} textContentType={"name"} returnKeyType={"next"} onSubmitEditing={_ => this.nom.focus()} />
                    <TextInput ref={e => this.nom = e} name={I18N.t("Input.Name")} textContentType={"familyName"} returnKeyType={"next"} onSubmitEditing={_ => this.email.focus()} />
                    <TextInput ref={e => this.email = e} name={I18N.t("Input.Email")} returnKeyType={"next"} onSubmitEditing={_ => this.password.focus()} textContentType={"emailAddress"} keyboardType={"email-address"} autoCompleteType={"email"} autoCorrect={false} />
                    <TextInput ref={e => this.password = e} name={I18N.t("Input.Password")} textContentType={"newPassword"} password showhide />

                    <View style={styles.RowSpaceInside}>

                        <Button link text onPress={this.goToSignIn}>
                            <Typography.Text style={ButtonStyle.TextLink}>{I18N.t("Button.Back")}</Typography.Text>
                        </Button>
                   
                        <Button onPress={this.validForm} text dark>
                            <Typography.Text style={ButtonStyle.TextWhite}>{I18N.t("SignUp.ValidForm")}</Typography.Text>
                        </Button>

                    </View>
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical:50
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
});