import React, { PureComponent } from 'react'
import { View, StyleSheet, TouchableNativeFeedback } from 'react-native'

import FastImage from 'react-native-fast-image'
import Icon from 'react-native-vector-icons/Feather'

import Typography from "../../../Common/Typography"

export default class PasswordItem extends PureComponent {

    state = { imageError: false }

    openPassword = _ => {
        this.props.navigator.push('ShowView', this.props, { animation: 'right' })
    }

    onImageError = _ => this.setState({ imageError: true })

    render() {
        return <View style={styles.ListItemContainer}>
            <TouchableNativeFeedback
                onPress={this.openPassword}
                delayPressIn={0}
                background={TouchableNativeFeedback.SelectableBackground()}>
                <View style={styles.ListItemInside} pointerEvents='box-only'>

                    <View style={styles.RowAlignCenter}>
                        <View style={styles.PasswordItemLogo}>
                            {!this.state.imageError ?
                                <FastImage
                                    style={styles.PasswordItemLogoImage}
                                    onError={this.onImageError}
                                    source={{
                                        uri: ("https://logo.clearbit.com/" + (this.props.url || "").replace("https://", "")),
                                        cache: FastImage.cacheControl.web
                                    }} />
                                :
                                <View style={[styles.PasswordItemLogoImage, styles.PasswordItemLogoErrorImage]}>
                                    <Icon name="key" color="#ffffff" size={22} />
                                </View>
                            }
                        </View>

                        <View style={styles.PasswordItemText}>
                            <Typography.Header level={3} numberOfLines={1} style={styles.PasswordItemSite}>{this.props.site}</Typography.Header>
                            <Typography.Text light numberOfLines={1} style={styles.PasswordItemLogin}>{this.props.login}</Typography.Text>
                        </View>
                    </View>

                </View>
            </TouchableNativeFeedback>
        </View>
    }
}


const styles = StyleSheet.create({
    ListItemContainer: {
        borderBottomColor: "#DDD",
        borderBottomWidth: 1,
    },
    ListItemInside: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 15,
        paddingLeft: 25,
        paddingRight: 50,
    },
    RowAlignCenter: {
        flexDirection: "row",
        alignItems: "center",
    },
    PasswordItemLogo: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        width: 50,
        height: 50
    },
    PasswordItemLogoImage: {
        width: 40,
        height: 40
    },
    PasswordItemLogoErrorImage: {
        backgroundColor: "#c6c6c6",
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 5
    },
    PasswordItemText: {
        flex: 1,
        marginLeft: 15
    },
    PasswordItemSite: {
        flex: 1,
    },
    PasswordItemLogin: {
        flex: 1
    },
});