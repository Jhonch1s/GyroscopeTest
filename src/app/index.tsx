import * as React from 'react';
import { View, useWindowDimensions, StyleSheet, Text, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabView, TabBar } from 'react-native-tab-view';

import Home from '../screens/Home';
import CatalogScreen from '../screens/CatalogScreen';
import CardViewerScreen from '../screens/CardViewerScreen';

export default function App() {
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [selectedCardId, setSelectedCardId] = React.useState<number | undefined>();
  const insets = useSafeAreaInsets();

  const routes = [
    { key: 'home', title: 'Inicio' },
    { key: 'catalog', title: 'Catálogo' },
    { key: 'viewer', title: 'Visor 3D' },
  ];

  const handleCardSelect = (cardId: number) => {
    setSelectedCardId(cardId);
    setIndex(2); // Cambiar a la pestaña de Visor 3D
  };

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case 'home':
        return <Home />;
      case 'catalog':
        return <CatalogScreen onCardSelect={handleCardSelect} />;
      case 'viewer':
        return <CardViewerScreen cardId={selectedCardId} />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: '#3498db' }}
      style={{ backgroundColor: '#1a1a20' }}
      renderLabel={({ route, focused }: { route: any; focused: boolean }) => (
        <Text style={{ color: focused ? '#3498db' : '#888', margin: 8, fontWeight: 'bold' }}>
          {route.title}
        </Text>
      )}
    />
  );

  const renderLazyPlaceholder = () => (
    <View style={styles.loadingPlaceholder}>
      <ActivityIndicator size="large" color="#3498db" />
    </View>
  );

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom, paddingTop: insets.top }]}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        tabBarPosition='bottom'
        lazy 
        renderLazyPlaceholder={renderLazyPlaceholder}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f13',
  },
  loadingPlaceholder: {
    flex: 1,
    backgroundColor: '#0f0f13',
    justifyContent: 'center',
    alignItems: 'center',
  },
});