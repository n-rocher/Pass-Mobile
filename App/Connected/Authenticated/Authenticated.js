import React from "react"
import { StatusBar } from 'react-native';

import Navigator from 'react-native-easy-router'
import changeNavigationBarColor from 'react-native-navigation-bar-color'

import Home from "./Home/Home"
import ShowView from "./ShowView/ShowView"
import EditView from "./EditView/EditView"
import Settings from "./Settings/Settings"
import OtpQrCodeScanner from "./OtpQrCodeScanner"

import Database from "../../Utils/Database"

export default class Authentificated extends React.Component {

    state = {
        visible: false
    }

    componentDidMount() {
        changeNavigationBarColor("#FFFFFF", true)

        Database.init().then(_ => {

            this.setState({ visible: true })

        }).catch(_ => {

        })
    }

    renderSettings = props => {
        return <Settings {...props} onSignOut={this.props.onSignOut} />
    }

    render() {
        return this.state.visible && <>
            <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
            <Navigator
                navigatorRef={ref => (this.navigator = ref)}
                screens={{
                    Home,
                    ShowView,
                    EditView,
                    OtpQrCodeScanner,
                    Settings: this.renderSettings
                }}
                initialStack='Home' />
        </>
    }
}