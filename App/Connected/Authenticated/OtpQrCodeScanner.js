import React from 'react';
import { StyleSheet, View, ToastAndroid } from 'react-native';

import { parse } from 'search-params'
import QRCodeScanner from 'react-native-qrcode-scanner';

import I18N from "../../Translation/Config"
import Typography from "../../Common/Typography"

export default class OtpQrCodeScanner extends React.PureComponent {

	scanner = null
	timer = null

	onSuccess = e => {
		let tfa = TFA_PARSER(e.data)

		if (tfa != null) {

			if (this.props?.otpEditor === true) {

				// On arrive depuis le composant OtpEditor
				this.props.onOtpFound(tfa)
				this.props.navigator.pop()

			} else {

				// On arrive depuis la page d'accueil
				this.props.navigator.resetFrom(this.props.navigator.stack[0].id, "EditView", { TFA_SCAN: true, tfa: tfa, parentId: this.props.parentId })

			}
		} else {
			ToastAndroid.show("QR Code invalide", ToastAndroid.SHORT)
		}

		this.timer = setTimeout(_ => this.scanner.reactivate(), 500)
	}

	componentWillUnmount() {
		clearTimeout(this.timer)
		this.timer = null
	}

	render() {
		return (
			<View style={styles.block}>
				<Typography.Header level={2} style={styles.texte}>{I18N.t("TFA_SCAN.Title")}</Typography.Header>
				<QRCodeScanner
					ref={(node) => { this.scanner = node }}
					onRead={this.onSuccess}
					style={styles.video}
				/>
			</View>
		)
	}
}


const styles = StyleSheet.create({
	block: {
		flex: 1,
		flexDirection: "column",
		justifyContent: "space-between",
		alignItems: "center",
	},
	texte: {
		paddingVertical: 50
	},
	video: {
		flex: 1
	}
})

function TFA_PARSER(uri) {

	if (typeof uri !== 'string' || uri.length < 7) return null;

	const parts = /otpauth:\/\/([A-Za-z]+)\/([^?]+)\??(.*)?/i.exec(uri);

	if (!parts || parts.length < 3) { return null; }

	const [fullUri, type, fullLabel] = parts;

	if (!type || !fullLabel) { return null; }

	const decodedLabel = decodeURIComponent(fullLabel);

	const labelParts = decodedLabel.split(/: ?/);

	const label = labelParts && labelParts.length === 2
		? { issuer: labelParts[0], account: labelParts[1] }
		: { issuer: '', account: decodedLabel };

	const query = parse(parts[3] || "");

	return { type: type.toLowerCase(), label, query };
}