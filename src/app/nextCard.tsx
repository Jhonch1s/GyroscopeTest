import Skiacard from "@/components/Skiacard";
import { useImage } from "@shopify/react-native-skia";
import React from "react";
import {
  SafeAreaView,
  StyleSheet
} from "react-native";

export default function GyroscopeScreen() {
  const fondo = useImage(require("../../assets/images/pokmeon.png"));
  const centro = useImage(require("../../assets/images/bob.jpg"));
  const normalMap = useImage(require("../../assets/images/paper1.jpg"));
  const contenido = "Un desvío es el camino mas corto";

  return (
    <SafeAreaView style={styles.safe}>
      <Skiacard 
      background={fondo} 
      center={centro} 
      normal={normalMap}
      texto={contenido}
      >
      </Skiacard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#111",
  },
});
