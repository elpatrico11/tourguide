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
      options={{ title: "Wybierz Trasę" }}
    />
    <Stack.Screen
      name="RouteDetails"
      component={RouteDetails}
      options={{ title: "Szczegóły Trasy" }}
    />
    <Stack.Screen
      name="NavigationScreen"
      component={NavigationScreen}
      options={{ title: "Nawigacja" }}
    />
    <Stack.Screen
      name="MapScreen"
      component={MapScreen} // Add MapScreen to the stack
      options={{ title: "Mapa" }}
    />
  </Stack.Navigator>
);

export default AppNavigator;
