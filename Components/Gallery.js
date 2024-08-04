import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Image, PermissionsAndroid, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";

const Gallery = () => {
    const flatListRef = useRef(null);
    const [imageData, setImageData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

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
                setRefreshing(false);
            })
            .catch(err => {
                console.error('Error loading images:', err);
                setRefreshing(false);
            });
    };

    useEffect(() => {
        fetchPhotos();
    }, [])

    const onRefresh = () => {
        setRefreshing(true);
        fetchPhotos();
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={imageData}
                renderItem={({ item }) => (
                    <Image source={{ uri: item.source }} style={styles.image} />
                )}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    image: {
        marginTop: 15,
        height: 400,
        width: 300,
    },
    view: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        position: 'absolute',
        top: 20,
        width: '100%',
    },
});
export default Gallery