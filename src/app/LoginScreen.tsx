import { supabase } from "@/lib/supabase";
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    interface FormData {
        email: string;
        password: string;
    }

    const [submittedData, setSubmittedData] = useState<FormData | null>(null);

    const onSubmit = async (data: FormData) => {
        setLoading(true);

        try {
            const { data: usuarios, error } = await supabase
                .from('perfil')
                .select('*')
                .eq('email', data.email)
                .eq('contrasena', data.password)

            if (error) throw error;

            if (usuarios && usuarios.length > 0) {
                Alert.alert('Éxito', `Bienvenido ${usuarios[0].nombre}`);
            } else {
                Alert.alert('Error', 'credenciales incorrectas');
            }
        } catch (error: any) {
            Alert.alert('Error', 'Error de conexión o consulta');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }


    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>

                <Text style={styles.labelText}>Correo Eléctronico:</Text>
                <Controller
                    control={control}
                    name="email"
                    rules={{ required: 'Debes Ingresar un correo', pattern: { value: /^\S+@\S+$/i, message: 'Ingresa una dirección de correo valida' } }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                        />
                    )}
                />

                {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}



                <Text style={styles.labelText}>Contraseña:</Text>
                <Controller
                    control={control}
                    name="password"
                    rules={{ required: 'Debes ingresar una contraseña', minLength: { value: 6, message: 'Mínimo 6 caracteres' } }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Contraseña"
                            secureTextEntry
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                        />
                    )}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

                <Button title="Submit" onPress={handleSubmit(onSubmit)} />

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    input: {
        color: 'white',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        padding: 8,
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
    },
    labelText: {
        color: 'white',
        fontSize: 16
    }
});
