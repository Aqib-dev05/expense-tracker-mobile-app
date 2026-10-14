# Ledgerly Mobile (React Native · Expo SDK 57)

Android app for the Ledgerly MERN expense tracker. Same screens, theme (cobalt brand, Manrope, light/dark),
icons and API as the web app in `../frontend` — it talks to the existing Express backend in `../backend`, unchanged.

| | |
|---|---|
| Framework | React Native 0.86 + Expo SDK 57 (latest stable), Expo Router, TypeScript |
| Styling | NativeWind 4 (Tailwind 3.4) — `tailwind.config.js` has the same `brand` / `ink` tokens as the web |
| Data | Axios → existing REST API, TanStack Query for fetching |
| Caching | TanStack Query cache persisted to AsyncStorage (7 days), 60 s stale time, offline-first, refetch on reconnect / app foreground, pull-to-refresh |
| Storage | JWT in SecureStore (Android Keystore), prefs + cache in AsyncStorage, CSV exports in app document storage |
| Notifications | Local only: budget alerts (80% / exceeded) and an optional daily reminder, Android channels, Android 13+ permission |
| Charts | `react-native-svg` (donut, grouped bars, area) with touch tooltips |
| Android support | minSdk 24 (Android 7.0) → current, phones, tablets (responsive grids), emulators |

## Run it

1. Start the backend as usual (`npm --prefix ../backend run dev`, port 5000).
2. Install and configure the app:
   ```bash
   cd mobile
   npm install
   cp .env.example .env      # set EXPO_PUBLIC_API_URL
   ```
3. API URL (`EXPO_PUBLIC_API_URL`):
   - **Android emulator:** `http://10.0.2.2:5000/api` (`localhost` is rewritten to this automatically)
   - **Physical phone:** `http://<your-PC-LAN-IP>:5000/api` (same Wi-Fi)
   - **Production:** `https://api.yourdomain.com/api` (cleartext HTTP is only enabled for `http://` URLs)
4. Run a development build (needed for notifications, which Expo Go does not fully support):
   ```bash
   npm run android:dev       # builds + installs on a connected device / emulator (needs Android SDK)
   # or, without a local SDK:
   npm run build:dev         # EAS cloud build, install the APK, then `npx expo start --dev-client`
   ```
5. Release: `npm run build:apk` (installable APK) or `npm run build:aab` (Play Store). Put your real API domain in `eas.json`.

No CORS change is needed: native requests have no `Origin` header, which the backend already allows.

## Structure

```
src/app/            Expo Router screens: (auth)/login, register · (app)/index, transactions, budgets, analytics, reports, settings
src/components/     ui/ primitives (Button, Card, Input, Select, DateField, Modal…), charts/, feature components
src/services/       axios instance + one service per API area (mirrors frontend/src/services)
src/lib/            queryClient (cache), notifications, files (CSV storage/share), storage helpers
src/store/          Auth, Preferences (theme/date/notifications), Toast, AppData contexts
```

## Behaviour notes

- **Offline:** last-loaded data is shown from the persisted cache with an "offline" banner; writes need a connection (the server is the source of truth) and invalidate the cache afterwards.
- **Logout / session expiry** wipes the cache so one account's data is never shown to another.
- **Reports:** "Export CSV" saves the file in the app's private storage (no permission needed), opens the share sheet, and lists saved exports with Share / Save to… (folder picker) / Delete.
- **Avatar:** picked with the system photo picker, cropped to a square, resized to 128 px JPEG (same data-URL format the backend validates).
- Table views and the desktop sidebar are replaced by the web's own mobile layout (cards, drawer, bottom navigation with the raised “+” button).
