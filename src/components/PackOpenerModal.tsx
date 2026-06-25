import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  ActivityIndicator,
  FlatList,
  Vibration,
} from "react-native";
import { supabase } from "../lib/supabase";
import { generateCardParts, CardParts, Rarity } from "../utils/generateCard";
import { getLocalImage, mapRarityToDb } from "../utils/imageMapper";
import SkiaCard from "./Skiacard";
import { useImage } from "@shopify/react-native-skia";
import { styles } from "./styles/PackOpenerModal.styles";

interface GeneratedCard {
  parts: CardParts;
  name: string;
  text: string;
  rarity: Rarity;
}

interface PackOpenerModalProps {
  isVisible: boolean;
  onClose: () => void;
  perfilId: number;
}

// Subcomponente para cargar las imágenes con useImage correctamente
function PackSkiaCard({ card }: { card: GeneratedCard }) {
  const fondo = useImage(getLocalImage(card.parts.background.key));
  const centro = useImage(getLocalImage(card.parts.center.key));
  const normalMap = useImage(getLocalImage(card.parts.normal.key));

  return (
    <SkiaCard
      background={fondo}
      center={centro}
      normal={normalMap}
      texto={card.text}
      rarity={card.rarity}
    />
  );
}

export default function PackOpenerModal({
  isVisible,
  onClose,
  perfilId,
}: PackOpenerModalProps) {
  const [step, setStep] = useState<"idle" | "flashing" | "revealing" | "summary">("idle");
  const [cards, setCards] = useState<GeneratedCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // animación para el destello blanco
  const [flashAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (isVisible) {
      setStep("idle");
      setCards([]);
      setCurrentCardIndex(0);
      flashAnim.setValue(0);
    }
  }, [isVisible]);

  const handleOpenPack = async () => {
    setStep("flashing");

    // Vibración exagerada
    Vibration.vibrate([0, 100, 100, 100, 100, 300, 100, 300]);

    // destello
    Animated.timing(flashAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(async () => {
      // generar y guardar cartas mientras la pantalla está blanca
      setIsGenerating(true);
      const generatedCards = await generateAndSaveCards();
      setCards(generatedCards);
      setIsGenerating(false);

      // Pasar a revelado y desvanecer destello
      setStep("revealing");
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
  };

  const generateAndSaveCards = async (): Promise<GeneratedCard[]> => {
    const newCards: GeneratedCard[] = [];
    const inserts = [];

    for (let i = 0; i < 5; i++) {
      const parts = generateCardParts();
      // NOTA: Textos y nombres aleatorios temporales. 
      // Se debe cambiar esto en el futuro.
      const name = "Carta Misteriosa " + Math.floor(Math.random() * 1000);
      const text = "Una carta generada aleatoriamente del sobre de recompensa. ¡Colecciónalas todas!";
      
      const cardObj: GeneratedCard = {
        parts,
        name,
        text,
        rarity: parts.background.rarity,
      };
      
      newCards.push(cardObj);

      // Preparar insert para base de datos
      inserts.push({
        nombre_carta: name,
        categoria: mapRarityToDb(cardObj.rarity),
        borde: parts.background.key,
        imagen: parts.center.key, 
        centro: parts.center.key,
        normal_map: parts.normal.key,
        texto: text,
        propietario: perfilId,
      });
    }

    try {
      const { error } = await supabase.from("carta").insert(inserts);
      if (error) {
        console.error("Error guardando cartas:", error);
      }
    } catch (e) {
      console.error("Excepción al guardar:", e);
    }

    return newCards;
  };

  const handleNextCard = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex((prev) => prev + 1);
    } else {
      setStep("summary");
    }
  };

  const renderIdle = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>¡Has recibido un Sobre!</Text>
      <Text style={styles.subtitle}>Toca para abrirlo</Text>
      <TouchableOpacity onPress={handleOpenPack} activeOpacity={0.8}>
        <Image
          source={getLocalImage("sobre/sobre.png")}
          style={styles.packImage}
          resizeMode="contain"
        />
      </TouchableOpacity>
    </View>
  );

  const renderFlashing = () => (
    <View style={styles.centerContainer}>
      {isGenerating && <ActivityIndicator size="large" color="#000" style={{ zIndex: 100 }} />}
      <Animated.View
        style={[
          styles.flashOverlay,
          { opacity: flashAnim },
        ]}
      />
    </View>
  );

  const renderRevealing = () => {
    if (!cards.length) return null;
    const currentCard = cards[currentCardIndex];
    
    return (
      <View style={styles.centerContainer}>
        <View style={styles.cardCounterContainer}>
           <Text style={styles.cardCounterText}>Carta {currentCardIndex + 1} de 5</Text>
        </View>
        
        {/* Aquí usamos el subcomponente que usa useImage */}
        <View style={styles.skiaWrapper}>
          <PackSkiaCard card={currentCard} />
        </View>

        <TouchableOpacity style={styles.nextButton} onPress={handleNextCard}>
          <Text style={styles.nextButtonText}>
            {currentCardIndex < 4 ? "Siguiente" : "Ver Resumen"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.title}>Resumen del Sobre</Text>
      <FlatList
        data={cards}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemTitle}>{item.name}</Text>
            <Text style={styles.summaryItemRarity}>{mapRarityToDb(item.rarity)}</Text>
          </View>
        )}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Cerrar y Volver</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        {step === "idle" && renderIdle()}
        {step === "flashing" && renderFlashing()}
        {step === "revealing" && renderRevealing()}
        {step === "summary" && renderSummary()}
        
        {/* Siempre renderizamos el overlay blanco encima de todo para el efecto de transición */}
        {step === "revealing" && (
            <Animated.View
              style={[
                styles.flashOverlay,
                { opacity: flashAnim },
              ]}
              pointerEvents="none"
            />
        )}
      </View>
    </Modal>
  );
}
