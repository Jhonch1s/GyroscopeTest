import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View, FlatList } from 'react-native';
import { supabase } from '../lib/supabase';
import { Carta, Perfil } from '../types';
import { getLocalImage } from '../utils/imageMapper';
import { styles } from './styles/CatalogScreen.styles';

interface Props {
  userId: number;
  onCardSelect?: (cardId: number) => void;
}

export default function CatalogScreen({ userId, onCardSelect }: Props) {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [unlockedIds, setUnlockedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCatalog();

    const subscription = supabase
      .channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'carta' },
        (payload) => {
          //cuando se inserta una carta, recargamos el catálogo
          fetchCatalog();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  const fetchCatalog = async () => {
    try {
      const { data: cardsData, error: cardsError } = await supabase
        .from('carta')
        .select('*')
        .eq('propietario', userId);
      if (cardsError) throw cardsError;
      
      setCartas(cardsData || []);
      // Todas las cartas del catálogo del usuario están desbloqueadas
      setUnlockedIds((cardsData || []).map(c => c.id));
    } catch (error) {
      console.error("Error cargando el catálogo:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    // agragamos variaciones por si en la base de datos está en minúscula o cambia
    switch (rarity?.toLowerCase()) {
      case 'común': case 'comun': return '#a0a0a0'; 
      case 'raro': return '#3498db'; 
      case 'épico': case 'epico': return '#9b59b6'; 
      case 'legendario': return '#f1c40f'; 
      default: return '#555'; 
    }
  };

  if (loading) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const renderItem = ({ item: card }: { item: Carta }) => {
    const isUnlocked = unlockedIds.includes(card.id);
    
    // si card.centro viene vacío o no existe, usamos 'common/img_01.jpg' como respaldo
    const imageSource = getLocalImage(card.centro || 'common/img_01.jpg');

    return (
      <TouchableOpacity 
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
  };

  return (
    <View style={styles.safe}>
      <FlatList
        data={cartas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Tu Colección</Text>
            <Text style={styles.subtitle}>
              Tienes {cartas.length} cartas
            </Text>
          </View>
        }
      />
    </View>
  );
}