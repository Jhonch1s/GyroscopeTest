import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { Carta, Perfil } from '../types';
import { getLocalImage } from '../utils/imageMapper';
import { styles } from './styles/CatalogScreen.styles';

interface Props {
  onCardSelect?: (cardId: number) => void;
}

export default function CatalogScreen({ onCardSelect }: Props) {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    try {
      const { data: cardsData, error: cardsError } = await supabase.from('carta').select('*');
      if (cardsError) throw cardsError;
      setCartas(cardsData || []);

      // Forzar desbloqueo total (Independiente del perfil)
      setUnlockedIds((cardsData || []).map(c => c.id));
    } catch (error) {
      console.error("Error cargando el catálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    // Agregamos variaciones por si en la Base de Datos está en minúscula o cambia
    switch (rarity?.toLowerCase()) {
      case 'común': case 'comun': return '#a0a0a0'; 
      case 'raro': return '#3498db'; 
      case 'épico': case 'epico': return '#9b59b6'; 
      case 'legendario': return '#f1c40f'; 
      default: return '#555'; // Color de respaldo
    }
  };

  if (loading) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Tu Colección</Text>
        <Text style={styles.subtitle}>
          {unlockedIds.length} / {cartas.length} desbloqueadas
        </Text>
      </View>

      <View style={styles.grid}>
        {cartas.map((card) => {
          const isUnlocked = unlockedIds.includes(card.id);
          
          // 🛠️ Si card.centro viene vacío o no existe, usamos 'common/img_01.jpg' como respaldo
          const imageSource = getLocalImage(card.centro || 'common/img_01.jpg');

          return (
            <TouchableOpacity 
              key={card.id} 
              style={[styles.cardContainer, !isUnlocked && styles.cardLocked]}
              activeOpacity={0.7}
              disabled={!isUnlocked}
              onPress={() => onCardSelect && onCardSelect(card.id)}
            >
              <View style={[styles.imageContainer, { borderColor: isUnlocked ? getRarityColor(card.categoria) : '#333' }]}>
                {isUnlocked ? (
                  <Image 
                    source={imageSource} 
                    style={styles.cardImage} 
                    resizeMode="cover" 
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Text style={styles.questionMark}>?</Text>
                  </View>
                )}
                
                {isUnlocked && card.categoria && (
                  <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(card.categoria) }]}>
                    <Text style={styles.rarityText}>{card.categoria}</Text>
                  </View>
                )}
              </View>
              
              <Text style={[styles.cardName, !isUnlocked && styles.cardNameLocked]} numberOfLines={1}>
                {isUnlocked ? (card.nombre_carta || 'Carta sin nombre') : 'Desconocido'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}