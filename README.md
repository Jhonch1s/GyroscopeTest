# GyroscopeTest - 3D Card Collection App

Una aplicación móvil interactiva construida con **React Native (Expo)** donde los usuarios completan misiones diarias para obtener sobres de cartas. Las cartas cuentan con un visor 3D avanzado impulsado por **Skia** y el giroscopio del dispositivo (usando **Reanimated**), aplicando distintos efectos visuales (holográficos, brillos, arcoíris) dependiendo de la rareza de la carta.

## Tecnologías Principales

*   **Frontend:** React Native, Expo (SDK 55), Expo Router
*   **Animaciones y Gráficos:** `@shopify/react-native-skia`, `react-native-reanimated`
*   **Backend & Base de Datos:** Supabase (Autenticación y PostgreSQL)
*   **Estilos:** Vanilla StyleSheet

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalado en tu computadora:

1.  **[Node.js](https://nodejs.org/es/)** (Versión 18 o 20 LTS recomendada).
2.  **[Git](https://git-scm.com/)** para clonar el repositorio.
3.  Una cuenta gratuita en **[Supabase](https://supabase.com/)** para la base de datos.
4.  La aplicación **Expo Go** instalada en tu teléfono ([Android](https://play.google.com/store/apps/details?id=host.exp.exponent) o [iOS](https://apps.apple.com/us/app/expo-go/id982107779)), o un Emulador de Android / Simulador de iOS en tu PC.

---

## ⚙️ Guía de Instalación Local

### 1. Clonar el repositorio
Abre tu terminal y ejecuta:
```bash
git clone https://github.com/Jhonch1s/GyroscopeTest
cd GyroscopeTest
```

### 2. Instalar las dependencias
Instala todos los paquetes necesarios de Node.js:
```bash
npm install
```

### 3. Configurar la Base de Datos (Supabase)
Esta aplicación requiere de una base de datos para funcionar (guardar usuarios, cartas y misiones).

1. Crea un nuevo proyecto en [Supabase](https://supabase.com/).
2. Ve a la sección **SQL Editor** en el panel de Supabase.
3. Abre el archivo `supabase_seed.sql` que se encuentra en la raíz de este proyecto.
4. Copia todo el contenido del archivo, pégalo en el SQL Editor de Supabase y presiona **Run**. (Esto creará todas las tablas, configurará la seguridad RLS e insertará los datos y misiones iniciales).
5. Desactiva la opcion **Enable Row Level Security (RLS)** en la tabla **Perfil** para que quede en estado **UNRESTRICTED**

### 4. Vincular la App con tu Base de Datos
Debes conectar el código con tu nuevo proyecto de Supabase.

1. En Supabase, ve a **Project Settings > API**.
2. Copia tu `Project URL` y tu `anon public key`.
3. En el código del proyecto, ve al archivo `src/lib/supabase.ts`.
4. Reemplaza los valores de `supabaseUrl` y `supabaseAnonKey` con los tuyos:
   ```typescript
   const supabaseUrl = 'TU_PROJECT_URL_AQUI';
   const supabaseAnonKey = 'TU_ANON_KEY_AQUI';
   ```

### 5. Ejecutar la Aplicación
Inicia el servidor de desarrollo de Expo:
```bash
npx expo start
```
*(Opcional: puedes usar `npm start`)*

**Para ver la app:**
*   **Teléfono físico (Recomendado):** Abre la app **Expo Go** en tu celular y escanea el código QR que aparece en la terminal. *(Nota: El teléfono y la PC deben estar en la misma red Wi-Fi).*
*   **Emulador:** Presiona la tecla `a` en la terminal para abrirlo en un emulador de Android, o la tecla `i` para el simulador de iOS.
