import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { styles } from './styles/Home.styles';
import { Mision, Perfil } from '../types';
import { supabase } from '../lib/supabase';
import { getLocalImage } from '../utils/imageMapper';

export default function HomeScreen() {
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Fetch random missions
      const { data: missionsData, error: missionsError } = await supabase.rpc('get_daily_missions', { limit_count: 3 });
      if (missionsError) throw missionsError;
      
      // 2. Fetch dummy user profile (assuming we seeded one)
      const { data: profileData, error: profileError } = await supabase
        .from('perfil')
        .select('*')
        .limit(1)
        .single();
        
      if (profileError) {
        console.warn("Perfil no encontrado, ¿ejecutaste el seed?");
      } else {
        setPerfil(profileData);
      }

      setMisiones(missionsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeActivity = async (id: number) => {
    // Optimistic UI update
    setMisiones((prev) => prev.filter((m) => m.id !== id));
    
    // Si tuvieras autenticación:
    // await supabase.from('progreso_usuario').insert({ perfil_id: perfil?.id, mision_id: id, completado: true });
    
    alert('¡Misión Completada!');
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Común': return '#a0a0a0'; 
      case 'Raro': return '#3498db'; 
      case 'Épico': return '#9b59b6'; 
      case 'Legendario': return '#f1c40f'; 
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

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image source={getLocalImage('buffkirk.jpeg')} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.username}>{perfil?.nombre || 'Usuario'}</Text>
          </View>
        </View>
        <View style={styles.statsBadge}>
          <Text style={styles.statsText}>🔥 Nivel 5</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividades de Hoy</Text>
        <Text style={styles.sectionSubtitle}>Completa tareas para ganar sobres de cartas.</Text>

        <View style={styles.activitiesList}>
          {misiones.length === 0 ? (
            <Text style={{color: '#888'}}>No hay misiones disponibles.</Text>
          ) : misiones.map((mision) => (
            <View key={mision.id} style={styles.activityCard}>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{mision.nombre}</Text>
                <View style={styles.badgesRow}>
                  <Text style={styles.difficultyBadge}>{mision.tipo}</Text>
                  <Text style={[styles.rewardBadge, { color: getRarityColor(mision.recompensa) }]}>
                    Sobre {mision.recompensa}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.claimButton, { backgroundColor: getRarityColor(mision.recompensa) }]}
                onPress={() => completeActivity(mision.id)}
              >
                <Text style={styles.claimButtonText}>Completar</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}


