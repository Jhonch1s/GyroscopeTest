import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
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
import { Audio } from "expo-av";

interface GeneratedCard {
  parts: CardParts;
  rarity: Rarity;
}

interface PackOpenerModalProps {
  isVisible: boolean;
  onClose: () => void;
  perfilId: number;
}

function PackSkiaCard({ card }: { card: GeneratedCard }) {
  const fondo = useImage(getLocalImage(card.parts.background.key));
  const centro = useImage(getLocalImage(card.parts.center.key));
  const normalMap = useImage(getLocalImage(card.parts.normal.key));

  return (
    <SkiaCard
      background={fondo}
      center={centro}
      normal={normalMap}
      texto={card.parts.text}
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

  const [flashAnim] = useState(new Animated.Value(0));
  const revealOpacity = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(0.85)).current;

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    if (isVisible) {
      setStep("idle");
      setCards([]);
      setCurrentCardIndex(0);
      flashAnim.setValue(0);
      revealOpacity.setValue(0);
      revealScale.setValue(0.85);
    } else {
      unloadSound();
    }
    return () => {
      unloadSound();
    };
  }, [isVisible]);

  const unloadSound = async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {}
      soundRef.current = null;
    }
  };

  const playSound = async (rarity?: Rarity) => {
    try {
      await unloadSound();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });

      let source: any;
      if (rarity === "epic" || rarity === "legendary") {
        source = require("../../assets/sounds/rare-reveal.wav");
      } else {
        source = require("../../assets/sounds/card-reveal.wav");
      }

      const { sound } = await Audio.Sound.createAsync(source, { volume: 0.7 });
      soundRef.current = sound;
      await sound.playAsync();
    } catch {
      // Archivo de sonido no encontrado — ignorar silenciosamente
    }
  };

  const playPackSound = async () => {
    try {
      await unloadSound();
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/pack-open.wav"),
        { volume: 0.8 }
      );
      soundRef.current = sound;
      await sound.playAsync();
    } catch {}
  };

  const animateReveal = () => {
    revealOpacity.setValue(0);
    revealScale.setValue(0.85);
    Animated.parallel([
      Animated.timing(revealOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(revealScale, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleOpenPack = async () => {
    setStep("flashing");
    Vibration.vibrate([0, 100, 100, 100, 100, 300, 100, 300]);
    playPackSound();

    Animated.timing(flashAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start(async () => {
      setIsGenerating(true);
      const generatedCards = await generateAndSaveCards();
      setCards(generatedCards);
      setIsGenerating(false);

      setStep("revealing");
      Animated.timing(flashAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        animateReveal();
        if (generatedCards.length > 0) {
          playSound(generatedCards[0].rarity);
        }
      });
    });
  };

  const generateAndSaveCards = async (): Promise<GeneratedCard[]> => {
    const newCards: GeneratedCard[] = [];
    const inserts = [];

    for (let i = 0; i < 5; i++) {
      const parts = generateCardParts();
      const cardObj: GeneratedCard = {
        parts,
        rarity: parts.rarity,
      };

      newCards.push(cardObj);

      inserts.push({
        nombre_carta: parts.name,
        categoria: mapRarityToDb(parts.rarity),
        borde: parts.background.key,
        imagen: parts.center.key,
        centro: parts.center.key,
        normal_map: parts.normal.key,
        texto: parts.text,
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
      const nextIndex = currentCardIndex + 1;
      setCurrentCardIndex(nextIndex);
      animateReveal();
      playSound(cards[nextIndex].rarity);
    } else {
      setStep("summary");
    }
  };

  const renderIdle = () => (
    <View style={styles.centerContainer}>
      <Text style={styles.title}>{"¡Has recibido un Sobre!"}</Text>
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

        <Animated.View
          style={[
            styles.skiaWrapper,
            {
              opacity: revealOpacity,
              transform: [{ scale: revealScale }],
            },
          ]}
        >
          <PackSkiaCard card={currentCard} />
        </Animated.View>

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
        renderItem={({ item }) => (
          <View style={styles.summaryItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryItemTitle}>{item.parts.name}</Text>
              <Text style={styles.summaryItemText} numberOfLines={1}>{item.parts.text}</Text>
            </View>
            <Text style={[styles.summaryItemRarity, { color: getRarityColor(item.rarity) }]}>
              {mapRarityToDb(item.rarity)}
            </Text>
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

function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case "common": return "#a0a0a0";
    case "rare": return "#3498db";
    case "epic": return "#9b59b6";
    case "legendary": return "#f1c40f";
    default: return "#555";
  }
}
