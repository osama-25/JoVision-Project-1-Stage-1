import React, { useState } from "react";
import { Animated, Modal, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";

const RenamePopUp = ({ visible, onClose, Rename, animate }) => {
    const [name, setName] = useState('');
    const [scaleValueRename] = useState(new Animated.Value(1));

    const renameFile = () => {
        animate(scaleValueRename);
        setTimeout(() => {
            onClose();
            if (name !== '') {
                Rename(name);
            }
        }, 200);
    }

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <TextInput
                            placeholder="Enter new name"
                            placeholderTextColor={'gray'}
                            value={name}
                            onChangeText={setName}
                            style={styles.textInput}
                        />
                        <Pressable onPress={renameFile}>
                            <Animated.View style={[styles.button, { transform: [{ scale: scaleValueRename }] }]}>
                                <Text style={styles.text}>Rename</Text>
                            </Animated.View>
                        </Pressable>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
}

const CustomModal = ({ visible, onClose, Rename, Delete, fullScreen }) => {
    const [scaleValueCancel] = useState(new Animated.Value(1));
    const [scaleValueDelete] = useState(new Animated.Value(1));
    const [scaleValueFull] = useState(new Animated.Value(1));
    const [scaleValueRename] = useState(new Animated.Value(1));
    const [renameVisible, setRenameVisible] = useState(false);

    const animateButton = (value) => {
        Animated.timing(value, {
            toValue: 0.7,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            Animated.timing(value, {
                toValue: 1,
                duration: 50,
                useNativeDriver: true,
            }).start();
        });
    };

    const showRenameModal = () => {
        animateButton(scaleValueRename);
        setTimeout(() => {
            setRenameVisible(true);
        }, 200);
    }

    const deleteFile = () => {
        animateButton(scaleValueDelete);
        setTimeout(() => {
            Delete();
            onClose();
        }, 200);
    }

    const HandleCancel = () => {
        animateButton(scaleValueCancel);
        setTimeout(() => {
            onClose();
        }, 200);
    }

    const fullScreenNavigate = () => {
        animateButton(scaleValueFull);
        setTimeout(() => {
            fullScreen();
            onClose();
        }, 200);
    }

    return (
        <>
            <Modal
                animationType="slide"
                transparent={true}
                visible={visible}
                onRequestClose={onClose}
            >
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalView}>
                            <View style={styles.modal}>
                                <Pressable onPress={showRenameModal}>
                                    <Animated.View style={[styles.button, { transform: [{ scale: scaleValueRename }] }]}>
                                        <Text style={styles.text}>Rename</Text>
                                    </Animated.View>
                                </Pressable>
                                <Pressable onPress={deleteFile}>
                                    <Animated.View style={[styles.button, { transform: [{ scale: scaleValueDelete }] }]}>
                                        <Text style={styles.text}>Delete</Text>
                                    </Animated.View>
                                </Pressable>
                            </View>
                            <View style={styles.modal}>
                                <Pressable onPress={fullScreenNavigate}>
                                    <Animated.View style={[styles.button, { transform: [{ scale: scaleValueFull }] }]}>
                                        <Text style={styles.text}>Full Screen</Text>
                                    </Animated.View>
                                </Pressable>
                                <Pressable onPress={HandleCancel}>
                                    <Animated.View style={[styles.button, { transform: [{ scale: scaleValueCancel }] }]}>
                                        <Text style={styles.text}>Cancel</Text>
                                    </Animated.View>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
            <RenamePopUp
                Rename={Rename}
                visible={renameVisible}
                onClose={() => setRenameVisible(false)}
                animate={animateButton}
            />
        </>
    );
}
const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 35,
    },
    modalView: {
        justifyContent: 'flex-end',
        gap: 12,
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    text: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
    },
    button: {
        width: 120,
        height: 50,
        borderRadius: 15,
        borderColor: 'white',
        backgroundColor: 'white',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modal: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    textInput: {
        width: '100%',
        height: 50,
        borderColor: 'black',
        paddingHorizontal: 10,
        color: 'black',
        borderRadius: 10,
        borderWidth: 2,
    },
});
export default CustomModal