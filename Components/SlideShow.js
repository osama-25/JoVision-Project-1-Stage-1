import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button, PermissionsAndroid, Alert, Pressable, Animated } from 'react-native';

const Slideshow = () => {
    const [imageData, setImageData] = useState([]);
    const [isPlaying, setIsPlaying] = useState(true);
    const flatListRef = useRef(null);
    const currentIndex = useRef(0);
    const [scaleValue] = useState(new Animated.Value(1));

    const animateButton = () => {
        Animated.timing(scaleValue, {
            toValue: 0.7,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            Animated.timing(scaleValue, {
                toValue: 1,
                duration: 100,
                useNativeDriver: true,
            }).start();
        });
    };

    const requestPermissions = async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                {
                    title: 'Read External Storage Permission',
                    message: 'This app needs access to your photos.',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                }
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
            console.warn(err);
            return false;
        }
    };

    const fetchPhotos = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Storage permission is required to access photos.');
            return;
        }

        CameraRoll.getPhotos({
            first: 50, // Number of photos to load
            groupName: 'react',
            assetType: 'Photos',
        })
            .then(r => {
                const images = r.edges.map(edge => ({
                    id: edge.node.image.uri,
                    source: edge.node.image.uri,
                }));
                setImageData(images);
            })
            .catch(err => {
                console.error('Error loading images:', err);
            });
    };

    useEffect(() => {
        fetchPhotos();
    }, []);

    useEffect(() => {
        if (isPlaying && imageData.length > 0) {
            const interval = setInterval(() => {
                currentIndex.current = (currentIndex.current + 1) % imageData.length;
                flatListRef.current.scrollToIndex({ index: currentIndex.current, animated: true });
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [isPlaying, imageData]);

    const togglePlayPause = () => {
        animateButton();
        setIsPlaying(!isPlaying);
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={imageData}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <Image source={{ uri: item.source }} style={styles.image} />
                )}
                scrollEnabled={false} // Disable manual scrolling
            />
            <Pressable onPress={togglePlayPause}>
                <Animated.View style={[styles.button, { transform: [{ scale: scaleValue }] }]}>
                    <Text style={styles.text}>{isPlaying ? 'Pause' : 'Resume'}</Text>
                </Animated.View>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        color: 'black',
    },
    image: {
        width: 300,
        height: 400,
        margin: 5,
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
    text: {
        fontSize: 20,
        color: 'black',
        fontWeight: 'bold',
    },
});

export default Slideshow;
