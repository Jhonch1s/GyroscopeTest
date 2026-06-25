import Skiacard from "@/components/Skiacard";
import { useImage } from "@shopify/react-native-skia";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, SafeAreaView, Text, View } from "react-native";
import { supabase } from "../lib/supabase";
import { Carta } from "../types";
import { getLocalImage } from "../utils/imageMapper";
import { styles } from "./styles/CardViewerScreen.styles";

interface Props {
  cardId?: number;
}

export default function CardViewerScreen({ cardId }: Props) {
  const [card, setCard] = useState<Carta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCard() {
      try {
        if (cardId) {
          const { data } = await supabase.from('carta').select('*').eq('id', cardId).single();
          if (data) setCard(data);
        } else {
          // Fallback a una carta cualquiera si no hay ID
          const { data } = await supabase.from('carta').select('*').limit(1).single();
          if (data) setCard(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadCard();
  }, [cardId]);

  const fondo = useImage(getLocalImage(card?.imagen || 'fondo2.png'));
  const centro = useImage(getLocalImage(card?.centro || '7_1x1.jpg'));
  const normalMap = useImage(getLocalImage(card?.normal_map || 'buffkirk.jpeg'));
  const contenido = card?.texto || "Un desvío es el camino mas corto";

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498db" />
      </SafeAreaView>
    );
  }

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


