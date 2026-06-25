import { Dimensions, StyleSheet } from 'react-native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48 - 16) / 2;

export const styles = StyleSheet.create({
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
    marginBottom: 24,
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
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    paddingVertical: 14,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statCount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#888',
    fontSize: 11,
  },
  filtersRow: {
    gap: 8,
    paddingBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  filterPillText: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#fff',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: 8,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.7,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
