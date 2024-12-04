import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground, // Import ImageBackground
} from "react-native";
import axios from "axios";

const RoutesList = ({ navigation }) => {
  const [routes, setRoutes] = useState([]);

  useEffect(() => {
    // Fetching list of routes from the server
    axios
      .get("http://192.168.18.11:3000/routes") // Ensure the server address is correct
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
    <ImageBackground
      source={require("../assets/background.png")} // Background image
      style={styles.background}
      resizeMode="cover" // Cover the entire screen
    >
      <View style={styles.container}>
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
        />
        {/* Add logo */}
        <Image
          source={require("../assets/logo.png")} // Ensure the path is correct
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1, // Ensures the background covers the entire screen
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  routeButton: {
    width: "100%", // Match the parent's width
    padding: 15,
    marginVertical: 10,
    backgroundColor: "#87CEEB",
    borderRadius: 5,
    alignItems: "center",
  },
  routeText: { fontSize: 18, color: "#FFF" },
  logo: {
    width: "100%", // Match the width of the buttons
    height: 200, // Adjust height based on your preference
    alignSelf: "center", // Center the logo horizontally
    marginTop: 20, // Add some space between the buttons and the logo
  },
});

export default RoutesList;
