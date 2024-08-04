import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Button, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Camera, useCameraDevice, useCameraDevices } from "react-native-vision-camera";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useFocusEffect } from "@react-navigation/native";

const CameraScreen = () => {
    const camera = useRef(null);
    const device = useCameraDevice('front');

    const [showCamera, setShowCamera] = useState(false);
    const [imageSource, setImageSource] = useState('');
    const [scaleValueCapture] = useState(new Animated.Value(1));
    const [scaleValueDiscard] = useState(new Animated.Value(1));
    const [scaleValueSave] = useState(new Animated.Value(1));
    
    useFocusEffect(
        useCallback(() => {
            async function getPermission() {
                const permission = await Camera.requestCameraPermission();
                console.log(`Camera permission status: ${permission}`);
                if (permission === 'granted') setShowCamera(true);
                if (permission === 'denied') await Linking.openSettings();
            }
            getPermission();

            return () => {
                setShowCamera(false);
                setImageSource('');
            };
        }, [])
    )
    const animateButton = (value) => {
        Animated.timing(value, {
            toValue: 0.7,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            Animated.timing(value, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }).start();
        });
    };
    const CaptureImage = async () => {
        animateButton(scaleValueCapture);
        if (camera.current !== null) {
            const photo = await camera.current.takePhoto({});
            setImageSource(photo.path);
            setShowCamera(false);
            console.log(photo.path);
        }
    }
    const saveToGallery = async () => {
        animateButton(scaleValueSave);
        if (imageSource) {
            try {
                await CameraRoll.save(`file://${imageSource}`, { type: 'photo', album: 'react'});
                console.log('Image saved to gallery');
            } catch (error) {
                console.error('Error saving image to gallery:', error);
            }
        }
        setShowCamera(true);
    }
    const discardImage = () => {
        animateButton(scaleValueDiscard);
        setTimeout(() => {
            setImageSource('');
            setShowCamera(true);
        }, 200);
    }

    if (device == null) {
        return <View style={styles.container}><Text style={styles.text}>No Camera Found</Text></View>
    }
    return (
        <View style={styles.container}>
            {showCamera ? (
                <>
                    <Camera
                        key={camera}
                        ref={camera}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={showCamera}
                        photo={true}
                    />
                    <View style={styles.buttoncontainer}>
                        <Pressable style={styles.outercircle} >
                            <Pressable onPress={CaptureImage}>
                                <Animated.View style={[styles.captureButton, { transform: [{ scale: scaleValueCapture }] }]}>
                                </Animated.View>
                            </Pressable>
                        </Pressable>
                    </View>
                </>
            ) : (
                <>
                    {imageSource !== '' ? (
                        <Image
                            style={styles.image}
                            source={{ uri: `file://'${imageSource}` }}
                        />
                    ) : null}
                    <View style={styles.buttoncontainer}>
                        <Pressable onPress={discardImage}>
                            <Animated.View style={[styles.button, { transform: [{ scale: scaleValueDiscard }] }]}>
                                <Text style={styles.text}>Discard</Text>
                            </Animated.View>
                        </Pressable>
                        <Pressable onPress={saveToGallery}>
                            <Animated.View style={[styles.button, { transform: [{ scale: scaleValueSave }] }]}>
                                <Text style={styles.text}>Save</Text>
                            </Animated.View>
                        </Pressable>
                    </View>
                </>
            )
            }
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outercircle: {
        width: 80,
        height: 80,
        borderColor: 'white',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
    },
    text: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'white',
    },
    buttoncontainer: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        alignItems: 'center',
        borderColor: 'black',
        justifyContent: 'space-evenly',
        width: '100%',
        flexDirection: 'row',
    },
    image: {
        ...StyleSheet.absoluteFill
    },
    button: {
        width: 100,
        height: 50,
        borderRadius: 15,
        borderColor: 'white',
        backgroundColor: 'white',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
export default CameraScreen