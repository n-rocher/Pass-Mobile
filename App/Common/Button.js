import React, { Component } from 'react';
import { View, TouchableNativeFeedback, StyleSheet } from 'react-native';

class Button extends Component {
    render() {
        return (
            <View style={this.props.link ? ButtonStyle.OutsideBlockLink : [ButtonStyle.OutsideBlock, this.props.dark ? ButtonStyle.DarkBloc : this.props.red ? ButtonStyle.RedBloc : null, this.props.style]}>
                <TouchableNativeFeedback
                    onPress={this.props.onPress}
                    delayPressIn={0}
                    background={this.props.dark ? TouchableNativeFeedback.Ripple("#fff", false) : TouchableNativeFeedback.Ripple("#CCC", false)}>

                    <View pointerEvents='box-only' style={[(this.props.mixed ? ButtonStyle.InsideBlockMixed : this.props.text ? this.props.link ? ButtonStyle.InsideBlockLink : ButtonStyle.InsideBlockText : ButtonStyle.InsideBlockIcon), this.props.insideStyle]}>
                        {this.props.children}
                    </View>

                </TouchableNativeFeedback>
            </View>
        );
    }
}

const ButtonStyle = StyleSheet.create({
    OutsideBlock: {
        borderRadius: 5,
        borderWidth: 1,
        borderColor: "#DDD",
        overflow: "hidden"
    },
    DarkBloc: {
        backgroundColor: "#000",
        borderWidth: 0,
    },
    RedBloc: {
        backgroundColor: "#c62828",
        borderWidth: 0,
    },
    OutsideBlockLink: {
        borderRadius: 5,
        overflow: "hidden"
    },
    InsideBlockText: {
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    InsideBlockLink: {
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    InsideBlockIcon: {
        paddingVertical: 10,
        paddingHorizontal: 10,
    },
    InsideBlockMixed: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    TextWhite: {
        fontSize: 16,
        color: "white"
    },
    TextLink: {
        fontSize: 15,
        color: "#1E88E5"
    },
    TextLinkGrey: {
        fontSize: 15,
        color: "#999",
        textAlign: "center"
    },
    IconText: {
        marginRight: 15
    }
});

export { Button, ButtonStyle };

export default Button;
