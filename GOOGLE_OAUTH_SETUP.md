# Google OAuth Setup Guide

## ✅ Fixed Issues:
1. ✅ **AsyncStorage Error Fixed** - Now using in-memory storage (no native module errors!)
2. ✅ **Google Sign-In Added** - "Continue with Google" button available

## ⚠️ Important Note: Session Persistence
Currently, the app uses **in-memory storage** to avoid AsyncStorage native module errors. This means:
- ✅ **Works perfectly** in Expo Go and development
- ⚠️ **Need to login again** after restarting the app
- ✅ **Session persists** while app is open

### Enable Persistent Storage (Optional)
Once you create a production build (EAS Build or bare workflow), AsyncStorage will work properly:
1. Build the app: `eas build --platform ios` or `eas build --platform android`
2. AsyncStorage will work natively in the built app
3. Users will stay logged in across app restarts

For now, in-memory storage works great for development and testing!

---

To enable Google sign-in, you need to create OAuth credentials in Google Cloud Console:

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name it "Resolve" and click "Create"

### Step 2: Enable Google+ API

1. In your project, go to **APIs & Services** → **Library**
2. Search for "Google+ API"
3. Click on it and click "Enable"

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. You may need to configure the OAuth consent screen first:
   - Click "Configure Consent Screen"
   - Choose "External" (unless you have a Google Workspace)
   - Fill in:
     - App name: **Resolve**
     - User support email: Your email
     - Developer contact: Your email
   - Click "Save and Continue" through the rest

### Step 4: Create OAuth Client IDs

You need to create **3 OAuth Client IDs** (one for each platform):

#### For iOS:
1. Application type: **iOS**
2. Bundle ID: Get it from `app.json` (e.g., `com.yourcompany.resolve`)
3. Click "Create"
4. Copy the **Client ID**

#### For Android:
1. Application type: **Android**
2. Package name: Get it from `app.json`
3. SHA-1 certificate fingerprint:
   ```bash
   # For development, get it from Expo:
   expo credentials:manager
   # Or use keytool for production
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey
   # Default password is: android
   ```
4. Click "Create"
5. Copy the **Client ID**

#### For Web (required for Expo):
1. Application type: **Web application**
2. Name: "Resolve Web Client"
3. No need to add authorized URLs for development
4. Click "Create"
5. Copy the **Client ID**

### Step 5: Update LoginScreen.tsx

Replace the placeholder client IDs in `src/screens/LoginScreen.tsx`:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',
  androidClientId: 'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',
});
```

With your actual client IDs:

```typescript
const [request, response, promptAsync] = Google.useAuthRequest({
  iosClientId: '123456789-abc.apps.googleusercontent.com',
  androidClientId: '123456789-xyz.apps.googleusercontent.com',
  webClientId: '123456789-web.apps.googleusercontent.com',
});
```

### Step 6: Test Google Sign-In

1. Make sure Convex is running: `npx convex dev`
2. Start your app: `npx expo start`
3. On the login screen, click **"Continue with Google"**
4. Sign in with your Google account
5. You should be logged in automatically!

## How It Works

1. **Button Click**: User clicks "Continue with Google"
2. **OAuth Flow**: Opens Google sign-in in a browser
3. **User Authenticates**: User logs in with Google account
4. **Get Access Token**: App receives access token
5. **Fetch User Info**: App fetches user's name, email, and Google ID
6. **Create/Update User**: App calls Convex to create or retrieve user
7. **Store Session**: User ID is saved (AsyncStorage or memory fallback)
8. **Logged In**: User sees the home screen

## Troubleshooting

### AsyncStorage Error
✅ **Fixed!** The app now uses in-memory storage as a fallback if AsyncStorage fails. This is common in development environments.

### Google Sign-In Not Working
- Make sure you've replaced the placeholder client IDs
- Verify your OAuth credentials are for the correct app bundle/package
- Check that Google+ API is enabled in your project
- For iOS, ensure bundle ID matches `app.json`
- For Android, ensure SHA-1 fingerprint is correct

### "Invalid Client" Error
- Double-check all three client IDs are correct
- Ensure you're using the right client ID for the platform you're testing on
- Verify OAuth consent screen is configured

### expo-auth-session Issues
If you see warnings about redirect URIs:
```bash
# For Expo Go, this is handled automatically
# For production builds, add to Google Console:
# Authorized redirect URIs: https://auth.expo.io/@your-username/your-app-slug
```

## Testing Without Google OAuth

The app works perfectly without Google OAuth setup! You can still use email/name login:

1. Open the app
2. Enter any name and email
3. Click "Get Started"
4. Start tracking your metrics!

Google OAuth is **optional** - it just provides a more convenient login experience.

## Benefits of Google OAuth

- ✅ No need to remember passwords
- ✅ One-click sign-in
- ✅ Automatically syncs user profile info
- ✅ More secure (managed by Google)
- ✅ Works across all devices with same Google account

## Next Steps

After setting up Google OAuth:
1. Test on all platforms (iOS, Android, Web)
2. Update OAuth consent screen with privacy policy (for production)
3. Add more OAuth providers if desired (Apple, Facebook, etc.)
4. Consider adding profile pictures from Google account

---

Need help? Check the [expo-auth-session docs](https://docs.expo.dev/versions/latest/sdk/auth-session/) or the [Google OAuth documentation](https://developers.google.com/identity/protocols/oauth2).
