import Skiacard from "@/components/Skiacard";
import { useImage } from "@shopify/react-native-skia";
import React from "react";
import { SafeAreaView, Text, View } from "react-native";
import { styles } from "./styles/CardViewerScreen.styles";
import { mockCards } from "../data/mockData";

interface Props {
  cardId?: string;
}

export default function CardViewerScreen({ cardId }: Props) {
  // Encuentra la carta seleccionada o usa la primera por defecto
  const card = cardId ? mockCards.find(c => c.id === cardId) : mockCards[0];

  // En una app real, cada carta tendría su propia imagen de fondo/centro.
  // Aquí usamos la de la carta, y fallback para el normalMap.
  const fondo = useImage(card?.image as any);
  const centro = useImage(card?.image as any);
  const normalMap = useImage(require("../../assets/images/paper1.jpg"));
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


