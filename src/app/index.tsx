import AuthScreen from "@/screens/AuthScreen";
import CardGeneratorScreen from "@/screens/CardGeneratorScreen";
import DontTouchScreen from "@/screens/misiones/DontTouchScreen";
import ReadingMissionScreen from "@/screens/misiones/ReadingMissionScreen";
import TriviaMissionScreen from "@/screens/misiones/TriviaMissionScreen";
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import * as React from "react";
import {
  ActivityIndicator,
  LogBox,
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

export type RootStackParamList = {
  Auth: undefined;
  MainTabs?: { showPack?: boolean };  // ahora acepta params
  DontTouch: { userId: number; missionId: number };
  ReadingMission: { userId: number; missionId: number };
  TriviaMission: { userId: number; missionId: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const Drawer = createDrawerNavigator();


 function MainTabs({ userId, onLogout }: { userId: number, onLogout: () => void }) {

  LogBox.ignoreLogs(["Can't perform a React state update on a component that hasn't mounted yet"]);
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const [selectedCardId, setSelectedCardId] = React.useState<
    number | undefined
  >();
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const params = route.params as { showPack?: boolean } | undefined;
  const showPack = params?.showPack ?? false;
  

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
        return <Home userId={userId!} onLogout={onLogout} />;
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

export default function App() {
  const [userId, setUserId] = React.useState<number | null>(null);

  // Si no hay userId, mostramos AuthScreen, pero dentro del Stack
  // para mantener la navegación consistente.
  return (
    
      <Drawer.Navigator screenOptions={{ headerShown: false }}>
        {!userId ? (
          <Drawer.Screen name="Auth">
            {() => <AuthScreen onAuthSuccess={(user) => setUserId(user.id)} />}
          </Drawer.Screen>
        ) : (
          <>
            <Drawer.Screen name="MainTabs">
              {() => <MainTabs userId={userId} onLogout={() => setUserId(null)} />}
            </Drawer.Screen>
            <Drawer.Screen name="DontTouch" component={DontTouchScreen} />
            <Drawer.Screen name="ReadingMission" component={ReadingMissionScreen} />
            <Drawer.Screen name="TriviaMission" component={TriviaMissionScreen} />
          </>
        )}
      </Drawer.Navigator>
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
