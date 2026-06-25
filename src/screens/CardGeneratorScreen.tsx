import { useImage } from '@shopify/react-native-skia';
import React, { useState } from 'react';
import { ActivityIndicator, Button, SafeAreaView, View } from 'react-native';
import { generateCardParts, CardParts } from '../utils/generateCard';
import { getLocalImage } from '../utils/imageMapper';
import Skiacard from '@/components/Skiacard';
import { styles } from './styles/CardGeneratorScreen.styles';

export default function CardGeneratorScreen() {
  const [parts, setParts] = useState<CardParts | null>(null);

  const handleGenerate = () => {
    const newParts = generateCardParts();
    setParts(newParts);
  };

  const backgroundImg = useImage(parts ? getLocalImage(parts.background.key) : null);
  const centerImg = useImage(parts ? getLocalImage(parts.center.key) : null);
  const normalImg = useImage(parts ? getLocalImage(parts.normal.key) : null);

  const isLoading = parts && (!backgroundImg || !centerImg || !normalImg);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Button title="Generar carta" onPress={handleGenerate} />

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3498db" />
          </View>
        )}

        {parts && backgroundImg && centerImg && normalImg && (
          <View style={styles.cardContainer}>
            <Skiacard
              background={backgroundImg}
              center={centerImg}
              normal={normalImg}
              texto="Carta generada"
              rarity={parts.background.rarity}
            />
          </View>
        )}

        {parts && !isLoading && (
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <View style={[styles.badge, { backgroundColor: getRarityColor(parts.background.rarity) }]}>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#a0a0a0';
    case 'rare': return '#3498db';
    case 'epic': return '#9b59b6';
    case 'legendary': return '#f1c40f';
    default: return '#555';
  }
}