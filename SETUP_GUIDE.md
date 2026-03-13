# 🌙 Camila's Sleep Tracker — Setup Guide

This guide walks you through every step to get the app live on the web so you and your husband can both access it in real time from your phones.

---

## Overview of Steps
1. Create a GitHub account
2. Create a Firebase project (your database)
3. Upload the code to GitHub
4. Deploy the app (GitHub Pages — free hosting)
5. Share the link with your husband

**Total time: ~30–45 minutes. No coding experience needed!**

---

## Step 1 — Create a GitHub Account

1. Go to **https://github.com**
2. Click **Sign up**
3. Enter your email, choose a username and password
4. Verify your email address
5. You now have a GitHub account ✅

---

## Step 2 — Create a Firebase Project (Your Database)

Firebase is Google's free real-time database. This is where all of Camila's sleep and feeding data will be stored so both you and your husband see the same thing instantly.

### 2a. Create the project
1. Go to **https://console.firebase.google.com**
2. Sign in with your Google account
3. Click **"Add project"**
4. Name it: `camila-sleep-tracker`
5. Disable Google Analytics (not needed) → Click **"Create project"**
6. Wait for it to set up, then click **"Continue"**

### 2b. Create the Firestore database
1. In the left sidebar, click **"Build"** → **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (allows read/write — you can add security later)
4. Select a location close to you (e.g. `us-east1`) → Click **"Enable"**
5. Your database is ready ✅

### 2c. Get your Firebase config keys
1. Click the ⚙️ **gear icon** next to "Project Overview" → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **`</>`** (Web) icon to add a web app
4. Give it a nickname: `camila-tracker-web` → Click **"Register app"**
5. You'll see a config block like this — **keep this page open**, you'll need it soon:

```js
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "camila-sleep-tracker.firebaseapp.com",
  projectId: "camila-sleep-tracker",
  storageBucket: "camila-sleep-tracker.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

---

## Step 3 — Add Your Firebase Keys to the Code

1. Open the file `src/firebase.js` from the code folder
2. Replace the placeholder values with your actual values from Step 2c:

```js
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",           // ← paste your apiKey
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Save the file.

---

## Step 4 — Upload Code to GitHub

### 4a. Install Node.js (needed to build the app)
1. Go to **https://nodejs.org**
2. Download the **LTS** version and install it
3. Verify: open Terminal (Mac) or Command Prompt (Windows) and type:
   ```
   node --version
   ```
   You should see a version number like `v20.x.x`

### 4b. Create a new GitHub repository
1. Go to **https://github.com** and log in
2. Click the **"+"** in the top right → **"New repository"**
3. Name it: `camila-sleep-tracker`
4. Keep it **Public** (required for free GitHub Pages hosting)
5. Click **"Create repository"**

### 4c. Add deploy settings to package.json
Open `package.json` and add this line at the top (replace `YOUR_GITHUB_USERNAME`):
```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/camila-sleep-tracker",
```

### 4d. Push code to GitHub
Open Terminal/Command Prompt, navigate to your project folder, and run:

```bash
# Install dependencies
npm install

# Initialize git and push to GitHub
git init
git add .
git commit -m "Initial commit — Camila's sleep tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/camila-sleep-tracker.git
git push -u origin main
```

---

## Step 5 — Deploy to GitHub Pages (Free Hosting)

Run this command in your project folder:

```bash
npm run deploy
```

This builds the app and publishes it. After 1–2 minutes, your app will be live at:

```
https://YOUR_GITHUB_USERNAME.github.io/camila-sleep-tracker
```

### Enable GitHub Pages (if not auto-enabled)
1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Branch", select `gh-pages` → Click **Save**

---

## Step 6 — Share With Your Husband

1. Copy your app URL:  
   `https://YOUR_GITHUB_USERNAME.github.io/camila-sleep-tracker`
2. Text it to your husband
3. You're both now looking at the same live database — any entry either of you makes appears instantly for the other ✅

**Tip:** Add it to your phone's home screen!  
- **iPhone**: Open in Safari → tap Share → "Add to Home Screen"  
- **Android**: Open in Chrome → tap ⋮ menu → "Add to Home Screen"

---

## How to Update the App Later

Any time you change the code, run these two commands:

```bash
git add . && git commit -m "Update"
npm run deploy
```

---

## Firestore Security (Optional — Recommended After Setup)

Once everything works, go back to Firebase Console → Firestore → **Rules** and replace the rules with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // Open access — fine for family use
    }
  }
}
```

For stricter security later, you can add Firebase Authentication so only logged-in users can write.

---

## Troubleshooting

| Problem | Solution |
|---|---|
| App shows blank page | Check `firebase.js` — make sure all 6 config values are filled in correctly |
| Data not syncing | Make sure Firestore was created in "test mode" |
| Deploy fails | Run `npm install` first, then try again |
| Page not found after deploy | Wait 2 minutes and refresh |

---

## 🌙 You're all set!

Camila's tracker includes:
- **Nap vs Night sleep** tracking with live timer
- **Mood upon waking** (Happy, Drowsy, Fussy, Calm, Cranky)
- **Bottle feeding log** with amount and time
- **Weekly stats** — nap hours, night hours, feeding chart, mood tally
- **Full history** grouped by day
- **Real-time sync** — you and your husband see the same data instantly

Questions? Reach out anytime!
