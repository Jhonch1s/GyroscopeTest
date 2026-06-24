import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0f0f13',
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
});