import React from 'react'
import { View, Text, StyleSheet, TouchableNativeFeedback } from 'react-native'

import Icon from 'react-native-vector-icons/Feather'

import Typography from "../../../Common/Typography"

export default function FolderItem(props) {

    function onPress(){
        props.onPress(props)
    }

    function onLongPress() {
        props.onLongPress(props)
    }

    return <View style={styles.ListItemContainer}>
        <TouchableNativeFeedback
            onPress={onPress}
            onLongPress={onLongPress}
            delayPressIn={0}
            style={{ width: "100%" }}
            background={TouchableNativeFeedback.SelectableBackground()}>
            <View style={styles.ListItemInside} pointerEvents='box-only'>

                <View style={styles.RowAlignCenter}>
                    <View style={FolderStyle.Logo}>
                        <Icon name="folder" color="#000" size={22} />
                    </View>
                    <Typography.Header level={3} numberOfLines={1} style={styles.PasswordItemSite}>{props.name}</Typography.Header>
                </View>

                <Icon name="chevron-right" size={25} color="#000" />

            </View>
        </TouchableNativeFeedback>
    </View>
}

const FolderStyle = StyleSheet.create({
    Logo: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 5,
        width: 40,
        height: 40,
        borderRadius: 40,
        marginRight: 15,
        backgroundColor: "#eee"
    }
});

const styles = StyleSheet.create({

    HeaderBlock: {
        borderBottomColor: "#DDD",
        borderBottomWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 15
    },

    HeaderList: {
        paddingHorizontal: 15
    },
    SearchInput: {
        paddingVertical: 25
    },

    ButtonGroup: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingBottom: 5
    },
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
    PasswordItemSite: {
        flex: 1,
    },
});