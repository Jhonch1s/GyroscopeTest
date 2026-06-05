import Skiacard from "@/components/Skiacard";
import { useImage } from "@shopify/react-native-skia";
import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { mockCards } from "../data/mockData";
import { styles } from "./styles/CardViewerScreen.styles";

interface Props {
  cardId?: string;
}

export default function CardViewerScreen({ cardId }: Props) {
  // Encuentra la carta seleccionada o usa la primera por defecto
  const card = cardId ? mockCards.find(c => c.id === cardId) : mockCards[0];

  // Cargar el fondo y textura según la rareza de la carta
  let fondoSource;
  let normalMapSource;

  switch (card?.rarity) {
    case "Raro":
      fondoSource = require("../../assets/rare/backgrounds/fondo2.png");
      normalMapSource = require("../../assets/rare/textures/rare1.png");
      break;
    case "Épico":
      fondoSource = require("../../assets/epic/backgrounds/fondo3.png");
      normalMapSource = require("../../assets/rare/textures/rare1.png"); // fallback a textura rara
      break;
    case "Legendario":
      fondoSource = require("../../assets/legendary/backgrounds/fondo4.png");
      normalMapSource = require("../../assets/rare/textures/rare1.png"); // fallback a textura rara
      break;
    case "Común":
    default:
      fondoSource = require("../../assets/common/backgrounds/fondo1.png");
      normalMapSource = require("../../assets/common/textures/paper1.jpg");
      break;
  }

  const fondo = useImage(fondoSource);
  const centro = useImage(card?.image as any);
  const normalMap = useImage(normalMapSource);
  const contenido = card?.description || "Un desvío es el camino mas corto";

  if (!card) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Carta no encontrada</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Skiacard
        background={fondo}
        center={centro}
        normal={normalMap}
        texto={contenido}
      />
    </SafeAreaView>
  );
}


