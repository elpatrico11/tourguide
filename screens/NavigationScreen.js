import React, { useEffect, useState } from "react";
import { View, Text, Alert } from "react-native";
import MapView, { Polyline, Marker } from "react-native-maps";
import * as Location from "expo-location";
import { useFocusEffect } from "@react-navigation/native";

const NavigationScreen = ({ route }) => {
  const { routeDetails } = route.params;
  const [currentLocation, setCurrentLocation] = useState(null);

  const waypoints = routeDetails.waypoints.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
  }));

  useFocusEffect(
    React.useCallback(() => {
      let subscription;

      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Brak uprawnień do dostępu do lokalizacji");
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);

        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (location) => {
            setCurrentLocation(location.coords);
            checkProximity(location.coords);
          }
        );
      })();

      return () => {
        if (subscription) {
          subscription.remove();
        }
      };
    }, [])
  );

  const checkProximity = (coords) => {
    waypoints.forEach((point, index) => {
      const distance = getDistance(
        coords.latitude,
        coords.longitude,
        point.latitude,
        point.longitude
      );
      if (distance < 50) {
        // 50 metrów
        Alert.alert(
          `Dotarłeś do: ${routeDetails.waypoints[index].name}`,
          routeDetails.waypoints[index].description
        );
      }
    });
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // promień Ziemi w metrach
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  return (
    <View style={{ flex: 1 }}>
      {currentLocation ? (
        <MapView
          style={{ flex: 1 }}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Polyline
            coordinates={waypoints}
            strokeColor="#000"
            strokeWidth={3}
          />
          {waypoints.map((point, index) => (
            <Marker
              key={index}
              coordinate={point}
              title={routeDetails.waypoints[index].name}
              description={routeDetails.waypoints[index].description}
            />
          ))}
        </MapView>
      ) : (
        <Text>Ładowanie mapy...</Text>
      )}
    </View>
  );
};

export default NavigationScreen;
