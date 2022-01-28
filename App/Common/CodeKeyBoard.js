import React from 'react';

import { View, Vibration, TouchableNativeFeedback, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

import Typography from "./Typography"

export default class CodeKeyBoard extends React.PureComponent {

    minSize = 4
    maxSize = 10

    state = {
        numbers: [null, null, null, null],
        index: 0,
        position: shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    }

    shuffleKeyboard = _ => {
        this.setState({ position: shuffle(this.state.position) })
    }

    onNumber = number => {
        if (this.state.numbers.length < this.maxSize) {
            if (this.state.numbers[this.state.index] == null) {
                this.state.numbers[this.state.index] = number
            } else {
                this.state.numbers.push(number)
            }

            this.setState({
                numbers: this.state.numbers,
                index: this.state.index + 1
            }, async _ => this.props.onNumber && this.props.onNumber(this.code()))
        }
    }

    code = _ => this.state.numbers.join("")

    failed = _ => {
        // Code invalide
        // TODO: Secousse des petits ronds + les mettres en rouge avec une transition (a généraliser en temps normal)

        Vibration.vibrate(500)

        this.clear()
    }

    clear = _ => {
        this.setState({
            numbers: [null, null, null, null],
            index: 0
        })
    }

    removeLastNumber = _ => {

        if (this.state.index > 4) {
            this.state.numbers.pop()
        } else {
            this.state.numbers[this.state.index - 1] = null
        }

        this.setState({
            numbers: this.state.numbers,
            index: (this.state.index - 1) < 0 ? 0 : (this.state.index - 1)
        })
    }

    onLeftButtonPress = _ => {
        if (this.props.leftButton.onPress && this.props.leftButton.onPress === "REMOVE_LAST_DIGIT") {
            this.removeLastNumber()
        }

        this.props.onLeftButtonPress && this.props.onLeftButtonPress(this.code())
    }

    renderLeftButton = _ => {
        if (this.props.leftButton !== undefined) {
            if (typeof this.props.leftButton === "string") {
                return (
                    <TouchableNativeFeedback
                        onPress={this.props.onLeftButtonPress}
                        delayPressIn={0}
                        background={TouchableNativeFeedback.Ripple(this.rippleColor())}>
                        <View style={styles.ButtonInside}>
                            <Typography.Text style={styles.ButtonText}>{this.props.leftButton}</Typography.Text>
                        </View>
                    </TouchableNativeFeedback>
                )
            } else {
                return (
                    <TouchableNativeFeedback
                        onPress={this.onLeftButtonPress}
                        delayPressIn={0}
                        background={TouchableNativeFeedback.Ripple(this.rippleColor())}>
                        <View style={styles.ButtonInside}>
                            {this.props.leftButton.type === "Image" ? <Image {...this.props.leftButton} style={styles.ButtonImage} /> : null}
                            {this.props.leftButton.type === "Icon" ? <Icon name={this.props.leftButton.icon} color={this.props.leftButton.color || this.props.numberColor || "#FFFFFF"} size={30} /> : null}
                        </View>
                    </TouchableNativeFeedback>
                )
            }
        } else return null
    }

    onRightButtonPress = _ => {
        if (this.props.rightButton.onPress && this.props.rightButton.onPress === "REMOVE_LAST_DIGIT") {
            this.removeLastNumber()
        }

        this.props.onRightButtonPress && this.props.onRightButtonPress(this.code())
    }

    renderRightButton = _ => {
        if (this.props.rightButton !== undefined) {
            if (typeof this.props.rightButton === "string") {
                return (
                    <TouchableNativeFeedback
                        onPress={this.props.onRightButtonPress}
                        delayPressIn={0}
                        background={TouchableNativeFeedback.Ripple(this.rippleColor())}>
                        <View style={styles.ButtonInside}>
                            <Typography.Text style={styles.ButtonText}>{this.props.rightButton}</Typography.Text>
                        </View>
                    </TouchableNativeFeedback>
                )
            } else {
                return (
                    <TouchableNativeFeedback
                        onPress={this.onRightButtonPress}
                        delayPressIn={0}
                        background={TouchableNativeFeedback.Ripple(this.rippleColor())}>
                        <View style={styles.ButtonInside}>
                            {this.props.rightButton.type === "Image" ? <Image {...this.props.rightButton} style={styles.ButtonImage} /> : null}
                            {this.props.rightButton.type === "Icon" ? <Icon name={this.props.rightButton.icon} color={this.props.rightButton.color || this.props.numberColor || "#FFFFFF"} size={30} /> : null}
                        </View>
                    </TouchableNativeFeedback>
                )
            }
        } else return null
    }

    rippleColor = _ => {
        let theme = this.props.colorTheme || "dark"

        if (theme == "dark") {
            return "rgba(255,255,255,.3)"
        } else {
            return "rgba(175,175,175,.3)"
        }
    }

    render() {
        return (
            <View style={styles.ButtonGroup}>
                <View style={styles.PointGroup}>
                    {
                        this.state.numbers.map(
                            (n, i) => <View
                                key={"k" + i}
                                style={[
                                    styles.Point,
                                    this.props.numberColorNotActive ? { backgroundColor: this.props.numberColorNotActive } : {},
                                    n === null ? {} : { backgroundColor: this.props.numberColor || "#FFFFFF" }
                                ]}
                            ></View>)
                    }
                </View>

                <View style={styles.ButtonGroup}>

                    <View style={styles.ButtonRow}>
                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[1]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />
                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[2]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />
                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[3]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />
                    </View>

                    <View style={styles.ButtonRow}>
                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[4]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />
                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[5]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />
                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[6]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />
                    </View>

                    <View style={styles.ButtonRow}>
                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[7]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />
                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[8]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />
                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[9]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />
                    </View>

                    <View style={styles.ButtonRow}>

                        <View style={this.props.leftButtonBackground ? styles.Button : styles.ButtonNoBackground}>
                            {this.renderLeftButton()}
                        </View>

                        <Button
                            rippleColor={this.rippleColor()}
                            number={this.state.position[0]}
                            keyboardBorder={this.props.keyboardBorder}
                            keyboardColor={this.props.keyboardColor}
                            onPress={this.onNumber} />

                        <View style={this.props.rightButtonBackground ? styles.Button : styles.ButtonNoBackground}>
                            {this.renderRightButton()}
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

class Button extends React.PureComponent {

    onPress = _ => {
        this.props.onPress(this.props.number)
    }

    render() {
        return (
            <View style={[styles.Button, this.props.keyboardBorder ? styles.ButtonBorder : {}]}>
                <TouchableNativeFeedback
                    onPress={this.onPress}
                    delayPressIn={0}
                    background={TouchableNativeFeedback.Ripple(this.props.rippleColor)}>
                    <View style={styles.ButtonInside} pointerEvents='box-only'>
                        <Typography.Text style={this.props.keyboardColor ? { ...styles.ButtonNumber, color: this.props.keyboardColor } : styles.ButtonNumber}>{this.props.number}</Typography.Text>
                    </View>
                </TouchableNativeFeedback>
            </View>
        )
    }
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5)
}

const styles = StyleSheet.create({
    PointGroup: {
        marginVertical: 40,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        maxWidth: "90%"
    },
    Point: {
        width: 15,
        height: 15,
        marginHorizontal: 15,
        marginVertical: 10,
        borderRadius: 100,
        backgroundColor: "rgba(0, 0, 0, .1)"
    },

    ButtonGroup: {
        flexDirection: "column",
        alignItems: "center",
    },
    ButtonRow: {
        marginVertical: 7.5,
        flexDirection: "row",
    },

    Button: {
        marginHorizontal: 20,
        width: 70,
        height: 70,
        borderRadius: 100,
        backgroundColor: "rgba(0, 0, 0, .05)",
        overflow: "hidden"
    },
    ButtonNoBackground: {
        marginHorizontal: 20,
        width: 70,
        height: 70,
        borderRadius: 100,
        overflow: "hidden",
    },
    ButtonBorder: {
        borderWidth: 1,
        borderColor: "#fff"
    },
    ButtonInside: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    ButtonNumber: {
        fontSize: 30,
        color: "#fff",
        paddingTop: 17.5
    },
    ButtonText: {
        color: "#fff",
        paddingTop: 8
    },
    ButtonImage: {
        width: 30,
        height: 30,
    }
})