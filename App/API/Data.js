import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

import { getModel, getBrand, getSystemName, getSystemVersion } from 'react-native-device-info';

export function askThePrivateKey(publicKey) {
    return new Promise((resolve, reject) => {

        let deviceName = getModel()
        let deviceBrand = getBrand()

        if (deviceName.search(deviceBrand) == -1) {
            deviceName = `${deviceBrand} ${deviceName}`
        }

        deviceName = `${deviceName} - ${getSystemName()} ${getSystemVersion()}`

        const body = {
            publicKey,
            type: "mobile",
            os: deviceName
        }

        firebase.app().functions('europe-west1')
            .httpsCallable('addDevice')(body)
            .then(({ data: result }) => {

                if (result.status === "NO_CONNECTED_DEVICE") {
                    reject("NO_CONNECTED_DEVICE")
                } else if (result.status === "WAITING_KEY") {

                    const { uid } = auth().currentUser
                    const docPath = `Users/${uid}/Devices/${result.deviceID}`

                    firestore()
                        .doc(docPath)
                        .onSnapshot(snap => {
                            const data = snap.data()
                            if (data.state === "RECEIVED_KEY") {
                                resolve({ data, deviceID: result.deviceID })
                            }
                        })
                } else {
                    reject("UNKNOW_STATE")
                }
            })
            .catch(err => {
                reject("CREATING_DEMAND")
            })
    })
}


export function refuseDevice(deviceID, callback) {
    firestore()
        .doc(`Users/${auth().currentUser.uid}/Devices/${deviceID}`)
        .delete()
        .then(callback)
        .catch(callback)
}

export function allowDevice(deviceID, encrypted_key) {
    return firestore()
        .doc(`Users/${auth().currentUser.uid}/Devices/${deviceID}`)
        .update({ encrypted_key, state: "RECEIVED_KEY" })
}