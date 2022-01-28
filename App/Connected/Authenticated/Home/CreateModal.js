import React, { PureComponent } from 'react'
import { View, StyleSheet, TouchableNativeFeedback } from 'react-native'

import Icon from 'react-native-vector-icons/Feather'
import Modal from 'react-native-modal'
import Button from '../../../Common/Button'
import TextInput from '../../../Common/TextInput'
import Typography from '../../../Common/Typography'

import Database from "../../../Utils/Database"

export default class CreateModal extends PureComponent {

    onClose = _ => {
        this.props.onClose()
    }

    onPressPassword = _ => {
        this.props.navigator.push('EditView', { password_data: { parentId: this.props.parentId }, animation: 'right' })
        this.onClose()
    }

    onPressQRCode = _ => {
        this.props.navigator.push('OtpQrCodeScanner', { parentId: this.props.parentId }, { animation: 'right' })
        this.onClose()
    }

    onPressFolder = _ => {
        this.props.onCreateFolder()
        this.onClose()
    }

    render() {
        return <Modal
            isVisible={this.props.isVisible}
            useNativeDriver={true}
            onBackButtonPress={this.onClose}
            onBackdropPress={this.onClose}>
            <View style={styles.ModalContainer}>
                <View style={styles.ModalTitle}>
                    <Typography.Header level={2}>Ajouter...</Typography.Header>
                </View>

                <TouchableNativeFeedback onPress={this.onPressPassword}>
                    <View style={styles.ModalFolderLongPressButton}>
                        <View style={styles.ModalFolderLongPressButtonInside}>
                            <Icon name="key" color="#000" size={22} />
                            <Typography.Text style={styles.ModalFolderLongPressButtonAction}>Ajouter un compte</Typography.Text>
                        </View>
                        <Icon name="chevron-right" color="#000" size={22} />
                    </View>
                </TouchableNativeFeedback>

                <TouchableNativeFeedback onPress={this.onPressQRCode}>
                    <View style={styles.ModalFolderLongPressButton}>
                        <View style={styles.ModalFolderLongPressButtonInside}>
                            <Icon name="camera" color="#000" size={22} />
                            <Typography.Text style={styles.ModalFolderLongPressButtonAction}>Scanner un QR Code</Typography.Text>
                        </View>
                        <Icon name="chevron-right" color="#000" size={22} />
                    </View>
                </TouchableNativeFeedback>

                <TouchableNativeFeedback onPress={this.onPressFolder}>
                    <View style={styles.ModalFolderLongPressButton}>
                        <View style={styles.ModalFolderLongPressButtonInside}>
                            <Icon name="folder" color="#000" size={22} />
                            <Typography.Text style={styles.ModalFolderLongPressButtonAction}>Ajouter un dossier</Typography.Text>
                        </View>
                        <Icon name="chevron-right" color="#000" size={22} />
                    </View>
                </TouchableNativeFeedback>
            </View>
        </Modal>
    }
}

export class CreateFolderModal extends PureComponent {

    onClose = _ => {
        this.props.onClose()
        setTimeout(_ => this.setState({ showing: "menu" }), 250)
    }

    create_folder = _ => {
        const folder_name = this.folder_value.value()
        Database.createFolder(folder_name, this.props.parentId)
        this.onClose()
    }

    render() {
        return <Modal
            isVisible={this.props.isVisible}
            useNativeDriver={true}
            onBackButtonPress={this.onClose}
            onBackdropPress={this.onClose}>
            <View style={styles.ModalContainer}>
                <View style={styles.ModalTitle}>
                    <Typography.Header level={2}>Ajouter un dossier</Typography.Header>
                </View>

                <Typography.Text style={{ margin: 15, marginBottom: 5 }}>Entrer le nom du dossier :</Typography.Text>

                <TextInput
                    ref={e => this.folder_value = e}
                    style={{ marginHorizontal: 15, marginBottom: 5 }} />

                <View style={styles.Aside}>
                    <Button link onPress={this.onClose}><Typography.Text>Annuler</Typography.Text></Button>
                    <Button dark onPress={this.create_folder} style={{ marginHorizontal: 15 }}><Typography.Text style={{ color: "white" }}>Ajouter</Typography.Text></Button>
                </View>

            </View>
        </Modal>
    }
}

const styles = StyleSheet.create({
    Aside: {
        flexDirection: "row",
        justifyContent: "flex-end"
    },
    ModalContainer: {
        backgroundColor: "white",
        paddingBottom: 10,
        borderRadius: 5,
        overflow: "hidden"
    },
    ModalTitle: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        paddingBottom: 20,
        backgroundColor: "#eee",
        marginBottom: 10,
    },
    ModalItemContainer: {
        marginHorizontal: 10
    },
    ModalFolderLongPressButton: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 15,
        marginVertical: 5,
        height: 50
    },
    ModalFolderLongPressButtonInside: {
        flexDirection: "row",
        alignItems: "center",
    },
    ModalFolderLongPressButtonAction: {
        marginLeft: 15,
    },
    Center: {
        textAlign: "center"
    },
    ModalFolderLongPressIcon: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        width: 40,
        height: 40,
        borderRadius: 40,
        marginRight: 15,
        backgroundColor: "#fff"
    }
})