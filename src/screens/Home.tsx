import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#3498db',
  },
  greeting: {
    color: '#888',
    fontSize: 16,
  },
  username: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statsBadge: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statsText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    flex: 1,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: '#888',
    fontSize: 14,
    marginBottom: 24,
  },
  activitiesList: {
    gap: 16,
  },
  activityCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  activityCompleted: {
    opacity: 0.6,
  },
  activityContent: {
    flex: 1,
    paddingRight: 16,
  },
  activityTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  difficultyBadge: {
    color: '#aaa',
    fontSize: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  rewardBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  claimButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  claimButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  completedBadge: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(46, 204, 113, 0.2)',
  },
  completedText: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
