# GyroscopeTest — Agent Guide

## What this is

Expo SDK 55 app (React Native 0.83, React 19.2) — a card catalog with gyroscope-driven 3D viewer, random card generation, and pack-opening mechanics. Uses `@shopify/react-native-skia` for the card renderer (with rarity-based GLSL shaders), `react-native-reanimated` for gyroscope sensor data, and `expo-router` for file-based routing.

## Stack

- **Backend**: Supabase (`@supabase/supabase-js`) — tables: `perfil` (auth), `carta` (cards), `mision` (missions), `progreso_usuario` (mission completion), `texto_educativo`, `trivia_utec`
- **Auth**: Email/password gated in `src/app/index.tsx` via `userId` state. AuthScreen queries `perfil` directly comparing `email` + `contrasena` (plain text). Register inserts with plain text password. `bcryptjs` installed but unused in active flow (RegisterScreen with bcrypt is not rendered).
- **Forms**: Raw `TextInput` + `Alert` in `AuthScreen` (active). `react-hook-form` with `Controller` in unused `LoginScreen`/`RegisterScreen` under `src/app/`.
- **Sensors**: `useAnimatedSensor(SensorType.GYROSCOPE)` directly in `Skiacard.tsx` and mission screens (not via `useGyroscope` hook).
- **Navigation**: `DrawerNavigator` as root → screens. TabView in `MainTabs` (3 tabs: Inicio, Catálogo, Generador). Mission screens: `DontTouchScreen`, `MisionSquatsPantalla`, `ReadingMissionScreen`, `TriviaMissionScreen`. Auth gate renders `AuthScreen` when `userId` is null.
- **Fonts**: `@expo-google-fonts/uncial-antiqua` (common cards), `@expo-google-fonts/cinzel` (legendary), `@expo-google-fonts/orbitron` (rare/epic)
- **Date picker**: `@react-native-community/datetimepicker` on register form
- **AsyncStorage**: `@react-native-async-storage/async-storage` for Supabase auth session persistence
- **Audio**: `expo-av` for pack open (`pack-open.wav`), card reveal (`card-reveal.wav`, `rare-reveal.wav`)
- **Image picker**: `expo-image-picker` for profile photo editing

## Commands

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Start dev | `npx expo start` or `npm start` |
| Android | `npm run android` (requires pre-built native folder) |
| iOS | `npm run ios` (requires pre-built native folder) |
| Web | `npm run web` |
| Lint | `npm run lint` (runs `expo lint`) |
| Typecheck | `npx tsc --noEmit` |

No test suite configured.

## Architecture

```
src/
  app/
    index.tsx           ← Auth gate + Drawer + TabView (3 tabs: Home, Catalog, Generator)
    LoginScreen.tsx      ← unused (react-hook-form, not rendered)
    RegisterScreen.tsx   ← unused (react-hook-form + bcryptjs, not rendered)
  components/
    Skiacard.tsx         ← Skia 3D card renderer (gyroscope rotation + rarity shaders)
    PackOpenerModal.tsx  ← modal for opening card packs (5 cards, flash animation + audio)
    styles/
      PackOpenerModal.styles.ts
  hooks/
    useGyroscope.ts       ← thin wrapper around useAnimatedSensor (not used by Skiacard)
  lib/
    supabase.ts           ← Supabase client singleton (URL + anon key hardcoded)
  screens/
    AuthScreen.tsx        ← login/register toggle with date picker (active auth UI)
    CardGeneratorScreen.tsx    ← random card generator using generateCardParts()
    CardViewerScreen.tsx        ← loads card from Supabase, renders Skiacard (full-screen overlay)
    CatalogScreen.tsx           ← FlatList grid of user's cards with realtime subscription + rarity filters
    Home.tsx                    ← profile header + daily missions + profile editing modal
    styles/
      Home.styles.ts
      CatalogScreen.styles.ts
      CardViewerScreen.styles.ts
      CardGeneratorScreen.styles.ts
    misiones/
      DontTouchScreen.tsx      ← gyroscope-based mission (don't move)
      MisionSquatsPantalla.tsx  ← accelerometer-based squats mission (10 squats in 60s)
      ReadingMissionScreen.tsx ← timer-based reading mission
      TriviaMissionScreen.tsx  ← trivia questions mission
  types/
    index.ts             ← Carta, Perfil, Mision, ProgresoUsuario, CategoriaCarta, TipoMision
  utils/
    generateCard.ts      ← rolls rarity (weighted random), picks random assets from pools
    imageMapper.ts       ← maps "{rarity}/{filename}" keys to local require(...) assets
```

Entry point is `expo-router/entry`. Routing is file-based under `src/app/`.

## Data flow

1. **Auth**: `index.tsx` owns `userId` state (number | null). If null → renders `AuthScreen` inside Drawer. AuthScreen queries `perfil` by email+password (plain text), returns `Perfil` object via `onAuthSuccess(user)`.
2. **Home**: Receives `userId`, fetches profile + missions via RPC `get_daily_missions`. Mission completion routing:
   - id 1, 5 → `DontTouchScreen` (don't move for N seconds)
   - id 3, 8 → `MisionSquatsPantalla` (10 squats using accelerometer, 60s limit)
   - id 2, 6 → `ReadingMissionScreen` (read for N seconds)
   - id 7 → `TriviaMissionScreen` (answer 3 trivia questions)
   - other → opens `PackOpenerModal` directly
   - `showPack` route param triggers pack modal on screen focus
3. **Pack opener**: `PackOpenerModal` generates 5 random cards via `generateCardParts()`, saves all 5 to `carta` table (with `propietario: userId`), then reveals them one by one with sound effects.
4. **Catalog**: `CatalogScreen` loads all `carta` rows where `propietario = userId`, subscribes to INSERT events via Supabase realtime (`postgres_changes`). Rarity filter pills: All, Comun, Raro, Epico, Legendary.
5. **Card viewer**: Selecting a card in Catalog sets `selectedCardId` in `MainTabs` → renders `CardViewerScreen` as full-screen overlay with a back button. Uses `mapDbToRarity(card.categoria)` to convert DB rarity to Skia rarity.
6. **Generator**: `CardGeneratorScreen` generates single random cards via `generateCardParts()` → renders with `Skiacard` passing correct `rarity` prop. No DB save.
7. **Card rendering**: `Skiacard` uses gyroscope for 3D rotation + lighting shader. Rarity layers:
   - **common**: normal map lighting only (`NORMAL_SCALE: 0.2`), UncialAntiqua font
   - **rare**: glitter texture (`glitter.png`) + animated rainbow sparkles (3 layers twinkle), Orbitron font
   - **epic**: illusion texture (`illusion.png`) + foil chrome shimmer (animated hue + sparkles), Orbitron font
   - **legendary**: 3-layer cosmos (bottom/middle/top) with parallax + animated arcoiris drift + star twinkle + dimmer saturated lighting, Cinzel font

## Assets structure

```
assets/
  sounds/
    card-reveal.wav, pack-open.wav, rare-reveal.wav
  common/
    backgrounds/, images/, textures/
  rare/
    backgrounds/, images/, textures/     ← grain.webp, glitter.png
  epic/
    backgrounds/, images/, textures/     ← illusion.png, tex_01.png
  legendary/
    backgrounds/, images/, textures/      ← cosmos-bottom.png, cosmos-middle.png, cosmos-top.png
  images/                                ← buffkirk.jpg, buffkirksdad.jpeg
  sobre/                                 ← sobre.png
  expo.icon/Assets/
```

Images resolved via `imageMapper.ts` using `require(...)` in `"{rarity}/{filename}"` format.

## Rarity system (utils/generateCard.ts)

| Rarity | Weight | Backgrounds | Images | Textures |
|--------|--------|------------|--------|----------|
| common | 40 | 3 (bg_01-03) | 5 (img_01-05) | 1 (tex_01) |
| rare | 20 | 1 (bg_01) | 3 (img_01-03) | 1 (tex_01) |
| epic | 20 | 1 (bg_01) | 3 (img_01-03) | 1 (tex_01) |
| legendary | 20 | 2 (bg_01-02) | 5 (img_01-05) | 1 (tex_01) |

`rollRarity()` uses weighted random distribution. Each card rolls rarity once — background, center image, and texture all come from the same rarity pool.

## Key conventions

- **Path alias**: `@/*` → `./src/*`
- **React Compiler** enabled (`reactCompiler: true` in app.json) — do not add manual `memo()` or `useCallback`
- **Typed routes** enabled (`typedRoutes: true` in app.json)
- **No `_layout.tsx`** — single screen with Drawer + TabView, no file-based layout
- **Styles are separated** in `src/screens/styles/` and `src/components/styles/` using `StyleSheet.create`

## Gotchas

- `android/` and `ios/` are gitignored and generated by `expo run:*` — never edit native code directly
- `expo-env.d.ts` is gitignored and auto-generated — do not commit it
- `scripts/reset-project.js` destructively moves `src/` to `example/` — never run unintentionally
- Supabase URL and anon key are hardcoded in `src/lib/supabase.ts` — not env-variable driven
- Auth stores passwords in plain text (`perfil.contrasena`) — `bcryptjs` installed but unused in active flow
- `Skiacard.tsx` uses its own `useAnimatedSensor` directly, not the `useGyroscope` hook in `src/hooks/`
- Skia shaders (`LIGHTING_SKSL`, `RARE_SKSL`, `EPIC_SKSL`, `COSMOS_SKSL`) are inline strings — changes require Metro rebuild
- `CardViewerScreen` does NOT pass `rarity` prop to `<Skiacard>` — uses default rarity from parts (which is always "common" for this screen since it loads from DB) — BUG: card viewer always shows common-level lighting regardless of actual card rarity
- `imageMapper.ts` uses `"{rarity}/{filename}"` keys with `endsWith` fallback for legacy DB entries
- `generateCard.ts` asset pools must match actual files in `assets/{rarity}/{category}/` directories
- `Home.tsx` supports profile editing (nombre, imagen_perfil) via modal with image picker
- Mission screens (`DontTouchScreen`, `MisionSquatsPantalla`, `ReadingMissionScreen`, `TriviaMissionScreen`) use Drawer navigation route params
