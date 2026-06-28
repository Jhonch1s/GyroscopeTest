import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(8, 8, 16, 0.95)", // Fondo oscuro semi-transparente
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 40,
    textAlign: "center",
  },
  packImage: {
    width: 250,
    height: 350,
    // Sombra para que resalte
    shadowColor: "#fff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#fff",
    zIndex: 10,
  },
  skiaWrapper: {
    width: 350,
    height: 500,
    justifyContent: "center",
    alignItems: "center",
  },
  cardCounterContainer: {
    position: 'absolute',
    top: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cardCounterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  nextButton: {
    marginTop: 20,
    backgroundColor: "#3498db",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryContainer: {
    flex: 1,
    width: "100%",
    paddingTop: 80,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  listContent: {
    width: "100%",
    paddingBottom: 40,
    marginTop: 20,
  },
  summaryItem: {
    backgroundColor: "rgba(255,255,255,0.1)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  summaryItemTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  summaryItemText: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 2,
  },
  summaryItemRarity: {
    color: "#3498db",
    fontSize: 14,
    marginLeft: 10,
  },
  closeButton: {
    marginBottom: 40,
    backgroundColor: "#2ecc71",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
