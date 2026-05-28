import * as React from 'react';
import {
  View, useWindowDimensions
} from "react-native";
import { Text } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SceneMap, TabView } from 'react-native-tab-view';
import nextCard from "../app/nextCard";
import homeScreen from "../screens/homeScreen";



const FirstRoute = () => (
  <View style={{ flex:1, backgroundColor: '#ff4081'}}>
    <Text>Pantalla Home</Text>
    <Text>Pantalla xd</Text>
    <Text>Bienvenido a la app</Text>
  </View>
);

const SecondRoute = () => (
  <View style={{ flex: 1, backgroundColor: '#673ab7' }}>
      <Text>Pantalla Tab2</Text>
  </View>
);

const renderScene = SceneMap({
  first: homeScreen,
  second: nextCard,
});

const routes = [
  { key: 'first', title: 'Home' },
  { key: 'second', title: 'tab2' },
];


export default function App() {
  
  const layout = useWindowDimensions();
  const [index, setIndex] = React.useState(0);
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, paddingBottom: insets.bottom,paddingTop: insets.top}}>
      <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      tabBarPosition='bottom'
      />
    </View>
    
  );
}