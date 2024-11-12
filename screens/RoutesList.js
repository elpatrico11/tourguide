import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import axios from "axios";

const RoutesList = ({ navigation }) => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    // Pobieranie listy tras z serwera
    axios
      .get("http://192.168.18.11:3000/routes") // Upewnij się, że adres serwera jest poprawny
      .then((response) => {
        setRoutes(response.data);
      })
      .catch((error) => {
        console.error("Error fetching routes:", error);
      });
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.routeButton}
      onPress={() => navigation.navigate("RouteDetails", { routeId: item.id })}
    >
      <Text style={styles.routeText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  routeButton: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#87CEEB",
    borderRadius: 5,
  },
  routeText: { fontSize: 18, color: "#FFF" },
});

export default RoutesList;
