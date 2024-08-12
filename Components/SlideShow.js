import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Button, Alert, Pressable, Animated } from 'react-native';
import RNFS from 'react-native-fs';
import Video from 'react-native-video';
import CustomVideoPlayer from './CustomVideoPlayer';

const SlideShow = ({ route }) => {
    const { media, index } = route.params;
    const [mediaData, setMediaData] = useState([]);
    const [isPlaying, setIsPlaying] = useState(true);
    const flatListRef = useRef(null);
    const currentIndex = useRef(index);
    const [scaleValuePrev] = useState(new Animated.Value(1));
    const [scaleValueNext] = useState(new Animated.Value(1));

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

    const fetchPhotos = async () => {
        const files = await RNFS.readDir(RNFS.ExternalCachesDirectoryPath);
        const mediaFiles = files.map(file => ({
            id: file.name,
            name: file.name,
            source: file.path,
            type: file.name.endsWith('.jpg') ? 'photo' : 'video'
        }));
        setMediaData(mediaFiles);
    };

    useEffect(() => {
        fetchPhotos();
        setTimeout(() => {
            if (index != null && flatListRef.current) {
                flatListRef.current.scrollToIndex({ index: index });
            }
        }, 500);
    }, []);

    const renderMedia = ({ item }) => {
        if (item.type == 'video') {
            return (
                <CustomVideoPlayer source={item.source} />
            );
        } else {
            return (
                <Image
                    source={{ uri: 'file://' + item.source }}
                    style={styles.media}
                />
            );
        }
    };

    const prevMedia = () => {
        animateButton(scaleValuePrev);
        setTimeout(() => {
            currentIndex.current = (currentIndex.current - 1) % mediaData.length;
            flatListRef.current.scrollToIndex({ index: currentIndex.current, animated: true });
        }, 200);
    }

    const nextMedia = () => {
        animateButton(scaleValueNext);
        setTimeout(() => {
            currentIndex.current = (currentIndex.current + 1) % mediaData.length;
            flatListRef.current.scrollToIndex({ index: currentIndex.current, animated: true });
        }, 200);
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={mediaData}
                horizontal
                keyExtractor={(item) => item.id}
                renderItem={renderMedia}
                scrollEnabled={false} // Disable manual scrolling
            />
            <View style={styles.buttoncontainer}>
                <Pressable onPress={prevMedia}>
                    <Animated.View style={[styles.button, { transform: [{ scale: scaleValuePrev }] }]}>
                        <Text style={styles.text}>Previous</Text>
                    </Animated.View>
                </Pressable>
                <Pressable onPress={nextMedia}>
                    <Animated.View style={[styles.button, { transform: [{ scale: scaleValueNext }] }]}>
                        <Text style={styles.text}>Next</Text>
                    </Animated.View>
                </Pressable>
            </View>
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
    media: {
        width: 370,
        height: 500,
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
});

export default SlideShow;
