import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import bcrypt from 'bcryptjs';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Button, Platform, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import 'react-native-get-random-values';


export default function RegisterScreen() {

    const { control, handleSubmit, formState: { errors } } = useForm<FormData>();
    const [loading, setLoading] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    interface FormData {
        nombre: string;
        email: string;
        password: string;
        fecha_nacimiento: string;
    }

    const [submittedData, setSubmittedData] = useState<FormData | null>(null);



    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.password, salt);

            const { error } = await supabase
                .from('perfil')
                .insert({
                    nombre: data.nombre,
                    email: data.email,
                    contrasena: data.password,
                    f_nac: data.fecha_nacimiento,
                });

            if (error) throw error;

            Alert.alert("Registro exitoso", "Ahora puede iniciar Sesión")
        } catch (error: any) {
            if (error.code === '23505') { // código de violación de unique constraint en PostgreSQL
                Alert.alert('Error', 'El email ya está registrado');
            } else {
                Alert.alert('Error', error.message);
            }

        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.container}>

                <Text style={styles.labelText}>Nombre:</Text>
                <Controller
                    control={control}
                    name="nombre"
                    rules={{ required: 'Debes ingresar tu nombre' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            style={styles.input}
                            placeholder="Nombre"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                        />
                    )}
                />

                {errors.nombre && <Text style={styles.errorText}>{errors.nombre.message}</Text>}

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

                <Controller
                    control={control}
                    name="fecha_nacimiento"
                    rules={{ required: 'Fecha de nacimiento requerida' }}
                    render={({ field: { onChange, value } }) => (
                        <>
                            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                <TextInput style={styles.input} placeholder="Fecha de nacimiento" value={selectedDate.toLocaleDateString()} editable={false} pointerEvents="none" />
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
                                            onChange(date.toISOString().split('T')[0]);
                                        }
                                    }}
                                />
                            )}
                        </>
                    )}
                />
                {errors.fecha_nacimiento && <Text style={styles.errorText}>{errors.fecha_nacimiento.message}</Text>}


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

                {/* Gönderilen Veriler */}
                {submittedData && (
                    <View >
                        <Text >Submitted Data:</Text>
                        <Text>Name: {submittedData.nombre}</Text>
                        <Text>Email: {submittedData.email}</Text>
                    </View>
                )}
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
