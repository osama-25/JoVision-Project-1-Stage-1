import React, { useEffect, useRef, useState } from "react";
import { Alert, FlatList, Image, PermissionsAndroid, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import CustomModal from "./CustomModal";
import RNFS from 'react-native-fs';
import { useNavigation } from "@react-navigation/native";

const Gallery = () => {
    const flatListRef = useRef(null);
    const [mediaData, setMediaData] = useState([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation();

    const fetchPhotos = async () => {
        const files = await RNFS.readDir(RNFS.ExternalCachesDirectoryPath);
        const mediaFiles = files.map(file => ({
            id: file.name,
            name: file.name,
            source: file.path,
            type: file.name.endsWith('.jpg') ? 'photo' : 'video'
        }));
        setMediaData(mediaFiles);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchPhotos();
    }, [])

    const onRefresh = () => {
        setRefreshing(true);
        fetchPhotos();
    };

    const renderMedia = ({ item, index }) => {
        return (
            <Pressable onPress={() => handlePress(item, index)}>
                <Icon name={item.type && item.type.startsWith('video') ? 'videocam' : 'camera'} size={26} color={'white'} style={styles.view} />
                <Image source={{ uri: 'file://' + item.source }} style={styles.image} />
            </Pressable>
        );
    }

    const handlePress = (item, index) => {
        console.log(item);
        console.log(index);
        setSelectedItem(item);
        setSelectedItemIndex(index);
        setModalVisible(true);
    };

    const handleRename = (newName) => {
        if (selectedItem) {
            renameFile(newName);
        }
        setModalVisible(false);
    };

    const renameFile = async (newName) => {
        const fileExtension = selectedItem.type == 'video' ? 'mp4' : 'jpg';

        const oldPath = selectedItem.source;
        const newPath = oldPath.replace(/\/[^/]+$/, `/${newName}.${fileExtension}`);

        try {
            await RNFS.moveFile(oldPath, newPath);
            Alert.alert('Success', `File renamed to ${newPath}`);
            onRefresh();
        } catch (error) {
            Alert.alert('Error', 'Failed to rename file: ' + error.message);
        }
    }

    const DeleteFile = async () => {
        try {
            const fileExists = await RNFS.exists(selectedItem.source);
            if (!fileExists) {
                throw new Error('File does not exist');
            }

            await RNFS.unlink(selectedItem.source)
                .then(() => {
                    console.log('FILE DELETED');
                })
                .catch((err) => {
                    console.log('Unlink error:', err.message);
                    throw err;  // Rethrow the error to be caught by the outer catch block
                });

            onRefresh();
        } catch (error) {
            console.log('DeleteFile error:', error.message);
            Alert.alert('Error', 'Failed to delete file: ' + error.message);
        }
    }

    const fullScreen = () => {
        console.log(selectedItemIndex);
        navigation.navigate('SlideShow', { media: selectedItem, index: selectedItemIndex });
    }

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={mediaData}
                renderItem={renderMedia}
                keyExtractor={item => item.id}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
            {selectedItem && (
                <CustomModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    Rename={handleRename}
                    Delete={DeleteFile}
                    fullScreen={fullScreen}
                />
            )}
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
        marginTop: 20,
        height: 600,
        width: 350,
        zIndex: -1,
    },
    view: {
        position: 'absolute',
        top: 20,
        margin: 4,
    },
});
export default Gallery