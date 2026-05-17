import Skiacard from "@/components/Skiacard";
import React from "react";
import {
  SafeAreaView,
  StyleSheet
} from "react-native";

export default function GyroscopeScreen() {

  return (
    <SafeAreaView style={styles.safe}>
      <Skiacard></Skiacard>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#111",
  },
});
