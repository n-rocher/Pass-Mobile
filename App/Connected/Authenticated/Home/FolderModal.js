import React, { Component } from 'react'
import { View, Text, StyleSheet, TouchableNativeFeedback } from 'react-native'

import Icon from 'react-native-vector-icons/Feather'
import Modal from 'react-native-modal'
import Button from '../../../Common/Button'
import TextInput from '../../../Common/TextInput'
import Typography from '../../../Common/Typography'

import Database from "../../../Utils/Database"

export default class FolderModal extends Component {

    state = {
        showing: "menu"
    }

    onOpenFolder = _ => {
        this.onClose()
        this.props.onOpenFolder(this.props.data)
    }

    render_menu = _ => this.props.data != null && <View style={styles.ModalContainer}>
        <View style={styles.ModalTitle}>
            <View style={styles.ModalFolderLongPressIcon}>
                <Icon name="folder" color="#000" size={22} />
            </View>

            <Typography.Header level={3}>{this.props.data.name}</Typography.Header>
        </View>

        <TouchableNativeFeedback onPress={this.onOpenFolder}>
            <View style={styles.ModalFolderLongPressButton}>
                <View style={styles.ModalFolderLongPressButtonInside}>
                    <Icon name="folder" color="#000" size={22} />
                    <Typography.Text style={styles.ModalFolderLongPressButtonAction}>Ouvrir</Typography.Text>
                </View>
                <Icon name="chevron-right" color="#000" size={22} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={_ => this.setState({ showing: "rename" })}>
            <View style={styles.ModalFolderLongPressButton}>
                <View style={styles.ModalFolderLongPressButtonInside}>
                    <Icon name="edit" color="#000" size={22} />
                    <Typography.Text style={styles.ModalFolderLongPressButtonAction}>Renommer</Typography.Text>
                </View>
                <Icon name="chevron-right" color="#000" size={22} />
            </View>
        </TouchableNativeFeedback>
        <TouchableNativeFeedback onPress={_ => this.setState({ showing: "delete" })}>
            <View style={styles.ModalFolderLongPressButton}>
                <View style={styles.ModalFolderLongPressButtonInside}>
                    <Icon name="trash" color="#000" size={22} />
                    <Typography.Text style={styles.ModalFolderLongPressButtonAction}>Supprimer</Typography.Text>
                </View>
                <Icon name="chevron-right" color="#000" size={22} />
            </View>
        </TouchableNativeFeedback>
    </View>


    render_rename = _ => this.props.data != null && <View style={styles.ModalContainer}>
        <View style={styles.ModalTitle}>
            <Typography.Header level={3}>Renommer un dossier</Typography.Header>
        </View>

        <Typography.Text style={{ margin: 15, marginBottom: 5 }}>Entrer le nouveau nom du dossier :</Typography.Text>

        <TextInput
            ref={e => this.rename_folder_value = e}
            value={this.props.data.name}
            style={{ marginHorizontal: 15, marginBottom: 5 }} />

        <View style={styles.Aside}>
            <Button link onPress={_ => this.setState({ showing: "menu" })}><Typography.Text>Annuler</Typography.Text></Button>
            <Button dark onPress={this.rename_folder} style={{ marginHorizontal: 15 }}><Typography.Text style={{ color: "white" }}>Enregistrer</Typography.Text></Button>
        </View>

    </View>


    rename_folder = _ => {
        const value = this.rename_folder_value.value()
        Database.editItem(this.props.data.id, {name: value})
        this.onClose()
    }

    delete_folder = _ => {
        Database.deleteItem(this.props.data.id)
        this.onClose()
    }

    render_delete = _ => this.props.data != null && <View style={styles.ModalContainer}>
        <View style={styles.ModalTitle}>
            <Typography.Header level={3}>Supprimer le dossier : {this.props.data.name}</Typography.Header>
        </View>

        <Typography.Text style={{ padding: 15 }}>Êtes-vous sûr de vouloir supprimer ce dossier ?</Typography.Text>

        <View style={styles.Aside}>
            <Button link onPress={_ => this.setState({ showing: "menu" })}><Typography.Text>Annuler</Typography.Text></Button>
            <Button red onPress={this.delete_folder} style={{ marginHorizontal: 15 }}><Typography.Text style={{ color: "white" }}>Oui</Typography.Text></Button>
        </View>

    </View>

    onClose = _ => {
        this.props.onClose()
        setTimeout(_ => this.setState({ showing: "menu" }), 250)
    }

    render() {
        return <Modal
                isVisible={this.props.data != null}
                useNativeDriver={true}
                onBackButtonPress={this.onClose}
                onBackdropPress={this.onClose}>
            {this.state.showing === "menu" && this.render_menu()}
            {this.state.showing === "rename" && this.render_rename()}
            {this.state.showing === "delete" && this.render_delete()}
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