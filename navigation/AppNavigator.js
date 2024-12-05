import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import RoutesList from "../screens/RoutesList";
import RouteDetails from "../screens/RouteDetails";
import NavigationScreen from "../screens/NavigationScreen";
import MapScreen from "../screens/MapScreen"; // Import MapScreen

const Stack = createStackNavigator();

const AppNavigator = () => (
  <Stack.Navigator initialRouteName="RoutesList">
    <Stack.Screen
      name="RoutesList"
      component={RoutesList}
      options={{ title: "Choose Route" }}
    />
    <Stack.Screen
      name="RouteDetails"
      component={RouteDetails}
      options={{ title: "Route Details" }}
    />
    <Stack.Screen
      name="NavigationScreen"
      component={NavigationScreen}
      options={{ title: "Navigation" }}
    />
    <Stack.Screen
      name="MapScreen"
      component={MapScreen} // Add MapScreen to the stack
      options={{ title: "Map" }}
    />
  </Stack.Navigator>
);

export default AppNavigator;
