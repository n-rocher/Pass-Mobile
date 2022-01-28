import React from 'react';
import { Text as RN_Text, StyleSheet } from 'react-native';

class Header extends React.PureComponent {
    render() {
        const style = styles["Header_" + this.props.level]
        return <RN_Text {...this.props} style={{ ...style, ...this.props.style, ...styles.Default }}>{this.props.children}</RN_Text>
    }
}

class Text extends React.PureComponent {
    render() {
        const style = this.props.light ? styles.Text_Light : this.props.black ? styles.Text_Black : styles.Text_Regular
        return <RN_Text {...this.props} style={{ ...style, ...this.props.style, ...styles.Default }}>{this.props.children}</RN_Text>
    }
}

const styles = StyleSheet.create({
    Default: {
        // backgroundColor: "red"
    },
    Header_1: {
        fontFamily: "Poppins-Bold",
        fontSize: 20,
        color: "#000"
    },
    Header_2: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 18,
        color: "#000",
        // backgroundColor: "purple"
    },
    Header_3: {
        fontFamily: "Poppins-SemiBold",
        fontSize: 16,
        lineHeight: 25,
        color: "#000",
        // backgroundColor: "pink"
    },
    Text_Black: {
        fontFamily: "Poppins-ExtraBold",
        fontSize: 30,
        paddingTop: 8,
        lineHeight: 75,
        color: "#000",
        // backgroundColor: "blue"

    },
    Text_Regular: {
        fontFamily: "Poppins-Regular",
        fontSize: 15,
        lineHeight: 25,
        color: "#000",
        // backgroundColor: "orange"
    },
    Text_Light: {
        fontFamily: "Poppins-Light",
        fontSize: 14,
        color: "#000",
    }
})

Header.defaultProps = {
    style: {},
    children: "",
    level: 1
}

Text.defaultProps = {
    style: {},
    children: ""
}

export default { Header, Text }