import { useFocusEffect, useNavigation, useRoute } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  TextInput,
} from "react-native";
import { RootStackParamList } from "../app/index";
import PackOpenerModal from "../components/PackOpenerModal";
import { supabase } from "../lib/supabase";
import { Mision, Perfil } from "../types";
import { getLocalImage } from "../utils/imageMapper";
import { styles } from "./styles/Home.styles";

import * as ImagePicker from "expo-image-picker";

interface Props {
  userId: number;
  showPackFromRoute?: boolean;
  onLogout?: () => void;
}



export default function Home({ userId, onLogout }: Props) {
  const [misiones, setMisiones] = useState<Mision[]>([]);
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  
  const [showPackModal, setShowPackModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editNombre, setEditNombre] = useState("");
  const [editFoto, setEditFoto] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const openEditModal = () => {
    if (perfil) {
      setEditNombre(perfil.nombre);
      setEditFoto(perfil.imagen_perfil);
    }
    setShowEditModal(true);
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setEditFoto(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSaveProfile = async () => {
    if (!perfil) return;
    setSavingProfile(true);
    try {
      const updates = {
        nombre: editNombre,
        imagen_perfil: editFoto,
      };

      const { error } = await supabase
        .from("perfil")
        .update(updates)
        .eq("id", userId);

      if (error) throw error;
      
      setPerfil({ ...perfil, ...updates });
      setShowEditModal(false);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
    } finally {
      setSavingProfile(false);
    }
  };

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

     if (id === 1 || id === 5) {
      navigation.navigate('DontTouch', { userId, missionId: id });
      return;
    }
    
    if (id === 2 || id === 6) {
      navigation.navigate('ReadingMission', { userId, missionId: id });
      return;
    }

    if (id === 7) {
      navigation.navigate('TriviaMission', { userId, missionId: id });
      return;
    }
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

   useFocusEffect(
    useCallback(() => {
      const params = route.params as { showPack?: boolean } | undefined;
      if (params?.showPack) {
        setShowPackModal(true);
        // Limpiar el parámetro para que no se repita al volver a enfocar
        navigation.setParams({ showPack: undefined });
        // Refrescar la lista de misiones (ya que la 31 se completó)
        fetchData();
      }
    }, [navigation, route.params])
  );


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
          <TouchableOpacity onPress={openEditModal}>
            {perfil?.imagen_perfil ? (
              <Image source={{ uri: perfil.imagen_perfil }} style={styles.avatar} />
            ) : (
              <Image source={getLocalImage("buffkirk.jpg")} style={styles.avatar} />
            )}
            <View style={{ position: 'absolute', bottom: -5, right: -5, backgroundColor: '#3498db', borderRadius: 12, padding: 4 }}>
              <Text style={{ fontSize: 10 }}>✏️</Text>
            </View>
          </TouchableOpacity>
          <View>
            <Text style={styles.greeting}>Hola,</Text>
            <Text style={styles.username}>{perfil?.nombre || "Usuario"}</Text>
          </View>
        </View>
        {onLogout && (
          <TouchableOpacity style={{ backgroundColor: '#e74c3c', padding: 8, borderRadius: 8 }} onPress={onLogout}>
            <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>Salir</Text>
          </TouchableOpacity>
        )}
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
                  <Text style={styles.claimButtonText}>
                    {[1, 2, 5, 6, 7].includes(mision.id) ? 'Hacer' : 'Completar'}
                  </Text>
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

      {/* Modal de Editar Perfil */}
      {showEditModal && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <View style={{ backgroundColor: '#1a1a20', padding: 20, borderRadius: 12, width: '80%' }}>
            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' }}>Editar Perfil</Text>
            
            <TouchableOpacity onPress={handlePickImage} style={{ alignSelf: 'center', marginBottom: 15 }}>
              {editFoto ? (
                <Image source={{ uri: editFoto }} style={{ width: 80, height: 80, borderRadius: 40 }} />
              ) : (
                <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: '#fff' }}>Foto</Text>
                </View>
              )}
              <Text style={{ color: '#3498db', marginTop: 5, textAlign: 'center' }}>Cambiar</Text>
            </TouchableOpacity>

            <Text style={{ color: '#aaa', marginBottom: 5 }}>Nombre</Text>
            <TextInput 
              value={editNombre}
              onChangeText={setEditNombre}
              style={{ backgroundColor: '#0f0f13', color: 'white', padding: 10, borderRadius: 8, marginBottom: 20 }}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={{ padding: 10 }}>
                <Text style={{ color: '#aaa' }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveProfile} style={{ backgroundColor: '#3498db', padding: 10, borderRadius: 8 }}>
                {savingProfile ? <ActivityIndicator size="small" color="#fff" /> : <Text style={{ color: 'white' }}>Guardar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}
