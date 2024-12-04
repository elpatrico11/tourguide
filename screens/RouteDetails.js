// RouteDetails.js

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Linking,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";

const RouteDetails = ({ route, navigation }) => {
  const { routeId } = route.params;
  const [routeDetails, setRouteDetails] = useState(null);
  const [error, setError] = useState(null); // Added error state
  const [arrivedWaypoints, setArrivedWaypoints] = useState([]); // Track arrived waypoints

  useEffect(() => {
    const loadRoute = async () => {
      try {
        const storedRoute = await AsyncStorage.getItem(`route_${routeId}`); // Corrected string interpolation
        const networkState = await NetInfo.fetch();

        if (networkState.isConnected) {
          fetchRouteFromServer();
        } else if (storedRoute) {
          setRouteDetails(JSON.parse(storedRoute));
          initializeArrivedWaypoints(JSON.parse(storedRoute));
        } else {
          setError(
            "No internet connection and no stored route data available."
          );
        }
      } catch (err) {
        console.error("Error loading route:", err);
        setError("An unexpected error occurred.");
      }
    };

    loadRoute();
  }, [routeId]);

  const fetchRouteFromServer = () => {
    axios
      .get(`http://192.168.18.11:3000/routes/${routeId}`) // Use 'localhost' if testing on emulator; adjust accordingly for physical devices
      .then((response) => {
        setRouteDetails(response.data);
        saveRouteToLocal(response.data); // Save data locally for offline access
        initializeArrivedWaypoints(response.data);
      })
      .catch((error) => {
        console.error("Error fetching route details:", error);
        setError("Failed to fetch route details.");
      });
  };

  const initializeArrivedWaypoints = (data) => {
    setArrivedWaypoints(new Array(data.waypoints.length).fill(false));
  };

  const saveRouteToLocal = async (data) => {
    try {
      await AsyncStorage.setItem(`route_${routeId}`, JSON.stringify(data)); // Corrected string interpolation
      console.log("Route saved locally");
    } catch (error) {
      console.error("Failed to save route: ", error);
    }
  };

  // Function to open Google Maps for navigation
  const openInGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`; // Corrected string interpolation
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open Google Maps:", err)
    );
  };

  // Function to simulate arrival at the next waypoint
  const simulateArrival = () => {
    if (!routeDetails || !routeDetails.waypoints) return;

    // Find the index of the first waypoint that hasn't been arrived at
    const nextIndex = arrivedWaypoints.findIndex((arrived) => !arrived);

    if (nextIndex === -1) {
      Alert.alert("All waypoints have been arrived at.");
      return;
    }

    // Get the waypoint details
    const waypoint = routeDetails.waypoints[nextIndex];

    // Update the arrivedWaypoints state
    const updatedArrivedWaypoints = [...arrivedWaypoints];
    updatedArrivedWaypoints[nextIndex] = true;
    setArrivedWaypoints(updatedArrivedWaypoints);

    // Display the waypoint description
    Alert.alert(
      `Arrived at ${waypoint.name}`,
      waypoint.description,
      [{ text: "OK" }],
      { cancelable: false }
    );
  };

  if (!routeDetails && !error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading route details...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.container}>
        <Text style={styles.title}>{routeDetails.name}</Text>
        <Text style={styles.subtitle}>
          <Text style={styles.label}>Start Point:</Text>{" "}
          {routeDetails.start.address}
        </Text>
        <Text style={styles.subtitle}>
          <Text style={styles.label}>End Point:</Text>{" "}
          {routeDetails.end.address}
        </Text>

        <Button
          title="View Entire Route on Map"
          onPress={() =>
            navigation.navigate("MapScreen", {
              start: routeDetails.start,
              end: routeDetails.end,
              waypoints: routeDetails.waypoints,
              arrivedWaypoints: arrivedWaypoints, // Pass arrivedWaypoints to MapScreen
            })
          }
        />

        <Text style={styles.waypointsTitle}>Waypoints:</Text>
        {Array.isArray(routeDetails.waypoints) &&
        routeDetails.waypoints.length > 0 ? (
          routeDetails.waypoints.map((waypoint, index) => (
            <View key={index} style={styles.waypointContainer}>
              <Text style={styles.waypointName}>{waypoint.name}</Text>
              <Text style={styles.waypointDescription}>
                {waypoint.description}
              </Text>
              <Text style={styles.coordinates}>
                <Text style={styles.label}>Location:</Text> {waypoint.address}
              </Text>
              <Button
                title="Navigate to Waypoint"
                onPress={() =>
                  openInGoogleMaps(waypoint.latitude, waypoint.longitude)
                }
              />
              {/* Optional: Indicate if the waypoint has been arrived at */}
              {arrivedWaypoints[index] && (
                <Text style={styles.arrivedText}>Arrived</Text>
              )}
            </View>
          ))
        ) : (
          <Text>No waypoints available</Text>
        )}

        <Button
          title="Navigate to Start"
          onPress={() =>
            openInGoogleMaps(
              routeDetails.start.latitude,
              routeDetails.start.longitude
            )
          }
        />
        <Button
          title="Navigate to End"
          onPress={() =>
            openInGoogleMaps(
              routeDetails.end.latitude,
              routeDetails.end.longitude
            )
          }
        />
        <View style={styles.simulateButtonContainer}>
          <Button title="Simulate Arrival" onPress={simulateArrival} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "lightcoral",
    padding: 20,
  },
  errorText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10 },
  subtitle: { fontSize: 18, marginVertical: 5 },
  waypointsTitle: { fontSize: 20, marginTop: 20, fontWeight: "bold" },
  waypointContainer: { marginVertical: 10 },
  waypointName: { fontSize: 16, fontWeight: "bold" },
  waypointDescription: { fontSize: 16, color: "gray" },
  coordinates: { fontSize: 14, color: "darkgray", marginBottom: 5 },
  arrivedText: {
    color: "green",
    fontWeight: "bold",
    marginTop: 5,
  },
  simulateButtonContainer: {
    marginTop: 20,
    marginBottom: 40,
  },
  label: {
    fontWeight: "bold",
  },
});

export default RouteDetails;
