import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import axios from "axios";

const RouteDetails = ({ route, navigation }) => {
  const { routeId } = route.params;
  const [routeDetails, setRouteDetails] = useState(null);

  useEffect(() => {
    axios
      .get(`http://192.168.18.11:3000/routes/${routeId}`)
      .then((response) => {
        setRouteDetails(response.data);
      })
      .catch((error) => {
        console.error("Error fetching route details:", error);
      });
  }, [routeId]);

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
