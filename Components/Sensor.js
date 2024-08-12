import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid, Image, ScrollView } from 'react-native';
import GeoLocation from 'react-native-geolocation-service';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

const LOCATION_UPDATE_INTERVAL = 10000;
const ORIENTATION_UPDATE_INTERVAL = 500;
const SPEED_X = 10;
const SPEED_Y = 3;

const requestPermissions = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Location Permission',
                message: 'This app needs access to your location.',
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

const Sensor = () => {
    const [location, setLocation] = useState({
        latitude: null,
        longitude: null,
        altitude: null,
        speed: null,
    });
    const [orientation, setOrientation] = useState({
        x: 0,
        y: 0,
        z: 0,
    });

    const getCurrentPosition = useCallback(async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) {
            Alert.alert('Permission Denied', 'Location permission is required to use this feature.');
            return;
        }

        GeoLocation.getCurrentPosition(
            (pos) => {
                console.log(pos);
                const { latitude, longitude, altitude, speed } = pos.coords;
                setLocation({ latitude, longitude, altitude, speed });
            },
            (error) => Alert.alert('GetCurrentPosition Error', JSON.stringify(error)),
            { enableHighAccuracy: true }
        );
    }, []);

    useEffect(() => {
        getCurrentPosition();
        const locationIntervalId = setInterval(getCurrentPosition, LOCATION_UPDATE_INTERVAL);
        return () => clearInterval(locationIntervalId);
    }, [getCurrentPosition]);

    useEffect(() => {
        setUpdateIntervalForType(SensorTypes.accelerometer, ORIENTATION_UPDATE_INTERVAL);

        const subscription = accelerometer.subscribe(({ x, y, z }) => {
            setOrientation({ x, y, z });
        });

        return () => subscription.unsubscribe();
    }, []);

    const renderSpeedImage = () => {
        if (location.speed !== null) {
            if (location.speed > SPEED_X) {
                return <Image source={require('../assets/car.jpg')} style={styles.image} />;
            } else if (location.speed > SPEED_Y) {
                return <Image source={require('../assets/walking.jpg')} style={styles.image} />;
            } else {
                return <Image source={require('../assets/sitting.jpg')} style={styles.image} />;
            }
        }
        return null;
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <Text style={styles.title}>Current Location</Text>
                <Text style={styles.text}>Latitude: {location.latitude !== null ? location.latitude.toFixed(6) : 'N/A'}</Text>
                <Text style={styles.text}>Longitude: {location.longitude !== null ? location.longitude.toFixed(6) : 'N/A'}</Text>
                <Text style={styles.text}>Altitude: {location.altitude !== null ? location.altitude.toFixed(2) : 'N/A'}</Text>
                <Text style={styles.text}>Speed: {location.speed !== null ? location.speed.toFixed(2) : 'N/A'}</Text>
                {renderSpeedImage()}
                <Text style={styles.title}>Current Orientation</Text>
                <Text style={styles.text}>X: {orientation.x.toFixed(2)}</Text>
                <Text style={styles.text}>Y: {orientation.y.toFixed(2)}</Text>
                <Text style={styles.text}>Z: {orientation.z.toFixed(2)}</Text>
                <Image source={require('../assets/0.jpeg')} style={styles.image}/>
            </ScrollView>
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
    text: {
        fontSize: 18,
        marginBottom: 8,
        color: 'black',
    },
    image: {
        width: 150,
        height: 150,
    }
});

export default Sensor;
