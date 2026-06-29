import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View, FlatList, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { Carta } from '../types';
import { getLocalImage } from '../utils/imageMapper';
import { styles } from './styles/CatalogScreen.styles';

interface Props {
  userId: number;
  onCardSelect?: (cardId: number) => void;
}

const FILTERS = [
  { key: 'all', label: 'Todos', color: '#3498db' },
  { key: 'Comun', label: 'Común', color: '#a0a0a0' },
  { key: 'Raro', label: 'Raro', color: '#3498db' },
  { key: 'Epico', label: 'Épico', color: '#9b59b6' },
  { key: 'Legendario', label: 'Legendario', color: '#f1c40f' },
] as const;

function getRarityColor(rarity: string): string {
  switch (rarity?.toLowerCase()) {
    case 'común': case 'comun': return '#a0a0a0';
    case 'raro': return '#3498db';
    case 'épico': case 'epico': return '#9b59b6';
    case 'legendario': return '#f1c40f';
    default: return '#555';
  }
}

export default function CatalogScreen({ userId, onCardSelect }: Props) {
  const [cartas, setCartas] = useState<Carta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  useFocusEffect(
    useCallback(() => {
      fetchCatalog();
    }, [userId])
  );

  useEffect(() => {

    const subscription = supabase
      .channel('custom-insert-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'carta' },
        () => {
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
    } catch (error) {
      console.error("Error cargando el catálogo:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCatalog();
  }, [userId]);

  const rarityCounts = cartas.reduce<Record<string, number>>((acc, c) => {
    const key = c.categoria || 'Comun';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filteredCartas = selectedFilter === 'all'
    ? cartas
    : cartas.filter((c) => c.categoria === selectedFilter);

  if (loading) {
    return (
      <View style={[styles.safe, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Tu Colección</Text>
      <Text style={styles.subtitle}>
        Tienes {cartas.length} carta{cartas.length !== 1 ? 's' : ''}
      </Text>

      {cartas.length > 0 && (
        <>
          <View style={styles.statsRow}>
            {FILTERS.filter((f) => f.key !== 'all').map((f) => (
              <View key={f.key} style={styles.statItem}>
                <View style={[styles.statDot, { backgroundColor: f.color }]} />
                <Text style={styles.statCount}>{rarityCounts[f.key] || 0}</Text>
                <Text style={styles.statLabel}>{f.label}</Text>
              </View>
            ))}
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersRow}
          >
            {FILTERS.map((f) => {
              const isActive = selectedFilter === f.key;
              return (
                <TouchableOpacity
                  key={f.key}
                  style={[
                    styles.filterPill,
                    isActive && { backgroundColor: f.color },
                  ]}
                  onPress={() => setSelectedFilter(f.key)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.filterPillText,
                      isActive && styles.filterPillTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </>
      )}
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>{"📦"}</Text>
      <Text style={styles.emptyTitle}>Tu colección está vacía</Text>
      <Text style={styles.emptySubtitle}>
        Completa misiones en Inicio para obtener sobres de cartas
      </Text>
    </View>
  );

  const renderFilteredEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Sin cartas de esta rareza</Text>
      <Text style={styles.emptySubtitle}>
        Prueba con otro filtro o abre más sobres
      </Text>
    </View>
  );

  const renderItem = ({ item: card }: { item: Carta }) => {
    const imageSource = getLocalImage(card.centro || 'common/img_01.jpg');

    return (
      <TouchableOpacity
        style={styles.cardContainer}
        activeOpacity={0.7}
        onPress={() => onCardSelect && onCardSelect(card.id)}
      >
        <View style={[styles.imageContainer, { borderColor: getRarityColor(card.categoria) }]}>
          <Image
            source={imageSource}
            style={styles.cardImage}
            resizeMode="cover"
          />

          {card.categoria && (
            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(card.categoria) }]}>
              <Text style={styles.rarityText}>{card.categoria}</Text>
            </View>
          )}
        </View>

        <Text style={styles.cardName} numberOfLines={1}>
          {card.nombre_carta || 'Carta sin nombre'}
        </Text>
      </TouchableOpacity>
    );
  };

  if (cartas.length === 0) {
    return (
      <ScrollView 
        style={styles.safe}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        {renderHeader()}
        {renderEmpty()}
      </ScrollView>
    );
  }

  return (
    <View style={styles.safe}>
      <FlatList
        data={filteredCartas}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.contentContainer}
        columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderFilteredEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      />
    </View>
  );
}
