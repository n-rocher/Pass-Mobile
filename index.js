import { AppRegistry } from 'react-native';
import App from './App/App';
import { name } from './app.json';

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-community/async-storage';

messaging().setBackgroundMessageHandler(async remoteMessage => {
    switch(remoteMessage.data.type){
        case "ASKING_KEY":
            AsyncStorage.setItem("NOTIFICATION_ASKING_KEY", remoteMessage.data.deviceID)
            break;
        default:
            console.error("Action indéfinie", remoteMessage)
            break;
    }

})

AppRegistry.registerComponent(name, () => App);