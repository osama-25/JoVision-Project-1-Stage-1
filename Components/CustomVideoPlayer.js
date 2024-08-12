import React, { useRef, useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Pressable, Animated } from 'react-native';
import Video from 'react-native-video';
import Icon from "react-native-vector-icons/Ionicons";

const CustomVideoPlayer = ({ source }) => {
    const videoRef = useRef(null);
    const [paused, setPaused] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [scaleValueRewind] = useState(new Animated.Value(1));
    const [scaleValueForward] = useState(new Animated.Value(1));

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

    const togglePlayPause = () => {
        setPaused(!paused);
    };

    const seekForward = () => {
        animateButton(scaleValueForward);
        setTimeout(() => {
            videoRef.current.seek(currentTime + 5);
        }, 200);
    }

    const seekBackward = () => {
        animateButton(scaleValueRewind);
        setTimeout(() => {
            videoRef.current.seek(currentTime - 5);
        }, 200);
    }

    const onProgress = (data) => {
        setCurrentTime(data.currentTime);
        console.log(currentTime);
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.videoWrapper} onPress={togglePlayPause}>
                <Video
                    ref={videoRef}
                    source={{ uri: 'file://' + source }}
                    style={styles.video}
                    paused={paused}
                    resizeMode="cover"
                    repeat={true}
                    onProgress={onProgress}
                />
                {paused && (
                    <View style={styles.playPauseOverlay}>
                        <Icon name='play' size={50} color={'white'} />
                    </View>
                )}
                <View style={styles.buttonContainer}>
                    <Pressable onPress={seekBackward}>
                        <Animated.View style={[styles.button, { transform: [{ scale: scaleValueRewind }] }]}>
                            <Text style={styles.text}>-5</Text>
                        </Animated.View>
                    </Pressable>
                    <Pressable onPress={seekForward}>
                        <Animated.View style={[styles.button, { transform: [{ scale: scaleValueForward }] }]}>
                            <Text style={styles.text}>+5</Text>
                        </Animated.View>
                    </Pressable>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    videoWrapper: {
        width: 350,
        height: 500,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '100%',
        height: '100%',
    },
    playPauseOverlay: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
    },
    buttonContainer: {
        width: '100%',
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        bottom: 20,
    },
    button: {
        width: 50,
        height: 50,
        borderRadius: 35,
        borderColor: 'white',
        backgroundColor: 'grey',
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    text: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
    },
});

export default CustomVideoPlayer