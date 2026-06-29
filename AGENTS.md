# GyroscopeTest — Agent Guide

## What this is

Expo SDK 55 app (React Native 0.83, React 19.2) — a card catalog with gyroscope-driven 3D viewer, random card generation, and pack-opening mechanics. Uses `@shopify/react-native-skia` for the card renderer (with rarity-based GLSL shaders), `react-native-reanimated` for gyroscope sensor data, and `expo-router` for file-based routing.

## Stack

- **Backend**: Supabase (`@supabase/supabase-js`) — tables: `perfil` (auth), `carta` (cards), `mision` (missions), `progreso_usuario` (mission completion)
- **Auth**: Email/password gated in `index.tsx` via `userId` state. AuthScreen queries `perfil` directly comparing `email` + `contrasena` (plain text). Register inserts with plain text password. `bcryptjs` installed but unused in active flow (`react-native-nitro-bcrypt` was removed from deps — was unused and blocked Android build).
- **Forms**: Raw `TextInput` + `Alert` in `AuthScreen` (active). `react-hook-form` with `Controller` in unused `LoginScreen`/`RegisterScreen` under `src/app/`.
- **Sensors**: `useAnimatedSensor(SensorType.GYROSCOPE)` directly in `Skiacard.tsx` (not via `useGyroscope` hook).
- **Navigation**: `react-native-tab-view` TabBar in `index.tsx` (3 tabs: Inicio, Catálogo, Generador). Tab bar at bottom. Card viewer renders as full-screen overlay when `selectedCardId` is set. Auth gate renders `AuthScreen` when `userId` is null.
- **Fonts**: `@expo-google-fonts/uncial-antiqua` for card text in Skia
- **Date picker**: `@react-native-community/datetimepicker` on register form
- **AsyncStorage**: `@react-native-native-async-storage/async-storage` for Supabase auth session persistence

## Commands

| Action | Command |
|--------|---------|
| Install deps | `npm install` |
| Start dev | `npx expo start` or `npm start` |
| Android | `npm run android` (requires pre-built native folder) |
| iOS | `npm run ios` (requires pre-built native folder) |
| Lint | `npm run lint` (runs `expo lint`) |
| Typecheck | `npx tsc --noEmit` |

No test suite configured.

## Architecture

```
src/
  app/
    index.tsx           ← Auth gate + TabView (3 tabs: Home, Catalog, Generator)
    LoginScreen.tsx     ← unused (react-hook-form, not rendered)
    RegisterScreen.tsx  ← unused (react-hook-form + bcryptjs, not rendered)
  components/
    Skiacard.tsx        ← Skia 3D card renderer (gyroscope rotation + rarity shaders)
    PackOpenerModal.tsx ← modal for opening card packs (5 cards, flash animation)
    styles/
      PackOpenerModal.styles.ts
  hooks/
    useGyroscope.ts     ← thin wrapper around useAnimatedSensor (not used by Skiacard)
  lib/
    supabase.ts         ← Supabase client singleton (URL + anon key hardcoded)
  screens/
    AuthScreen.tsx      ← login/register toggle with date picker (active auth UI)
    CardGeneratorScreen.tsx ← random card generator using generateCardParts()
    CardViewerScreen.tsx ← loads card from Supabase, renders Skiacard (full-screen overlay)
    CatalogScreen.tsx   ← FlatList grid of user's cards from Supabase with realtime subscription
    Home.tsx            ← profile header + daily missions → PackOpenerModal on completion
    styles/
      Home.styles.ts
      CatalogScreen.styles.ts
      CardViewerScreen.styles.ts
      CardGeneratorScreen.styles.ts
  types/
    index.ts            ← Carta, Perfil, Mision, ProgresoUsuario, CategoriaCarta, TipoMision
  utils/
    generateCard.ts     ← rolls rarity (weighted random), picks random assets from pools
    imageMapper.ts      ← maps "{rarity}/{filename}" keys to local require(...) assets
```

Entry point is `expo-router/entry`. Routing is file-based under `src/app/`.

## Data flow

1. **Auth**: `index.tsx` owns `userId` state. If null → renders `<AuthScreen>`. AuthScreen queries `perfil` by email+password (plain text), returns `Perfil` object via `onAuthSuccess(user)`.
2. **Home**: Receives `userId`, fetches profile + missions via RPC `get_daily_missions`. Completing a mission updates `progreso_usuario` in Supabase and opens `PackOpenerModal`.
3. **Pack opener**: `PackOpenerModal` generates 5 random cards via `generateCardParts()`, saves all 5 to `carta` table (with `propietario: userId`), then reveals them one by one.
4. **Catalog**: `CatalogScreen` loads all `carta` rows where `propietario = userId`, subscribes to INSERT events on `carta` via Supabase realtime (`postgres_changes`).
5. **Card viewer**: Selecting a card in Catalog sets `selectedCardId` in `index.tsx` → renders `CardViewerScreen` as full-screen overlay (replaces TabView) with a back button.
6. **Generator**: `CardGeneratorScreen` generates single random cards via `generateCardParts()` → renders with `Skiacard` (no DB save). Passes `rarity` prop.
7. **Card rendering**: `Skiacard` uses gyroscope for 3D rotation + lighting shader. Rarity layers:
   - **common**: normal map lighting only (`NORMAL_SCALE: 0.2`)
   - **rare**: glitter texture (`glitter.png`) + animated rainbow sparkles (3 layers twinkle)
   - **epic**: illusion texture (`illusion.png`) + foil chrome shimmer (animated hue + sparkles)
   - **legendary**: 3-layer cosmos (bottom/middle/top) with parallax + animated arcoíris drift + star twinkle + dimmer saturated lighting

## Assets structure

```
assets/
  common/backgrounds/, images/, textures/
  rare/backgrounds/, images/, textures/     ← grain.webp, glitter.png
  epic/backgrounds/, images/, textures/     ← illusion.png, tex_01.png
  legendary/backgrounds/, images/, textures/ ← cosmos-*.png
  images/                                   ← buffkirk.jpg
  sobre/                                    ← sobre.png (pack image)
  expo.icon/Assets/                         ← app icon
```

Images resolved via `imageMapper.ts` using `require(...)` in `"{rarity}/{filename}"` format.

## Rarity system (utils/generateCard.ts)

| Rarity | Weight | Asset pools |
|--------|--------|-------------|
| common | 40 | 2 bg, 3 img, 1 tex |
| rare | 20 | 1 bg, 1 img, 1 tex |
| epic | 20 | 1 bg, 1 img, 1 tex |
| legendary | 20 | 1 bg, 3 img, 1 tex |

`rollRarity()` uses weighted random distribution. Each card rolls rarity once — background, center image, and texture all come from the same rarity pool.

## Key conventions

- **Path alias**: `@/*` → `./src/*`
- **React Compiler** enabled — do not add manual `memo()` or `useCallback`
- **Typed routes** enabled (`app.json` experiments.typedRoutes)
- **No `_layout.tsx`** — single screen with TabView, no navigation stack
- **Styles are separated** in `src/screens/styles/` and `src/components/styles/` using `StyleSheet.create`

## Gotchas

- `android/` and `ios/` are gitignored and generated by `expo run:*` — never edit native code directly
- `expo-env.d.ts` is gitignored and auto-generated — do not commit it
- `scripts/reset-project.js` destructively moves `src/` to `example/` — never run unintentionally
- Supabase URL and anon key are hardcoded in `src/lib/supabase.ts` — not env-variable driven
- Auth stores passwords in plain text (`perfil.contrasena`) — `bcryptjs` installed but unused in active flow (`react-native-nitro-bcrypt` was removed from deps — was unused and blocked Android build)
- `Skiacard.tsx` uses its own `useAnimatedSensor` directly, not the `useGyroscope` hook in `src/hooks/`
- Skia shaders (`LIGHTING_SKSL`, `RARE_SKSL`, `EPIC_SKSL`, `COSMOS_SKSL`) are inline strings — changes require Metro rebuild
- `CardViewerScreen` does NOT pass `rarity` prop to `<Skiacard>` (uses default `"common"`) — card viewer always shows common-level lighting regardless of actual card rarity
- `imageMapper.ts` uses `"{rarity}/{filename}"` keys with `endsWith` fallback for legacy DB entries
- `generateCard.ts` references asset files (`bg_01.png`, `img_01.jpg`, etc.) that must exist in the corresponding `assets/{rarity}/{category}/` directories
