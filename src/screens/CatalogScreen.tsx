import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { mockCards, mockUser } from '../data/mockData';
import { styles } from './styles/CatalogScreen.styles';

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


