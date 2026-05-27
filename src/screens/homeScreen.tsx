import { Image, StyleSheet, View } from "react-native";
import { Text } from 'react-native-gesture-handler';



export default function homeScreen() {
    return (
        <View style={styles.safe}>
            <View style={styles.principal}>
                <View className="perfil" style={styles.perfil}>
                    <Image
                        source={require('../../assets/images/buffkirk.jpeg')}
                        style={styles.perfilImagen}
                    >
                    </Image>
                    <Text style={styles.texto}>
                        JorgeKirko47
                    </Text>
                </View>
                <View style={styles.contenedor}>
                    <Text style={styles.texto}>
                        Actividades De hoy
                    </Text>

                    <View style={styles.seccionTareas}>
                        <View style={styles.tarea}>
                            <Text style={styles.texto}>
                                Correr por 20 horas
                            </Text>
                        </View>
                        <View style={styles.tarea}>
                    
                        </View>
                        <View style={styles.tarea}>

                        </View>
                        <View style={styles.tarea}>

                        </View>
                        
                    </View>
                </View>
            </View>


        </View>
    )


}

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: "#1a1a1f"
    },
    principal: {
        marginLeft: 40,
        marginTop: 60,
    },
    perfil: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: '20px'
    },
    perfilImagen: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden'
    },
    texto: {
        color: 'white',
        fontSize: 30,
        fontFamily: 'monospace'
    },
    contenedor: {
        marginTop: 20,
        flexDirection: 'column'
    },
    seccionTareas:{
        marginTop: 20,
    },
    tarea: {
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
        width: '90%',
        height: 120,
        backgroundColor: "#22222a"
    }
});
