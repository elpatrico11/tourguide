// screens/RouteDetails.js

import React, { useEffect, useState } from "react";
import * as Speech from "expo-speech";
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
  const [error, setError] = useState(null); // Stan błędu
  const [arrivedWaypoints, setArrivedWaypoints] = useState([]); // Śledzenie odwiedzonych punktów
  const [isSpeaking, setIsSpeaking] = useState(false);

  // URL Twojego serwera backendowego
  const SERVER_URL = "http://192.168.18.11:3000"; // Zmień na odpowiedni adres IP lub domenę

  useEffect(() => {
    // Inicjalizacja Speech
    // expo-speech nie ma metod setDefaultLanguage, setDefaultRate, setDefaultPitch
    // Zamiast tego, przekazuj te opcje bezpośrednio w Speech.speak

    return () => {
      // Zatrzymaj odtwarzanie Speech przy odmontowaniu komponentu
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    const loadRoute = async () => {
      try {
        const storedRoute = await AsyncStorage.getItem(`route_${routeId}`);
        const networkState = await NetInfo.fetch();

        if (networkState.isConnected) {
          fetchRouteFromServer();
        } else if (storedRoute) {
          setRouteDetails(JSON.parse(storedRoute));
          initializeArrivedWaypoints(JSON.parse(storedRoute));
        } else {
          setError(
            "Brak połączenia internetowego i danych trasy w pamięci podręcznej."
          );
        }
      } catch (err) {
        console.error("Error loading route:", err);
        setError("Wystąpił nieoczekiwany błąd.");
      }
    };

    loadRoute();
  }, [routeId]);

  const fetchRouteFromServer = () => {
    axios
      .get(`${SERVER_URL}/routes/${routeId}`)
      .then((response) => {
        setRouteDetails(response.data);
        saveRouteToLocal(response.data); // Zapisz dane lokalnie dla dostępu offline
        initializeArrivedWaypoints(response.data);
      })
      .catch((error) => {
        console.error("Error fetching route details:", error);
        setError("Nie udało się pobrać szczegółów trasy.");
      });
  };

  const initializeArrivedWaypoints = (data) => {
    setArrivedWaypoints(new Array(data.waypoints.length).fill(false));
  };

  const saveRouteToLocal = async (data) => {
    try {
      await AsyncStorage.setItem(`route_${routeId}`, JSON.stringify(data));
      console.log("Trasa zapisana lokalnie");
    } catch (error) {
      console.error("Nie udało się zapisać trasy: ", error);
    }
  };

  // Funkcja do otwierania Google Maps dla nawigacji
  const openInGoogleMaps = (latitude, longitude) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
    Linking.openURL(url).catch((err) =>
      console.error("Nie udało się otworzyć Google Maps:", err)
    );
  };

  // Funkcja do symulacji przyjazdu do następnego punktu
  const simulateArrival = () => {
    if (!routeDetails || !routeDetails.waypoints) return;

    // Znajdź indeks pierwszego nieodwiedzonego punktu
    const nextIndex = arrivedWaypoints.findIndex((arrived) => !arrived);

    if (nextIndex === -1) {
      Alert.alert("You arrived to all places on this route.");
      return;
    }

    // Pobierz szczegóły punktu
    const waypoint = routeDetails.waypoints[nextIndex];

    // Zaktualizuj stan punktów jako odwiedzonych
    const updatedArrivedWaypoints = [...arrivedWaypoints];
    updatedArrivedWaypoints[nextIndex] = true;
    setArrivedWaypoints(updatedArrivedWaypoints);

    // Odtwórz opis punktu za pomocą Speech
    setIsSpeaking(true);
    Speech.stop(); // Zatrzymaj ewentualne trwające odtwarzanie
    Speech.speak(waypoint.description, {
      language: "en-US", // Ustaw język na polski
      rate: 1, // Ustaw prędkość mówienia
      pitch: 1.0, // Ustaw ton mowy
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });

    // Opcjonalnie: Wyświetl alert z opisem
    Alert.alert(
      `You arrived to ${waypoint.name}`,
      waypoint.description,
      [{ text: "OK" }],
      { cancelable: false }
    );
  };

  // Funkcja do zatrzymywania Speech
  const stopSpeech = () => {
    Speech.stop();
    setIsSpeaking(false);
  };

  if (!routeDetails && !error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading details of a route...</Text>
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
          title="View Route on Map"
          onPress={() =>
            navigation.navigate("MapScreen", {
              start: routeDetails.start,
              end: routeDetails.end,
              waypoints: routeDetails.waypoints,
              arrivedWaypoints: arrivedWaypoints, // Przekaż arrivedWaypoints do MapScreen
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
              {/* Opcjonalnie: Wskaźnik, czy punkt został odwiedzony */}
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
          <Button title="Simulate Arriving" onPress={simulateArrival} />
        </View>
        {/* Przycisk do zatrzymywania Speech */}
        {isSpeaking && (
          <View style={styles.controlButtonContainer}>
            <Button title="Stop Audio" onPress={stopSpeech} />
          </View>
        )}
        {/* Wskaźnik odtwarzania */}
        {isSpeaking && (
          <Text style={styles.speakingIndicator}>Audio playing...</Text>
        )}
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
  controlButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  speakingIndicator: {
    color: "green",
    fontStyle: "italic",
    marginTop: 10,
    marginBottom: 10,
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
