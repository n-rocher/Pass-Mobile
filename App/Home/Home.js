import React from 'react';

import Navigator from 'react-native-easy-router'
import changeNavigationBarColor from 'react-native-navigation-bar-color'

import SignIn from './SignIn';
import SignUp from './SignUp';
import ForgottenPassword from './ForgottenPassword';

export default class Home extends React.PureComponent {

    componentDidMount() {
        this.props.onReady()
        changeNavigationBarColor("#FFFFFF", true)
    }

    renderSignIn = props => {
        return <SignIn {...props} onSignIn={this.props.onSignIn} />
    }

    renderSignUp = props => {
        return <SignUp {...props} onSignIn={this.props.onSignIn} />
    }

    render() {
        return (
            <Navigator
                screens={{
                    SignIn: this.renderSignIn,
                    SignUp: this.renderSignUp,
                    ForgottenPassword
                }}
                initialStack='SignIn' />
        )
    }
}