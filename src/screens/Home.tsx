import React, { useState } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { styles } from './styles/Home.styles';
import { initialActivities, mockUser } from '../data/mockData';
import { Activity } from '../types';

export default function HomeScreen() {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);

  const completeActivity = (id: string) => {
    setActivities((prev) =>
      prev.map((act) =>
        act.id === id ? { ...act, completed: true } : act
      )
    );
    alert('¡Actividad Completada! Has recibido un sobre: ' + activities.find(a => a.id === id)?.rewardRarity);
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

  return (
    <ScrollView style={styles.safe} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image source={mockUser.avatar as any} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.username}>{mockUser.username}</Text>
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
          {activities.map((activity) => (
            <View key={activity.id} style={[styles.activityCard, activity.completed && styles.activityCompleted]}>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <View style={styles.badgesRow}>
                  <Text style={styles.difficultyBadge}>{activity.difficulty}</Text>
                  <Text style={[styles.rewardBadge, { color: getRarityColor(activity.rewardRarity) }]}>
                    Sobre {activity.rewardRarity}
                  </Text>
                </View>
              </View>

              {!activity.completed ? (
                <TouchableOpacity
                  style={[styles.claimButton, { backgroundColor: getRarityColor(activity.rewardRarity) }]}
                  onPress={() => completeActivity(activity.id)}
                >
                  <Text style={styles.claimButtonText}>Completar</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>✓ Hecho</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}


