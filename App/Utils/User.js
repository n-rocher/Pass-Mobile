import auth from '@react-native-firebase/auth'

import Keytar from 'keytar'

class User {

    initializing = false

    onUserSignInCallback = null
    onUserSignOutCallback = null

    isLoggedListeners = {}
    getNameListeners = {}

    removeAuthListener = null

    user = null

    constructor() {

        this.removeAuthListener = auth().onAuthStateChanged(user => {
            this.user = user
            if (this.initializing) this.initializing = false;
            this.notifyIsLoggedListeners()
        })

    }

    destroy() {
        this.removeAuthListener && this.removeAuthListener()
    }

    signIn(email, password) {
        return new Promise((resolve, reject) => {
            auth()
                .signInWithEmailAndPassword(email, password)
                .then(_ => {

                    resolve()
                    this.notifyIsLoggedListeners()

                }).catch(err => {
                    reject(err)
                })
        })
    }

    signUp(name, email, password) {
        return new Promise((resolve, reject) => {
            auth()
                .createUserWithEmailAndPassword(email, password)
                .then(_ => {

                    this.changeName(name)

                    resolve()
                    this.notifyIsLoggedListeners()

                }).catch(err => {
                    reject(err)
                })
        })
    }

    forgottenPassword(email) {
        return auth().sendPasswordResetEmail(email)
    }

    isLogged() {
        return this.user !== null
    }

    changePassword(currentPassword, newPassword) {
        return new Promise((resolve, reject) => {

            // TODO: Changement de mot de passe
            /*   firebase.auth().signInWithEmailAndPassword(firebase.this.user.email, this.password.value()).then(_ => {
                   firebase.this.user.updatePassword(this.new_password.value()).then(_ => {
       
       
                   }).catch(err => {
                   })
               }).catch(err => {
               })*/

            reject("TODO")
        })
    }

    getName() {
        return this.isLogged() ? this.user.displayName : ""
    }

    getUID() {
        return this.isLogged() ? this.user.uid : null
    }

    changeName(newName) {
        return new Promise((resolve, reject) => {

            newName = newName.trim()

            this.user.updateProfile({
                displayName: newName
            }).then(_ => {

                this.saveUserSession()

                resolve()
                this.notifyGetNameListeners()

            }).catch(err => {
                reject(err)
            })
        })
    }

    deleteAccount(password) {
        return new Promise((resolve, reject) => {
            // TODO: Suppression du compte
            /*
             firebase.auth().signInWithEmailAndPassword(email, password).then(d => {
                firebase.this.user.delete()
            }).catch(e => {
            })

            this.logOut()
            */
            reject("TODO")
        })
    }

    async notifyIsLoggedListeners() {
        const isSignIn = this.isLogged()

        if (isSignIn) {
            this.onUserSignInCallback && this.onUserSignInCallback()
        } else {
            this.onUserSignOutCallback && this.onUserSignOutCallback()
        }

    }

    async signOut() {

        //TODO: Desactive la synchronisation
        //TODO: Supprime l'appareil
        //TODO: Suppression clé online

        try {
            await Keytar.deletePassword("Pass.", "USER")
        } catch (_) { }

        try {
            await Keytar.deletePassword("Pass.", "KEY-ONLINE")
        } catch (_) { }

        try {
            await auth().signOut()
        } catch (_) { }

        this.notifyIsLoggedListeners()
    }


    // For main event
    onUserSignIn(callback) {
        this.onUserSignInCallback = callback
    }

    onUserSignOut(callback) {
        this.onUserSignOutCallback = callback
    }

}

module.exports = User