import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import React from "react";
import Camera from "./Camera";
import Sensor from "./Sensor";
import Gallery from "./Gallery";
import SlideShow from "./SlideShow";
import Icon from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();
const Project = () => {
    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ focused, color, size }) => {
                        let iconName;
                        if (route.name === 'Camera') {
                            iconName = focused ? 'camera' : 'camera-outline';
                        } else if (route.name === 'Sensor') {
                            iconName = focused ? 'speedometer' : 'speedometer-outline';
                        } else if (route.name === 'Gallery') {
                            iconName = focused ? 'image' : 'image-outline';
                        } else{
                            iconName = focused ? 'albums' : 'albums-outline';
                        }
                        return <Icon name={iconName} size={size} color={color} />;
                    },
                    tabBarLabel: () => null,
                    tabBarActiveTintColor: 'black',
                    tabBarInactiveTintColor: 'gray',
                    headerTitleAlign: 'center',
                    unmountOnBlur: true,
                })}
            >
                <Tab.Screen name='Camera' component={Camera} options={{headerShown: false}}/>
                <Tab.Screen name='Sensor' component={Sensor} />
                <Tab.Screen name='Gallery' component={Gallery} />
                <Tab.Screen name='SlideShow' component={SlideShow} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}
export default Project