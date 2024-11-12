import React from "react";
import { WebView } from "react-native-webview";

const MapScreen = ({ route }) => {
  const { start, end, waypoints } = route.params;
  const encodedData = encodeURIComponent(
    JSON.stringify({ start, end, waypoints })
  );

  return (
    <WebView
      originWhitelist={["*"]}
      source={require("../assets/map.html")} // Use require to load the local HTML file
      style={{ flex: 1 }}
      injectedJavaScript={`const routeData = ${decodeURIComponent(
        encodedData
      )}; initializeMap(routeData);`}
      javaScriptEnabled={true}
    />
  );
};

export default MapScreen;
