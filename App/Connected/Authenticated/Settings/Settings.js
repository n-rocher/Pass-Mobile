import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import Navigator from 'react-native-easy-router'

import Menu from "./Menu";
import Account from "./Account";
import Security from "./Security";
import Preferences from "./Preferences";
import Privacy from "./Privacy";
import About from "./About";
import Development from "./Development";
import ChangePinCode from "./ChangePinCode";

import { Button } from '../../../Common/Button';
import Typography from '../../../Common/Typography'

import I18N from "../../../Translation/Config"

export default class Settings extends React.PureComponent {

    go_back = _ => {
        if (this.settingsNavigator.stack.length > 1) {
            this.settingsNavigator.pop()
        } else {
            this.props.navigator.pop()
        }
    }

    renderAccount = props => {
        return <Account {...props} onSignOut={this.props.onSignOut} />
    }

    render() {
        return (
            <>

                { /* -------------- HEADER -------------- */}

                <View style={styles.HeaderBlock}>

                    <Button onPress={this.go_back}>
                        <Icon name="chevron-left" size={22} color="#000" />
                    </Button>

                    <Typography.Header>{I18N.t("Settings.Title")}</Typography.Header>

                    <View style={{ width: 42 }}></View>

                </View>
                { /* -------------- HEADER -------------- */}



                { /* -------------- MAIN -------------- */}

                <Navigator
                    navigatorRef={ref => (this.settingsNavigator = ref)}
                    screens={{
                        Menu,
                        Account: this.renderAccount,
                        Security,
                        Preferences,
                        ChangePinCode,
                        Privacy,
                        About,
                        Development,
                    }}
                    initialStack={[{ screen: 'Menu', props: { ParentNavigator: this.props.navigator } }]} />

                { /* -------------- MAIN -------------- */}

            </>
        );
    }
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
    RowItem: {
        flexDirection: "row",
        alignItems: "center",
    },
    HeaderLogo: {
        marginRight: 10,
        height: 20,
        width: 20
    }
})