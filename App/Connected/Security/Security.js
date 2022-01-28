import React from 'react';

import Navigator from 'react-native-easy-router'
import * as Keychain from 'react-native-keychain';

import CodeID from './CodeID';
import AddSecurity from './AddSecurity/AddSecurity';

export default class Security extends React.PureComponent {

    PAGES = {
        ADD_AUTHENTICATION: 0,
        CODE_ID: 1,
        FACE_ID: 2
    }

    PAGES_REVERSED = {
        0: "AddSecurity",
        1: "CodeID",
        2: "FaceID"
    }

    constructor(props) {
        super(props)

        Keychain.getInternetCredentials("AUTH-TYPE").then(data => {
            const auth_type = data !== false ? parseInt(data.password) : this.PAGES.ADD_AUTHENTICATION
            this.navigator.reset(this.PAGES_REVERSED[auth_type] , {}, {animation: "none"})
            setTimeout(_ => {
                this.props.onReady()
            }, 500)
        })
    }

    renderAddSecurity = props => {
        return <AddSecurity
            {...props}
            PAGES={this.PAGES}
            onAuthenticationAdded={this.props.onAuthenticationSucceed} />
    }

    renderCodeID = props => {
        return <CodeID
            {...props}
            onAuthenticationSucceed={this.props.onAuthenticationSucceed}
            onAuthenticationFailed={this.props.onAuthenticationFailed} />
    }

    render() {
        return <Navigator
            navigatorRef={ref => (this.navigator = ref)}
            screens={{
                CodeID: this.renderCodeID,
                AddSecurity: this.renderAddSecurity,
            }}
            initialStack='AddSecurity' />
    }
}