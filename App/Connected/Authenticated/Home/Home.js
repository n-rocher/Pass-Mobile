import React, { Component } from 'react'
import { View, StyleSheet, FlatList } from 'react-native'

import Icon from 'react-native-vector-icons/Feather'

import Logo from '../../../Common/Logo'
import { Button } from '../../../Common/Button'
import TextInput from '../../../Common/TextInput'
import Typography from '../../../Common/Typography'

import I18N from "../../../Translation/Config.js"

import PasswordItem from "./PasswordItem"
import FolderItem from "./FolderItem"
import FolderModal from "./FolderModal"
import CreateModal, { CreateFolderModal } from "./CreateModal"

import Database from "../../../Utils/Database"

export default class Home extends Component {

	state = {

		modalInfo: null,
		createModal: false,
		createFolderModal: false,

		path: [],
		currentDir: "_",
		currentDirData: [],

		searchValue: ""
	}

	componentDidMount() {

		this.props.navigator.registerBackHandler(this.onBack)

		// Showing root items
		this.moveInto(this.currentFolder())

		// Database.addItem({ name: "foldertest2222", type: "folder", id: Database.generateId()}, "_")
	}

	currentFolder = _ => this.state.path.length > 0 ? this.state.path[this.state.path.length - 1] : { id: "_" }

	componentWillUnmount() {
		this.UnsubscribeUpdate && this.UnsubscribeUpdate()
		this.props.navigator.unregisterBackHandler()
	}

	addNewPassword = _ => this.setState({ createModal: true })

	addNewPasswordViaCamera = _ => this.props.navigator.push('OtpQrCodeScanner', { password_data: { parentId: this.state.currentDir } }, { animation: 'right' })

	go_to_settings = _ => this.props.navigator.push('Settings', {}, { animation: 'right' })

	moveInto = folder => {
		this.UnsubscribeUpdate && this.UnsubscribeUpdate()

		this.UnsubscribeUpdate = Database.listeningItemsFrom(folder.id, data => {
			this.setState({ currentDirData: data, currentDir: folder.id, path: [...this.state.path, { name: folder?.name, id: folder.id }] })
		})
	}

	onFolderPress = this.moveInto
	onFolderLongPress = modalInfo => this.setState({ modalInfo })

	onBack = _ => {
		if (this.state.path.length >= 2) {
			this.state.path.pop()

			const folder = this.state.path[this.state.path.length - 1]

			this.UnsubscribeUpdate && this.UnsubscribeUpdate()
			this.UnsubscribeUpdate = Database.listeningItemsFrom(folder.id, data => {
				this.setState({ currentDirData: data, currentDir: folder.id, path: this.state.path })
			})
		}

		return true
	}

	render_header_list = _ => {

		const folder = this.currentFolder()

		return <View style={styles.HeaderList}>

			<TextInput
				ref={e => this.search = e}
				placeholder={folder.id === "_" ? I18N.t("AccountList.searchBarText") : I18N.t("AccountList.searchBarText_INTO", { folder: folder.name })}
				returnKeyType="search"
				value={this.state.searchValue}
				onChangeText={t => this.setState({ searchValue: t })}
				style={styles.SearchInput}
				search noMargin />

			<View style={styles.ButtonGroup}>

				{
					this.state.currentDir === "_" ?
						<Typography.Header level={3}>{I18N.t("AccountList.title")}</Typography.Header>
						:
						<FolderLink
							onPress={this.onBack}
							name={this.state.path[this.state.path.length - 1].name} />
				}

				<View style={styles.RowAlignCenter}>
					<Button onPress={this.addNewPassword} dark style={{ /*marginRight: 10*/ }}>
						<Icon name="plus" size={22} color="#fff" />
					</Button>
					{/* FIXME: <Button onPress={this.addNewPasswordViaCamera}>
						<Icon name="camera" size={22} color="#000" />
					</Button> */}
				</View>

			</View>
		</View>
	}

	render() {

		let show_items = this.state.currentDirData

		const search = this.state.searchValue.toLowerCase().trim()

		if (search.length > 0) {
			const folder = this.currentFolder()
			show_items = Database.searchInto(search, folder.id)
		}

		return <>
			<View style={styles.HeaderBlock}>
				<Logo />

				<Button onPress={this.go_to_settings}>
					<Icon name="sliders" size={22} color="#000" />
				</Button>
			</View>

			<FolderModal
				data={this.state.modalInfo}
				onOpenFolder={this.onFolderPress}
				onClose={_ => this.setState({ modalInfo: null })} />

			<CreateFolderModal
				isVisible={this.state.createFolderModal}
				parentId={this.state.currentDir}
				onClose={_ => this.setState({ createFolderModal: false })} />

			<CreateModal
				isVisible={this.state.createModal}
				navigator={this.props.navigator}
				parentId={this.state.currentDir}
				onCreateFolder={_ => this.setState({ createFolderModal: true })}
				onClose={_ => this.setState({ createModal: false })} />

			<FlatList
				data={show_items}
				ListHeaderComponent={this.render_header_list}
				keyboardShouldPersistTaps='handled'
				keyExtractor={item => item.id}
				renderItem={({ item }) => {
					if (item.type === "password") {
						return <PasswordItem navigator={this.props.navigator} {...item} password_data={item} />
					} else if (item.type === "folder") {
						return <FolderItem
							navigator={this.props.navigator}
							onPress={this.onFolderPress}
							onLongPress={this.onFolderLongPress}
							{...item} />
					} else {
						return null
					}
				}}
			/>
		</>
	}
}

function FolderLink(props) {
	return <View style={styles.RowAlignCenter}>
		<Button
			icon light
			onPress={props.onPress}
			style={{ marginRight: 10 }}
			insideStyle={{
				paddingVertical: 5,
				paddingHorizontal: 5
			}}>
			<Icon name="corner-left-up" size={15} />
		</Button>
		<Typography.Header level={3}>{props.name}</Typography.Header>
	</View>
}

const styles = StyleSheet.create({
	HeaderBlock: {
		borderBottomColor: "#DDD",
		borderBottomWidth: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 15
	},
	HeaderList: {
		paddingHorizontal: 15
	},
	ButtonGroup: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingBottom: 5
	},
	RowAlignCenter: {
		flexDirection: "row",
		alignItems: "center",
	}
});