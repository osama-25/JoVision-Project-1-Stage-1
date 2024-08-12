import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Button, Image, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Camera, useCameraDevice, useCameraDevices } from "react-native-vision-camera";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import { useFocusEffect } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import Video from "react-native-video";
import RNFS from 'react-native-fs';

const CameraScreen = () => {
    const camera = useRef(null);
    const frontCam = useCameraDevice('front');
    const backCam = useCameraDevice('back');
    const icons = [
        'videocam-outline',
        'camera-outline'
    ];

    const [isRecording, setIsRecording] = useState(false);
    const [videoState, setVideoState] = useState(false);
    const [iconsIndex, setIconsIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [imageSource, setImageSource] = useState('');
    const [videoSource, setVideoSource] = useState('');
    const [scaleValueCapture] = useState(new Animated.Value(1));
    const [scaleValueDiscard] = useState(new Animated.Value(1));
    const [scaleValueSave] = useState(new Animated.Value(1));
    const [scaleValueFlip] = useState(new Animated.Value(1));
    const [scaleValueVideo] = useState(new Animated.Value(1));

    useFocusEffect(
        useCallback(() => {
            async function getPermission() {
                const permission = await Camera.requestCameraPermission();
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
                duration: 50,
                useNativeDriver: true,
            }).start();
        });
    };
    const animateVideoButton = (value, targetScale) => {
        Animated.timing(value, {
            toValue: targetScale,
            duration: 50,
            useNativeDriver: true,
        }).start();
    };

    const startRecording = async () => {
        animateVideoButton(scaleValueCapture, 0.7);
        if (camera.current !== null) {
            setIsRecording(true);
            const video = await camera.current.startRecording({
                onRecordingFinished: (video) => {
                    console.log('Recording finished', video);
                    animateButton(scaleValueCapture, 1);
                    setVideoSource(video.path);
                    setIsRecording(false);
                    setShowCamera(false);
                },
                onRecordingError: (error) => {
                    console.error('Recording error', error);
                    animateButton(scaleValueCapture, 1);
                    setIsRecording(false);
                },
            });
        }
    };

    const stopRecording = async () => {
        animateButton(scaleValueCapture, 1);
        if (camera.current !== null) {
            camera.current.stopRecording();
        }
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

    const generateFileName = (extension) => {
        const currentDate = new Date().toString().replace(/:/g, '_');
        return `Osama_${currentDate}.${extension}`;
    };
    const saveFileWithCustomName = async (sourcePath, type) => {
        const fileExtension = type === 'photo' ? 'jpg' : 'mp4';
        const fileName = generateFileName(fileExtension);
        const newPath = `${RNFS.ExternalCachesDirectoryPath}/${fileName}`;
        console.log(newPath);
        try {
            await RNFS.moveFile(sourcePath, newPath);
        } catch (error) {
            console.error(`Error saving ${type} to gallery:`, error);
        } finally {
            setImageSource('');
            setVideoSource('');
        }
    }
    const saveToGallery = async () => {
        animateButton(scaleValueSave);
        if (imageSource) {
            try {
                await saveFileWithCustomName(imageSource, 'photo');
                console.log('Image saved to gallery');
            } catch (error) {
                console.error('Error saving image to gallery:', error);
            }
        }
        else if (videoSource) {
            try {
                await saveFileWithCustomName(videoSource, 'video');
                console.log('Video saved to gallery');
            } catch (error) {
                console.error('Error saving video to gallery:', error);
            }
        }
        setShowCamera(true);
    }
    const discardMedia = () => {
        animateButton(scaleValueDiscard);
        setTimeout(() => {
            setImageSource('');
            setVideoSource('');
            setShowCamera(true);
        }, 200);
    }

    const FlipCamera = () => {
        animateButton(scaleValueFlip);
        setIsFlipped(!isFlipped);
    }

    const ChangeVideoCam = () => {
        animateButton(scaleValueVideo);
        setIconsIndex(prevIndex => (prevIndex === 0 ? 1 : 0));
        setVideoState(!videoState);
    }

    if (frontCam == null) {
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
                        device={isFlipped ? frontCam : backCam}
                        isActive={showCamera}
                        photo={true}
                        video={videoState}
                    />
                    <View style={styles.buttoncontainer}>
                        {!isRecording ? (<Pressable onPress={ChangeVideoCam}>
                            <Animated.View style={[styles.circle, { transform: [{ scale: scaleValueVideo }] }]}>
                                <Icon name={icons[iconsIndex]} size={26} color={'white'} />
                            </Animated.View>
                        </Pressable>) : null}
                        <Pressable style={styles.outercircle} >
                            <Pressable onPress={isRecording ? stopRecording : (videoState ? startRecording : CaptureImage)}>
                                <Animated.View style={[styles.captureButton, { borderColor: videoState ? 'red' : 'white', backgroundColor: videoState ? 'red' : 'white', transform: [{ scale: scaleValueCapture }] }]}>
                                </Animated.View>
                            </Pressable>
                        </Pressable>
                        {!isRecording ? (<Pressable onPress={FlipCamera}>
                            <Animated.View style={[styles.circle, { transform: [{ scale: scaleValueFlip }] }]}>
                                <Icon name={"camera-reverse-outline"} size={26} color={'white'} />
                            </Animated.View>
                        </Pressable>) : null}
                    </View>
                </>
            ) : (
                <>
                    {imageSource !== '' ? (
                        <Image
                            style={styles.image}
                            source={{ uri: `file://${imageSource}` }}
                        />
                    ) : videoSource !== '' ? (
                        <Video
                            source={{ uri: `file://${videoSource}` }}
                            style={StyleSheet.absoluteFill}
                            controls={false}
                            repeat={true}
                            resizeMode="contain"
                        />
                    ) : null}
                    <View style={styles.buttoncontainer}>
                        <Pressable onPress={discardMedia}>
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
        shadowColor: 'black',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    circle: {
        width: 50,
        height: 50,
        borderRadius: 35,
        backgroundColor: '#C0C0C0',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
export default CameraScreen