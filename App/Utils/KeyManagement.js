import AES from "aes-js";
import * as Keychain from 'react-native-keychain';

class KeyManagement {

    LOCAL = "LOCAL"
    ONLINE = "ONLINE"

    key = {
        LOCAL: null, // Cache
        ONLINE: null // Cache
    }

    // Méthode permettant de charger la clé
    // Renvoie la clé parsé ou false
    async get_key(which = this.LOCAL) {

        if(this.key[which] !== null) return this.key[which]

        try {
            const key_raw = await Keychain.getGenericPassword({ service: which })
            this.key[which] = this.parse_key(key_raw?.password)
            return this.key[which]
        } catch (err) {
            console.error(err)
        }

        return false
    }

    // Permet de générer une clé et de la sauvegarder dans la Keychain
    create_key(which = this.LOCAL) {

        /* -------- Generate Key -------- */
        const key = new Uint8Array(32)
        for (var i = 0; i < key.length; i++) {
            key[i] = Math.floor(Math.random() * 255)
        }
        /* -------- Generate Key -------- */

        this.set_key(key, which)

        return key
    }


    // Méthode permettant de parser une chaine JSON en array de Uint8
    // resolve le tableau ou false
    parse_key(key_raw) {
        try {
            return new Uint8Array(JSON.parse(key_raw))
        } catch (e) {
            return false
        }
    }


    async set_key(key, which = this.LOCAL) {
        this.key[which] = key
        return await Keychain.setGenericPassword("key", JSON.stringify(Array.from(key)), { service: which })
    }

    // Permet de chiffrer des données
    // data = array, object
    // return = les données chiffées
    async encrypt_data(data, which = this.LOCAL) {
        // Con convertit les données
        const dataBytes = AES.utils.utf8.toBytes(JSON.stringify(data));

        // Récupération de la clé
        const key = await this.get_key(which)

        // 1. Algo Definition
        const aesCtr = new AES.ModeOfOperation.ctr(key, new AES.Counter(12));
        // 2. Encryption
        const encryptedBytes = aesCtr.encrypt(dataBytes);
        // 3. Bytes to Hex for sotring
        const encryptedHex = AES.utils.hex.fromBytes(encryptedBytes);

        return encryptedHex
    }

    // Permet de chiffrer des données
    // data = (array, object, string), key = une clé AES
    // return = les données chiffées
    encrypt_data_sync(data, key) {

        let dataBytes;

        try {
            // Convertion des données
            dataBytes = AES.utils.utf8.toBytes(JSON.stringify(data));
        } catch (err) {
            throw new ExceptionEncrypt("JSON", err)
        }

        let encryptedHex;

        try {

            // 1. Algo Definition
            const aesCtr = new AES.ModeOfOperation.ctr(key, new AES.Counter(12));
            // 2. Encryption
            const encryptedBytes = aesCtr.encrypt(dataBytes);
            // 3. Bytes to Hex for sotring
            encryptedHex = AES.utils.hex.fromBytes(encryptedBytes);

        } catch (err) {
            throw new ExceptionEncrypt("AES", err)
        }

        return encryptedHex
    }

    // Permet de déchiffrer des données
    // data = donnés chifrées
    // return = les données déchiffées
    async decrypt_data(data, which = this.LOCAL) {

        // Récupération de la clé
        const key = await this.get_key(which)

        return this.decrypt_data_sync(data, key)
    }


    // Permet de déchiffrer des données
    // data = donnés chifrées, key = une clé AES
    // return = les données déchiffées
    decrypt_data_sync(data, key) {

        let decryptedText;

        try {
            // 1. Hex to Bytes
            const DEC_encryptedBytes = AES.utils.hex.toBytes(data);
            // 2. Algo Definition
            const DEC_aesCtr = new AES.ModeOfOperation.ctr(key, new AES.Counter(12));
            // 3. Decryption
            const decryptedBytes = DEC_aesCtr.decrypt(DEC_encryptedBytes);
            // 3. Bytes to text
            decryptedText = AES.utils.utf8.fromBytes(decryptedBytes);

        } catch (err) {
            throw new ExceptionDecrypt("AES", err)
        }

        try {
            decryptedText = JSON.parse(decryptedText)
        } catch (err) {
            throw new ExceptionDecrypt("JSON", err)
        }

        return decryptedText
    }

    // Permet de vider les caches
    empty_cache() {
        this.key = {
            LOCAL: null,
            ONLINE: null
        }
    }

}

function ExceptionDecrypt(code, message) {
    this.code = code;
    this.message = message;
    this.name = "ExceptionDecrypt->" + code;
    this.toString = function () {
        return this.name + "\n" + this.message
    };
}

function ExceptionEncrypt(code, message) {
    this.code = code;
    this.message = message;
    this.name = "ExceptionEncrypt->" + code;
    this.toString = function () {
        return this.name + "\n" + this.message
    };
}

export default new KeyManagement()