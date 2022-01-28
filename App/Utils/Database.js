import KeyManagement from "./KeyManagement"

import Preference from 'react-native-default-preference';

const VERIFICATION_DATA = "Pass."
const SAVING_MS_TIME = 2000

const TYPE = {
	PASSWORD: "password",
	FOLDER: "folder"
}

export const ERROR = {
	ONLINE_ITEM_NEED_UPDATE: "online-item-need-update"
}

class Database {

	isSetted = null
	isReady = null

	sync = null

	flat_data = []

	waitingList = {}

	getItemsListeners = {}
	searchListeners = {}
	itemListeners = {}

	constructor() { }

	init() {
		return new Promise((resolve, reject) => {

			KeyManagement.get_key().then(key => {

				this.loadDatabase(key).then(database => {

					this.flat_data = database

					resolve()

				}).catch(err => {
					// Clé invalide
					reject()

				})

			}).catch(err => {
				// Clé introuvable
				reject()
			})
		})
	}

	loadDatabase(key) {
		return new Promise(async (resolve, reject) => {

			// Verification de la clé
			let verification_line = await Preference.get('database-verification')

			try {
				verification_line = KeyManagement.decrypt_data_sync(KeyManagement.decrypt_data_sync((verification_line || ""), key), key)
			} catch (err) { }

			if (verification_line !== VERIFICATION_DATA) {
				return reject("KEY NOT VALID")
			}

			// Lecture de la base de donnée
			let database_sec = await Preference.get('database')
			database_sec = (database_sec || "").split("\n")

			const database = []
			for (const line of database_sec) {
				if (line !== "") {
					try {
						const lineDecoded = KeyManagement.decrypt_data_sync(line, key)
						database.push(lineDecoded)
					} catch (err) {
						console.warn("Donnée non lisible :", err, JSON.stringify(line))
					}
				}
			}

			return resolve(database)

		})
	}

	async createDatabase() {
		const key = KeyManagement.create_key()

		const encrypted_data = KeyManagement.encrypt_data_sync(KeyManagement.encrypt_data_sync(VERIFICATION_DATA, key), key)

		this.flat_data = []

		await Preference.set("database-verification", encrypted_data)

		this.saveToDisk()
	}

	saveToDisk = throttle(async _ => {
		const key = await KeyManagement.get_key()

		let dataToWrite = []

		for (let o of this.flat_data) {
			try {
				dataToWrite.push(KeyManagement.encrypt_data_sync(o, key))
			} catch (err) {
				console.error("saveToDisk ERROR", err)
			}
		}

		await Preference.set("database", dataToWrite.join("\n"))

	}, SAVING_MS_TIME)

	changeParent(id, newParentId, currentFolder) {
		const index = this.getItemIndex(id)

		const data = this.flat_data[index]

		if (newParentId === "_") {
			delete data.parentId
		} else {
			data.parentId = newParentId // TODO: Fail if newParentId is not a folder
		}

		this.flat_data[index] = data

		this.notifyGetItemsListeners(currentFolder)
		this.saveToDisk()

		// Synchronization
		if (this.sync) this.sync.updateItem(id)
	}

	createFolder(name, parentId) {
		const id = this.generateId()
		const object = { id, name, type: TYPE.FOLDER }
		if (parentId !== "_") object.parentId = parentId

		object.createdDate = (new Date()).toISOString()
		object.updateDate = object.createdDate

		return this._addItem(object, parentId)
	}

	renameFolder(id, newName) {

		const index = this.getItemIndex(id)

		const data = this.flat_data[index]
		data.name = newName

		this.flat_data[index] = data

		this.notifyGetItemsListeners(data.parentId || "_")
		this.saveToDisk()

		// Synchronization
		if (this.sync) this.sync.updateItem(id)
	}

	getItem(id) {
		return this.flat_data.find(x => x.id === id)
	}

	getItemIndex(id) {
		return this.flat_data.findIndex(x => x.id === id)
	}

	getLocalNewOrUpdatedItem(lastUpdate) {
		return new Promise((resolve, reject) => {
			let items = [...this.flat_data]
			if (lastUpdate) {
				items = this.flat_data.filter(x => x.updateDate > lastUpdate)
			}

			const itemsPromised = items.map(i => this.encryptItem(i))
			Promise.allSettled(itemsPromised)
				.then(results => {
					const res = results.filter(r => r.status === "fulfilled").map(x => x.value)
					resolve(res)
				})
		})
	}

	getItemToSynchronization(id) {
		return new Promise((resolve, reject) => {
			const data = this.getItem(id)
			if (data) {
				this.encryptItem({ ...data }).then(data => {
					resolve(data)
				}).catch(err => {
					reject(err)
				})
			} else reject("L'item n'existe pas")
		})
	}

	encryptItem(ref_item) {
		return new Promise((resolve, reject) => {
			const item = { ...ref_item }
			const updateDate = new Date(item.updateDate); delete item.updateDate
			const id = item.id; delete item.id

			KeyManagement.get_key(KeyManagement.ONLINE).then(key => {

				const data = KeyManagement.encrypt_data_sync(item, key)
				return resolve({ id, updateDate, data })

			}).catch(err => {
				reject(err)
			})
		})
	}

	createPassword(data, parentId) {
		const id = this.generateId()

		const object = { ...data, id, type: TYPE.PASSWORD }
		if (parentId && parentId !== "_") object.parentId = parentId

		object.createdDate = (new Date()).toISOString()
		object.updateDate = object.createdDate

		return this._addItem(object, parentId)
	}

	saveItemFromSynchronization(online_item) {
		return new Promise(async (resolve, reject) => {

			try {

				const online_key = await KeyManagement.get_key(KeyManagement.ONLINE)

				online_item = {
					...(KeyManagement.decrypt_data_sync(online_item.data, online_key)),
					id: online_item.id,
					updateDate: online_item.updateDate
				}

				const index = this.getItemIndex(online_item.id)

				if (index >= 0) {

					// Si local plus récent que online
					if (this.flat_data[index].updateDate > online_item.updateDate) {
						return reject({ code: ERROR.ONLINE_ITEM_NEED_UPDATE, data: this.flat_data[index] })
					}
					// Si online plus récent que local
					else if (online_item.updateDate > this.flat_data[index].updateDate) {
						this.flat_data[index] = online_item
					}

				} else {
					this.flat_data.push(online_item)
				}

				this.notifyGetItemsListeners(online_item.parentId || "_")
				this.saveToDisk()

				resolve()

			} catch (err) {
				console.warn("[saveItemFromSynchronization] Error while saving item from remote :", online_item.id, err)
			}


		})
	}

	_addItem(object, parentId) {

		this.flat_data.push(object)

		this.notifyGetItemsListeners(parentId)
		this.saveToDisk()

		// Synchronization
		if (this.sync) this.sync.updateItem(object.id)

		return object.id
	}

	editItem(id, newData) {

		const index = this.getItemIndex(id)

		const data = this.flat_data[index]
		const newItem = { ...data, ...newData, id, updateDate: (new Date()).toISOString() }

		this.flat_data[index] = newItem

		this.notifyGetItemsListeners(data.parentId || "_")
		this.notifyItemChangesListeners(id)
		this.saveToDisk()

		// Synchronization
		if (this.sync) this.sync.updateItem(id)

		return id
	}

	_deleteItemLocaly(id) {
		const index = this.getItemIndex(id)
		if (index > -1) {

			const parentId = this.flat_data[index].parentId || "_"

			this.flat_data.splice(index, 1) // FIXME: Si dossier, remonter tous les éléments

			this.notifyGetItemsListeners(parentId)
			this.saveToDisk()

			return true

		} else return false
	}

	deleteItem(id, fromSync = false) {
		this._deleteItemLocaly(id) && this.sync && !fromSync && this.sync.deleteItem(id)
	}

	resetLocalDatabase() {
		this.flat_data = []
		this.saveToDisk()
	}

	getItems(folder) {
		if (folder === "_") folder = undefined
		return this.flat_data.filter(x => x.parentId === folder).sort((a, b) => (a.name || a.site || "").localeCompare((b.name || b.site || ""))).sort((a, b) => a.type && a.type.localeCompare(b.type))
	}

	getAllItemsIdUpdateDate() {
		return this.flat_data.map(x => [x.id, x.updateDate])
	}

	// FOLDER LISTENER
	listeningItemsFrom(folder, callback) {

		callback(this.getItems(folder))

		if (!this.getItemsListeners[folder]) {
			this.getItemsListeners[folder] = []
		}
		this.getItemsListeners[folder].push(callback)

		return _ => {
			try {
				this.getItemsListeners[folder] = this.getItemsListeners[folder].filter(x => x !== callback)
			} catch (err) {
				console.error("listeningItemsFrom :: Erreur lros de la suppression du listenr", err)
			}
		}
	}

	async notifyGetItemsListeners(folder) {
		if ((this.getItemsListeners[folder] || []).length > 0) {
			const data = this.getItems(folder)

			for (const fn of this.getItemsListeners[folder] || []) {
				try {
					fn(data)
				} catch (err) {
					console.error("Erreur lors de l'appel du listenr")
				}
			}
		}
	}

	// ITEM LISTENER
	listeningChangesFor(item_id, callback) {
		callback(this.getItem(item_id))

		if (!this.itemListeners[item_id]) {
			this.itemListeners[item_id] = []
		}
		this.itemListeners[item_id].push(callback)

		return _ => {
			try {
				this.itemListeners[item_id] = this.itemListeners[item_id].filter(x => x !== callback)
			} catch (err) {
				console.error("listeningChangesFor :: Erreur lors de la suppression du listner", err)
			}
		}
	}

	async notifyItemChangesListeners(item_id) {
		if ((this.itemListeners[item_id] || []).length > 0) {
			const data = this.getItem(item_id)

			for (const fn of this.itemListeners[item_id] || []) {
				try {
					fn(data)
				} catch (err) {
					console.error("Erreur lors de l'appel du listenr")
				}
			}
		}
	}

	generateId() {
		return (+new Date()).toString(36) + Math.random().toString(36).slice(2)
	}

	searchInto(search, folder, should_update_listener = false) {

		if (folder === "_") folder = undefined

		let same_level = this.flat_data.filter(x => x.parentId === folder)
		let same_level_folders = same_level.filter(x => x.type === TYPE.FOLDER)

		// Filtre de recherche
		const name = ({ name }) => (name || "").toLowerCase().includes(search)
		const login = ({ login }) => (login || "").toLowerCase().includes(search)
		const site = ({ site }) => (site || "").toLowerCase().includes(search)
		const url = ({ url }) => (url || "").toLowerCase().includes(search)

		// Recherche dans les passwords
		same_level = same_level.filter(acc => acc.type === TYPE.PASSWORD && (name(acc) || login(acc) || site(acc) || url(acc)))

		// Récursion sur les dossiers sous le dossier de recherche principal
		for (const under_folder of same_level_folders) {
			const result = this.searchInto(search, under_folder.id, [...(should_update_listener || []), folder])
			same_level = [...same_level, ...result]
		}

		/* TODO: Une méthod async serait cool
		// Soit on retourne les données, sois on les envoies dans les listeners
		if (should_update_listener === false) {
			return same_level
		} else {

			// On notifie les listeners
			for (const listener of this.searchListeners[should_update_listener[0]]) {
				same_level.length > 0 && listener.event.reply(`${EVENT_SEARCH_INTO}-${should_update_listener[0]}`, same_level)
			}
		}*/

		return same_level

	}

	searchAccountWithUrl = async url => {
		return this.flat_data.filter(e => e.type === "password").filter(e => e.data.url != undefined).filter(e => (e.data.url || "").includes(url)).map(e => e.data)
	}

	synchronizeWith(sync) {
		this.sync = sync
	}

	desynchronize() {
		this.sync = null
	}

}

function throttle(callback, delay) {
	var last
	var timer
	return function () {
		var context = this
		var now = +new Date()
		var args = arguments
		if (last && now < last + delay) {
			clearTimeout(timer)
			timer = setTimeout(function () {
				last = now
				callback.apply(context, args)
			}, delay)
		} else {
			last = now;
			callback.apply(context, args)
		}
	}
}


const db = new Database()

export default db;