import React from 'react';

import Navigator from 'react-native-easy-router'

import CodeID from './AddCodeID';

export default class AddSecurity extends React.PureComponent {

    PAGES = this.props.PAGES

    renderCodeID = props => {
        return <CodeID
            {...props}
            onAuthenticationAdded={this.props.onAuthenticationAdded}
            TYPE={this.PAGES.CODE_ID} />
    }

    render() {
        return <Navigator
            navigatorRef={ref => (this.navigator = ref)}
            screens={{
                CodeID: this.renderCodeID
            }}
            initialStack='CodeID' />
    }
}