// MapScreen.js

import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";

const MapScreen = ({ route }) => {
  const { start, end, waypoints, arrivedWaypoints } = route.params;
  const [routeGeometry, setRouteGeometry] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRouteGeometry = async () => {
      try {
        const waypointCoordinates = waypoints.map((wp) => ({
          lon: wp.longitude,
          lat: wp.latitude,
        }));

        const response = await axios.get(
          "http://192.168.18.11:3000/api/route", // Use 'localhost' if testing on emulator; adjust accordingly for physical devices
          {
            params: {
              startLon: start.longitude,
              startLat: start.latitude,
              endLon: end.longitude,
              endLat: end.latitude,
              waypoints: JSON.stringify(waypointCoordinates),
            },
          }
        );

        if (
          response.data &&
          response.data.routeGeometry &&
          response.data.routeGeometry.length > 0
        ) {
          const geometry = response.data.routeGeometry;
          setRouteGeometry(geometry);
        } else {
          setError("No valid route data received.");
        }
      } catch (err) {
        console.error("Error fetching route geometry:", err);
        setError("Failed to fetch route data.");
      } finally {
        setLoading(false);
      }
    };

    fetchRouteGeometry();
  }, [start, end, waypoints]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading route...</Text>
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

  const routeData = {
    start,
    end,
    waypoints,
    routeGeometry,
    arrivedWaypoints, // Include arrivedWaypoints in the data passed to the map
  };

  return (
    <WebView
      originWhitelist={["*"]}
      source={require("../assets/map.html")}
      style={{ flex: 1 }}
      injectedJavaScript={`
        const routeData = ${JSON.stringify(routeData)};
        initializeMap(routeData);
      `}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState={true}
    />
  );
};

const styles = StyleSheet.create({
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
  },
});

export default MapScreen;
