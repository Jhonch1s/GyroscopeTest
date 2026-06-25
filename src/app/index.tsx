import AuthScreen from "@/screens/AuthScreen";
import CardGeneratorScreen from "@/screens/CardGeneratorScreen";
import * as React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBar, TabView } from "react-native-tab-view";
import CardViewerScreen from "../screens/CardViewerScreen";
import CatalogScreen from "../screens/CatalogScreen";
import Home from "../screens/Home";
import { LogBox } from 'react-native';

export default function App() {

  LogBox.ignoreLogs(["Can't perform a React state update on a component that hasn't mounted yet"]);
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [selectedCardId, setSelectedCardId] = React.useState<
    number | undefined
  >();
  const insets = useSafeAreaInsets();
  const [userId, setUserId] = React.useState<number | null>(null);

  const routes = [
    { key: "home", title: "Inicio" },
    { key: "catalog", title: "Catálogo" },
    { key: "cardGenerator", title: "Generador" },
  ];

  const handleCardSelect = (cardId: number) => {
    setSelectedCardId(cardId);
  };

  const renderScene = ({ route }: any) => {
    switch (route.key) {
      case "home":
        return <Home userId={userId!} />;
      case "catalog":
        return <CatalogScreen userId={userId!} onCardSelect={handleCardSelect} />;
      case "cardGenerator":
        return <CardGeneratorScreen />;
      default:
        return null;
    }
  };

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: "#3498db" }}
      style={{ backgroundColor: "#1a1a20" }}
      renderLabel={({ route, focused }: { route: any; focused: boolean }) => (
        <Text
          style={{
            color: focused ? "#3498db" : "#888",
            margin: 8,
            fontWeight: "bold",
          }}
        >
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

  if (!userId) {
    return <AuthScreen onAuthSuccess={(user) => setUserId(user.id)} />;
  }

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: insets.bottom, paddingTop: insets.top },
      ]}
    >
      {selectedCardId ? (
        <CardViewerScreen 
          cardId={selectedCardId} 
          onClose={() => setSelectedCardId(undefined)} 
        />
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          renderTabBar={renderTabBar}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          tabBarPosition="bottom"
          lazy
          renderLazyPlaceholder={renderLazyPlaceholder}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f0f13",
  },
  loadingPlaceholder: {
    flex: 1,
    backgroundColor: "#0f0f13",
    justifyContent: "center",
    alignItems: "center",
  },
});
