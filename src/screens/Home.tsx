import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { supabase } from "../lib/supabase";
import { Mision, Perfil } from "../types";
import { getLocalImage } from "../utils/imageMapper";
import { styles } from "./styles/Home.styles";
import PackOpenerModal from "../components/PackOpenerModal";

interface Props {
  userId: number;
}

export default function Home({ userId }: Props) {
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [showPackModal, setShowPackModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from("perfil")
        .select("*")
        .eq("id", userId)
        .single();

      if (profileError) {
        console.warn(
          "Perfil no encontrado.", profileError
        );
      } else if (profileData) {
        setPerfil(profileData);
      }

      const { data: missionsData, error: missionsError } = await supabase.rpc(
        "get_daily_missions",
        {
          p_perfil_id: userId,
          limit_count: 3,
        },
      );

      if (missionsError) throw missionsError;

      setMisiones(missionsData || []);
    } catch (error) {
      console.error("Error cargando los datos de misiones:", error);
    } finally {
      setLoading(false);
    }
  };

  const completeActivity = async (id: number) => {
    // Abrir el modal de sobres
    setShowPackModal(true);

    // Remover la misión de la lista
    setMisiones((prev) => prev.filter((m) => m.id !== id));

    // Guardar en la base de datos si tenemos perfil
    if (perfil?.id) {
      const { error } = await supabase
        .from('progreso_usuario')
        .update({ completado: true })
        .eq('perfil_id', perfil.id)
        .eq('mision_id', id)
        .eq('fecha', new Date().toISOString().split('T')[0]); // HOY

      if (error) {
        console.error("Error al completar misión:", error);
      }
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Común":
        return "#a0a0a0";
      case "Raro":
        return "#3498db";
      case "Épico":
        return "#9b59b6";
      case "Legendario":
        return "#f1c40f";
      default:
        return "#555";
    }
  };

  const getDificultadColor = (dificultad: string) => {
    switch (dificultad) {
      case "Fácil":
        return "#2ecc71";
      case "Media":
        return "#3498db";
      case "Difícil":
        return "#e74c3c";
      default:
        return "#555";
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.safe,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.safe}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <Image source={getLocalImage("buffkirk.jpg")} style={styles.avatar} />
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.username}>{perfil?.nombre || "Usuario"}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actividades de Hoy</Text>
        <Text style={styles.sectionSubtitle}>
          Completa tareas para ganar sobres de cartas.
        </Text>

        <View style={styles.activitiesList}>
          {misiones.length === 0 ? (
            <Text style={{ color: "#888" }}>No hay misiones disponibles.</Text>
          ) : (
            misiones.map((mision) => (
              <View key={mision.id} style={styles.activityCard}>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{mision.nombre}</Text>
                  <View style={styles.badgesRow}>
                    <Text style={[styles.difficultyBadge, { backgroundColor: getDificultadColor(mision.tipo) }]}>{mision.tipo}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.claimButton, { backgroundColor: "#3498db" }]}
                  onPress={() => completeActivity(mision.id)}
                >
                  <Text style={styles.claimButtonText}>Completar</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </View>

      {/* Modal de sobres */}
      <PackOpenerModal 
        isVisible={showPackModal} 
        onClose={() => setShowPackModal(false)} 
        perfilId={userId} 
      />
    </ScrollView>
  );
}
