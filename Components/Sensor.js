import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, PermissionsAndroid } from 'react-native';
import GeoLocation from 'react-native-geolocation-service';
import { accelerometer, setUpdateIntervalForType, SensorTypes } from 'react-native-sensors';

const LOCATION_UPDATE_INTERVAL = 10000;
const ORIENTATION_UPDATE_INTERVAL = 500;

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
            { enableHighAccuracy: true, distanceFilter: 1, timeout: 15000, maximumAge: 10000 }
        );
    }, []);

    useEffect(() => {
        getCurrentPosition(); // Get initial location
        const locationIntervalId = setInterval(getCurrentPosition, LOCATION_UPDATE_INTERVAL);
        return () => clearInterval(locationIntervalId); // Cleanup interval on component unmount
    }, [getCurrentPosition]);

    useEffect(() => {
        setUpdateIntervalForType(SensorTypes.accelerometer, ORIENTATION_UPDATE_INTERVAL);

        const subscription = accelerometer.subscribe(({ x, y, z }) => {
            setOrientation({ x, y, z });
        });

        return () => subscription.unsubscribe(); // Cleanup subscription on component unmount
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Current Location</Text>
            <Text style={styles.text}>Latitude: {location.latitude !== null ? location.latitude.toFixed(6) : 'N/A'}</Text>
            <Text style={styles.text}>Longitude: {location.longitude !== null ? location.longitude.toFixed(6) : 'N/A'}</Text>
            <Text style={styles.text}>Altitude: {location.altitude !== null ? location.altitude.toFixed(2) : 'N/A'}</Text>
            <Text style={styles.text}>Speed: {location.speed !== null ? location.speed.toFixed(2) : 'N/A'}</Text>
            <Text style={styles.title}>Current Orientation</Text>
            <Text style={styles.text}>X: {orientation.x.toFixed(2)}</Text>
            <Text style={styles.text}>Y: {orientation.y.toFixed(2)}</Text>
            <Text style={styles.text}>Z: {orientation.z.toFixed(2)}</Text>
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
});

export default Sensor;
