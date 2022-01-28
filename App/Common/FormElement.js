import React from 'react';
import { View, Text, StyleSheet, TouchableNativeFeedback } from 'react-native';

import CheckBoxInput from 'react-native-check-box'

import Typography from "./Typography"

function RadioBox(props) {
    return <View style={styles.OutsideCheckBlock}>
        <TouchableNativeFeedback
            onPress={props.onPress}
            delayPressIn={0}
            background={TouchableNativeFeedback.Ripple("#CCC", false)}>
            <View style={styles.InsideCheckBlock}>
                <View style={styles.RadioItem}>
                    {props.selected ? <View style={styles.RadioInside} /> : null}
                </View>
                <View style={styles.SubTextBlock}>
                    <Typography.Text>{props.text}</Typography.Text>
                    {props.subText ? <Typography.Text light style={styles.SubTextCheckBlock}>{props.subText}</Typography.Text> : null}
                </View>
            </View>
        </TouchableNativeFeedback>
    </View>
}

function CheckBox(props) {
    return <View style={styles.OutsideCheckBlock, props.marginNone ? {} : styles.OutsideCheckBlockMargin}>
        <TouchableNativeFeedback
            onPress={props.onPress}
            delayPressIn={0}
            background={TouchableNativeFeedback.Ripple("#CCC", false)}>
            <View style={props.subText ? styles.InsideCheckBlock : styles.InsideCheckBlockNoSubText}>
                <CheckBoxInput
                    style={styles.BoxCheckBlock}
                    onClick={props.onPress}
                    isChecked={props.checked}
                />
                <View style={styles.SubTextBlockt}>
                    <Typography.Text>{props.text}</Typography.Text>
                    {props.subText ? <Typography.Text light style={styles.SubTextCheckBlock}>{props.subText}</Typography.Text> : null}
                </View>
            </View>
        </TouchableNativeFeedback>
    </View>
}

const styles = StyleSheet.create({
    OutsideCheckBlock: {
        borderRadius: 5,
        overflow: "hidden"
    },
    OutsideCheckBlockMargin: {
        marginBottom: 15,
    },
    InsideCheckBlock: {
        flex: 1,
        padding: 10,
        flexDirection: "row",
        alignItems: "flex-start",
    },
    InsideCheckBlockNoSubText: {
        flex: 1,
        padding: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    BoxCheckBlock: {
        marginRight: 15,
    },
    SubTextBlock: {
        flex: 1,
        flexDirection: "column"
    },
    SubTextCheckBlock: {
        marginTop: 5
    },
    RadioItem: {
        height: 20,
        width: 20,
        borderRadius: 12,
        borderWidth: 2,
        marginRight: 15,
        borderColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
    },
    RadioInside: {
        height: 11,
        width: 11,
        borderRadius: 6,
        backgroundColor: '#000',
    }
});

export { RadioBox, CheckBox };
