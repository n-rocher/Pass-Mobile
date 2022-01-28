import React from 'react';
import { View, Text, TouchableNativeFeedback, StyleSheet } from 'react-native'

import Icon from 'react-native-vector-icons/Feather'
import Modal from 'react-native-modal'

import Typography from "./Typography"

export default class DropDown extends React.Component {

    state = {
        visible: false,
        selectedValue: "",
        listChoice: []
    }

    componentDidMount() {
        this.setState({
            selectedValue: this.props.defaultValue,
            listChoice: this.props.list
        })
    }

    value = _ => this.state.selectedValue

    onButtonPress = _ => {
        this.setState({ visible: true })
    }

    dismiss = _ => {
        this.setState({ visible: false })
    }

    onSelectOption = item => {
        this.setState({ selectedValue: item.value, selectedText: item.text }, _ => {
            setTimeout(_ => {
                this.dismiss()
            }, 500)
        })
    }

    render() {
        var item = this.state.listChoice.find(e => e.value === this.state.selectedValue)
        return (
            <>
                <Typography.Header level={2} style={{marginBottom: 10}}>{this.props.name}</Typography.Header>
                <View style={styles.ButtonContainer}>
                    <TouchableNativeFeedback
                        onPress={this.onButtonPress}
                        delayPressIn={0}
                        background={TouchableNativeFeedback.Ripple("#CCC", false)}>
                        <View style={styles.ButtonInside}>
                            <Typography.Text style={styles.ButtonText}>{item && item.text}</Typography.Text>
                            <Icon name="chevron-down" color="#000000" size={22} />
                        </View>
                    </TouchableNativeFeedback>
                </View>

                <Modal
                    isVisible={this.state.visible}
                    useNativeDriver={true}
                    onBackButtonPress={this.dismiss}
                    onBackdropPress={this.dismiss}>
                    <View style={styles.ModalContainer}>
                        <Typography.Header level={2} style={styles.ModalTitle} >{this.props.title}</Typography.Header>
                        {this.state.listChoice.map((e, k) => (
                            <View key={k} style={styles.ModalItemContainer}>
                                <TouchableNativeFeedback
                                    onPress={_ => this.onSelectOption(e)}
                                    delayPressIn={0}
                                    background={TouchableNativeFeedback.Ripple("#CCC", false)}>
                                    <View style={styles.ModalItemInside}>
                                        <Typography.Text style={styles.ModalItemText}>{e.text}</Typography.Text>
                                        {this.state.selectedValue === e.value ? <Icon name="check" color="#1E88E5" size={22} /> : null}
                                    </View>
                                </TouchableNativeFeedback>
                            </View>
                        ))}
                    </View>
                </Modal>
            </>
        )
    }
}

const styles = StyleSheet.create({
    ButtonContainer: {
        borderWidth: 1,
        borderColor: "#DDD",
        borderRadius: 5,
        marginBottom: 15
    },
    ButtonInside: {
        flexDirection: "row",
        height: 50,
        alignItems: "center",
        paddingHorizontal: 15
    },
    ButtonText: {
        flex: 1,
    },
    ModalContainer: {
        backgroundColor: "white",
        paddingBottom: 10,
        borderRadius: 5,
        overflow: "hidden"
    },
    ModalTitle: {
        padding: 20,
        paddingBottom: 10,
        backgroundColor: "#EEE",
        marginBottom: 10,
    },
    ModalItemContainer: {
        marginHorizontal: 10
    },
    ModalItemInside: {
        flexDirection: "row",
        paddingHorizontal: 5,
        height: 50,
        alignItems: "center"
    },
    ModalItemText: {
        flex: 1,
    }
})