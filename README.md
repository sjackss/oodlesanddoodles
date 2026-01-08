# Oodles & Doodles - Gay Dating Platform

**Gay dating without the bullshit.** Ad-free, queer-run, respectful connections.

## 🚀 DEPLOYED FILES (as of now)

✅ **index.html** - Landing page with AU$88.86 yearly pricing and first-1000 member offer  
✅ **auth.html** - Firebase Auth sign up/login page  
⚠️ **app.html** - Needs Firebase config update  
⚠️ **profile.html** - Exists but needs Firebase config update  

## ⏰ 24-HOUR DEADLINE STATUS

**Current time:** 11 PM AEST, Jan 8, 2026  
**Deadline:** Tonight/tomorrow morning  

**What's LIVE:** oodlesanddoodles.app will show updated index.html + auth.html within 1-2 minutes  
**What's NOT working yet:** Firebase integration (no config), Stripe checkout

---

## 🔥 CRITICAL: Firebase Setup (DO THIS FIRST)

### Step 1: Create Firebase Project
1. Go to https://firebase.google.com
2. Click "Get started" → "Add project"  
3. Name: `oodlesanddoodles` or similar  
4. Disable Google Analytics (optional for speed)  
5. Click "Create project"

### Step 2: Enable Firebase Auth
1. In Firebase Console, click "Authentication"  
2. Click "Get started"  
3. Click "Email/Password" → Enable it → Save

### Step 3: Enable Firestore Database
1. In Firebase Console, click "Firestore Database"  
2. Click "Create database"  
3. Choose "Start in **test mode**" (you'll lock it down later)  
4. Choose region closest to Australia (e.g., `australia-southeast1`)  
5. Click "Enable"

### Step 4: Get Firebase Config
1. In Firebase Console, click the gear icon ⚙️ (Project settings)  
2. Scroll down to "Your apps"  
3. Click "</>" (Web) icon  
4. Register app name: "oodlesanddoodles"  
5. **DO NOT** check "Firebase Hosting"  
6. Click "Register app"  
7. Copy the `firebaseConfig` object (looks like this):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### Step 5: Update Firebase Config in ALL files
You need to replace `firebaseConfig` in these 3 files:
- `auth.html` (line ~140)  
- `profile.html` (line ~115)  
- `app.html` (line ~120)  

**How to update:**
1. Go to https://github.com/sjackss/oodlesanddoodles/edit/main/auth.html  
2. Find the section with `YOUR_API_KEY`, `YOUR_PROJECT.firebaseapp.com`, etc.  
3. Replace with your REAL Firebase config values  
4. Click "Commit changes"  
5. Repeat for profile.html and app.html

---

## 💳 Stripe Setup (DO THIS SECOND)

### Step 1: Create Stripe Products
1. Go to https://dashboard.stripe.com  
2. Navigate to "Products" → "Add product"  
3. Create product: **"Oodles & Doodles Yearly Membership"**  
   - Price: AU$88.86  
   - Billing period: Yearly  
   - **Save the Price ID**

### Step 2: Create Price with 60-day Trial
1. In the same product, click "Add another price"  
2. Set up:  
   - Price: AU$88.86/year  
   - Trial period: 60 days  
   - **Save this Price ID** (this is for first 1,000 users)

### Step 3: Get Stripe Checkout URLs
1. Go to "Payment links" or use Stripe Checkout  
2. Create checkout session for:  
   - **Price A** (with 60-day trial) - for users 1-1000  
   - **Price B** (no trial) - for users 1001+  
3. Note both URLs

### Step 4: Update index.html
- Replace the placeholder "Connect Firebase + Stripe" in index.html with real Stripe checkout URL

---

## 📊 Data Model (Firestore Collections)

When Firebase is set up, these collections will auto-create:

### `users` collection
Each user document (ID = Firebase UID):
```javascript
{
  email: "user@example.com",
  displayName: "John",
  age: 28,
  city: "Brisbane",
  country: "Australia",
  bio: "Looking for something real",
  photoUrl: "",
  subscriptionStatus: "none" | "trialing" | "active",
  isFoundingMember: false,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### `stats` collection
Document ID: `subscriptions`
```javascript
{
  paidUserCount: 0  // Increment when user subscribes
}
```

---

## 🎯 NEXT STEPS TO GO LIVE

### Priority 1 (Must do tonight):
- [ ] Set up Firebase project  
- [ ] Get Firebase config  
- [ ] Update auth.html with Firebase config  
- [ ] Test sign up flow: visit oodlesanddoodles.app → click "Sign up / Log in" → create account  

### Priority 2 (If time permits):
- [ ] Update app.html and profile.html with Firebase config  
- [ ] Set up Stripe products  
- [ ] Test full flow: sign up → create profile → browse users → subscribe  

### Priority 3 (Post-launch):
- Implement 1:1 messaging  
- Add photo upload (Firebase Storage)  
- Add "first 1,000" counter logic  
- Add Firestore security rules  

---

## 🔒 Security Rules (Add Later)

Once working, update Firestore rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🌐 Netlify Auto-Deploy

Your repo is connected to Netlify. Every GitHub commit auto-deploys to **oodlesanddoodles.app** within 1-2 minutes.

**Check deploy status:** https://app.netlify.com  

---

## 🆘 Troubleshooting

**Auth not working?**  
→ Check Firebase config is copy-pasted correctly (no spaces, commas correct)

**"No users found" in app.html?**  
→ Users collection is empty. Sign up 2-3 test accounts first.

**Site not updating?**  
→ Wait 2 minutes for Netlify deploy, then hard-refresh (Ctrl+Shift+R)

---

## 📞 Emergency Contacts

- **Firebase Console:** https://console.firebase.google.com  
- **Stripe Dashboard:** https://dashboard.stripe.com  
- **Netlify Dashboard:** https://app.netlify.com  
- **GitHub Repo:** https://github.com/sjackss/oodlesanddoodles  

---

**Good luck with the launch! 🚀 You've got this.**

<!-- Trigger deploy -->
