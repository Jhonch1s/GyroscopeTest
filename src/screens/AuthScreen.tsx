import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { Alert, Button, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface AuthScreenProps {
  onAuthSuccess: () => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('perfil')
        .select('*')
        .eq('email', email)
        .eq('contrasena', password); // texto plano (temporal)
      if (error) throw error;
      if (data && data.length > 0) {
        onAuthSuccess();
      } else {
        Alert.alert('Error', 'Credenciales incorrectas');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!nombre || !email || !password || !fechaNacimiento) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('perfil')
        .insert({
          nombre,
          email,
          contrasena: password, 
          f_nac: fechaNacimiento,
        });
      if (error) throw error;
      Alert.alert('Registro exitoso', 'Ahora inicia sesión');
      setIsLogin(true);
      setNombre('');
      setEmail('');
      setPassword('');
      setFechaNacimiento('');
      setSelectedDate(new Date());
    } catch (error: any) {
      if (error.code === '23505') {
        Alert.alert('Error', 'El email ya está registrado');
      } else {
        Alert.alert('Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>{isLogin ? 'Iniciar Sesión' : 'Registro'}</Text>

        {!isLogin && (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nombre"
              placeholderTextColor={"white"}
              value={nombre}
              onChangeText={setNombre}
            />

            {/* Campo fecha de nacimiento */}
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <TextInput
                style={styles.input}
                placeholder="Fecha de nacimiento"
                value={fechaNacimiento || selectedDate.toLocaleDateString()}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setSelectedDate(date);
                    setFechaNacimiento(date.toISOString().split('T')[0]); // formato YYYY-MM-DD
                  }
                }}
              />
            )}
          </>
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={"white"}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          placeholderTextColor={"white"}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button
          title={loading ? "Cargando..." : (isLogin ? "Ingresar" : "Registrarse")}
          onPress={isLogin ? handleLogin : handleRegister}
          disabled={loading}
        />

        <Button
          title={isLogin ? "Crear cuenta nueva" : "Volver al inicio de sesión"}
          onPress={() => {
            setIsLogin(!isLogin);
            setNombre('');
            setEmail('');
            setPassword('');
            setFechaNacimiento('');
            setSelectedDate(new Date());
          }}
          color="#666"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0f0f13',
  },
  form: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    color: 'white',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 15,
    padding: 8,
    borderRadius: 5,
  },
});