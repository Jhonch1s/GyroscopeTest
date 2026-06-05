import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { mockCards, mockUser } from '../data/mockData';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2; // Padding horizontal: 24*2 = 48, Gap = 16

interface Props {
  onCardSelect?: (cardId: string) => void;
}

export default function CatalogScreen({ onCardSelect }: Props) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Común': return '#a0a0a0'; 
      case 'Raro': return '#3498db'; 
      case 'Épico': return '#9b59b6'; 
      case 'Legendario': return '#f1c40f'; 
      default: return '#555';
    }
  };

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Tu Colección</Text>
        <Text style={styles.subtitle}>
          {mockUser.unlockedCards.length} / {mockCards.length} desbloqueadas
        </Text>
      </View>

      <View style={styles.grid}>
        {mockCards.map((card) => {
          const isUnlocked = mockUser.unlockedCards.includes(card.id);

          return (
            <TouchableOpacity 
              key={card.id} 
              style={[styles.cardContainer, !isUnlocked && styles.cardLocked]}
              activeOpacity={0.7}
              disabled={!isUnlocked}
              onPress={() => onCardSelect && onCardSelect(card.id)}
            >
              <View style={[styles.imageContainer, { borderColor: isUnlocked ? getRarityColor(card.rarity) : '#333' }]}>
                {isUnlocked ? (
                  <Image source={card.image as any} style={styles.cardImage} resizeMode="cover" />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.questionMark}>?</Text>
                  </View>
                )}
                
                {isUnlocked && (
                  <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(card.rarity) }]}>
                    <Text style={styles.rarityText}>{card.rarity}</Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.cardName, !isUnlocked && styles.cardNameLocked]} numberOfLines={1}>
                {isUnlocked ? card.name : 'Desconocido'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f13',
  },
  contentContainer: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 8,
  },
  cardLocked: {
    opacity: 0.5,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.7, // Proporción de carta de colección (aprox 2.5/3.5)
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#1a1a20',
    marginBottom: 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMark: {
    color: '#333',
    fontSize: 48,
    fontWeight: 'bold',
  },
  rarityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rarityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cardNameLocked: {
    color: '#666',
  },
});
