import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const RouteDetails = ({ route, navigation }) => {
  const { routeId } = route.params;
  const [routeDetails, setRouteDetails] = useState(null);

  useEffect(() => {
    // Check network status and load data accordingly
    const loadRoute = async () => {
      const storedRoute = await AsyncStorage.getItem(`route_${routeId}`);
      const networkState = await NetInfo.fetch();

      if (networkState.isConnected) {
        // If connected to the internet, fetch data from server
        fetchRouteFromServer();
      } else if (storedRoute) {
        // If offline, load from AsyncStorage
        setRouteDetails(JSON.parse(storedRoute));
      } else {
        console.error(
          "No internet connection and no stored route data available."
        );
      }
    };

    loadRoute();
  }, [routeId]);

  const fetchRouteFromServer = () => {
    axios
      .get(`http://192.168.227.98:3000/routes/${routeId}`)
      .then((response) => {
        setRouteDetails(response.data);
        saveRouteToLocal(response.data); // Save data locally for offline access
      })
      .catch((error) => {
        console.error("Error fetching route details:", error);
      });
  };

  const saveRouteToLocal = async (data) => {
    try {
      await AsyncStorage.setItem(`route_${routeId}`, JSON.stringify(data));
      console.log("Route saved locally");
    } catch (error) {
      console.error("Failed to save route: ", error);
    }
  };

  if (!routeDetails) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{routeDetails.name}</Text>
      <Text style={styles.subtitle}>
        Start Point: {routeDetails.start.latitude},{" "}
        {routeDetails.start.longitude}
      </Text>
      <Text style={styles.subtitle}>
        End Point: {routeDetails.end.latitude}, {routeDetails.end.longitude}
      </Text>

      <Text style={styles.waypointsTitle}>Waypoints:</Text>
      {routeDetails.waypoints.map((waypoint, index) => (
        <View key={index} style={styles.waypointContainer}>
          <Text style={styles.waypointName}>{waypoint.name}</Text>
          <Text style={styles.waypointDescription}>{waypoint.description}</Text>
          <Text style={styles.coordinates}>
            Location: {waypoint.latitude}, {waypoint.longitude}
          </Text>
        </View>
      ))}

      <Button
        title="View on Map"
        onPress={() =>
          navigation.navigate("MapScreen", {
            start: routeDetails.start,
            end: routeDetails.end,
            waypoints: routeDetails.waypoints,
          })
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: "bold" },
  subtitle: { fontSize: 18, marginVertical: 5 },
  waypointsTitle: { fontSize: 20, marginTop: 20, fontWeight: "bold" },
  waypointContainer: { marginVertical: 10 },
  waypointName: { fontSize: 16, fontWeight: "bold" },
  waypointDescription: { fontSize: 16, color: "gray" },
  coordinates: { fontSize: 14, color: "darkgray" },
});

export default RouteDetails;
