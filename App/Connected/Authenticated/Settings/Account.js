import React from 'react'
import { ScrollView, StyleSheet, Keyboard, Alert } from 'react-native'

import auth from '@react-native-firebase/auth'

import Icon from 'react-native-vector-icons/Feather'

import TextInput from '../../../Common/TextInput'
import Typography from '../../../Common/Typography'
import { Button, ButtonStyle } from '../../../Common/Button'

import I18N from "../../../Translation/Config"

export default class Account extends React.Component {

	constructor(props) {
		super(props)

		this.state = {
			nom: "",
			password: ""
		}
	}

	componentDidMount() {
		const user = auth().currentUser
		this.setState({ nom: user.displayName })
	}

	SAVE_NAME = _ => {
		Keyboard.dismiss()
		auth().currentUser.updateProfile({
			displayName: this.state.nom
		}).then(_ => {
			Alert.alert(I18N.t("Settings.Account.EditingName.Title"), I18N.t("Settings.Account.EditingName.Sucess"))
		}).catch(_ => {
			Alert.alert(I18N.t("Settings.Account.EditingName.Title"), I18N.t("Settings.Account.EditingName.Error"))
		})
	}

	SAVE_NEW_PASSWORD = _ => {
		Keyboard.dismiss()
		auth().signInWithEmailAndPassword(auth().currentUser.email, this.password.data()).then(_ => {
			auth().currentUser.updatePassword(this.new_password.data()).then(_ => {

				this.password.clear()
				this.new_password.clear()

				Alert.alert(I18N.t("Settings.Account.EditingPassword.Title"), I18N.t("Settings.Account.EditingPassword.Sucess"))
			}).catch(err => {
				if (err.code == "auth/weak-password") {
					Alert.alert(I18N.t("Settings.Account.EditingPassword.Title"), I18N.t("Settings.Account.EditingPassword.Error.TooEasy"))
				} else {
					Alert.alert(I18N.t("Settings.Account.EditingPassword.Title"), I18N.t("Settings.Account.EditingPassword.Error.Internet"))
				}
			})
		}).catch(err => {
			if (err.code == "auth/wrong-password") {
				Alert.alert(I18N.t("Settings.Account.EditingPassword.Title"), I18N.t("Settings.Account.EditingPassword.Error.WrongPassword"))
			} else {
				Alert.alert(I18N.t("Settings.Account.EditingPassword.Title"), I18N.t("Settings.Account.EditingPassword.Error.Internet"))
			}
		})
	}

	SIGN_OUT = _ => {
		this.props.onSignOut(true)
	}

	DELETE_MY_ACCOUNT = _ => {
		Alert.alert(I18N.t("Settings.Account.DangerZone.DeleteAccount.Title"), I18N.t("Settings.Account.DangerZone.DeleteAccount.WarningMessage"), [
			{
				text: I18N.t("Button.Cancel"),
				onPress: () => null,
				style: 'cancel',
			},
			{
				text: I18N.t("Button.Delete"), onPress: this.FINAL_DELETE_MY_ACCOUNT
			},
		], { cancelable: true })
	}

	FINAL_DELETE_MY_ACCOUNT = _ => {
		firebase.auth().currentUser.delete()
		this.props.onSignOut()
	}

	render() {
		return (
			<ScrollView contentContainerStyle={styles.ScrollBlock} keyboardShouldPersistTaps='handled'>

				<Typography.Header style={styles.H1}>{I18N.t("Settings.Account.Title")}</Typography.Header>

				<Typography.Header level={2} style={styles.H2}>{I18N.t("Settings.Account.GeneralInformation.Title")}</Typography.Header>
				<Typography.Text>{I18N.t("Settings.Account.GeneralInformation.Description")}</Typography.Text>

				<TextInput name={I18N.t("Input.YourName")} ref={e => this.nom = e} data={this.state.nom} autoCompleteType={"off"} autoCorrect={false} />

				<Button onPress={this.SAVE_NAME} mixed >
					<Icon style={ButtonStyle.IconText} name="save" size={22} color="#000" />
					<Typography.Text style={ButtonStyle.Text}>{I18N.t("Button.SaveModification")}</Typography.Text>
				</Button>

				<Typography.Header level={2} style={styles.H2}>{I18N.t("Settings.Account.EditingPassword.Title")}</Typography.Header>
				<Typography.Text>{I18N.t("Settings.Account.EditingPassword.Description")}</Typography.Text>
				<TextInput name={I18N.t("Input.ActualPassword")} ref={e => this.password = e} password showhide />
				<TextInput name={I18N.t("Input.NewPassword")} ref={e => this.new_password = e} password showhide />
				<Button onPress={this.SAVE_NEW_PASSWORD} mixed >
					<Icon style={ButtonStyle.IconText} name="save" size={22} color="#000" />
					<Typography.Text style={ButtonStyle.Text}>{I18N.t("Settings.Account.EditingPassword.Button")}</Typography.Text>
				</Button>

				<Typography.Header level={2} style={styles.H2}>{I18N.t("Settings.Account.DangerZone.Title")}</Typography.Header>
				<Typography.Text>{I18N.t("Settings.Account.DangerZone.Description")}</Typography.Text>

				<Button onPress={this.SIGN_OUT} mixed style={styles.MarginBlock}>
					<Icon style={ButtonStyle.IconText} name="log-out" size={22} color="#000" />
					<Typography.Text style={ButtonStyle.Text}>{I18N.t("Settings.Account.DangerZone.SignOut.Button")}</Typography.Text>
				</Button>

				<Button onPress={this.DELETE_MY_ACCOUNT} red mixed style={styles.MarginBlock}>
					<Icon style={ButtonStyle.IconText} name="trash" size={22} color="#fff" />
					<Typography.Text style={ButtonStyle.TextWhite}>{I18N.t("Settings.Account.DangerZone.DeleteAccount.Button")}</Typography.Text>
				</Button>

			</ScrollView>
		);
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
	},
	H2: {
		marginTop: 25,
		marginBottom: 15
	},
	MarginBlock: {
		marginTop: 25
	}
})