# Firebase Cloud Functions Email Setup

## Step 1: Upgrade to Blaze Plan

Firebase Cloud Functions require the **Blaze (pay-as-you-go)** plan to make outbound network requests.

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Settings** → **Usage and billing**
4. Click **Modify plan** → Select **Blaze**

> Note: Blaze has a generous free tier. You won't be charged unless you exceed free limits.

---

## Step 2: Initialize Firebase Functions

Open a terminal in your project root (parent of `client` folder):

```bash
cd "c:\Users\aryan\OneDrive\Desktop\project to work\techspert"
firebase init functions
```

When prompted:
- Use existing project: Yes
- Language: **JavaScript**
- ESLint: No (or Yes if you want)
- Install dependencies: Yes

---

## Step 3: Copy Function Code

After initialization, copy the contents of `functions_code/index.js` (created below) to:
```
techspert/functions/index.js
```

---

## Step 4: Create Gmail App Password

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already
3. Go to **App passwords** (search for it)
4. Select **Mail** and **Windows Computer**
5. Click **Generate**
6. Copy the 16-character password

---

## Step 5: Set Firebase Environment Variables

```bash
firebase functions:config:set gmail.email="aryangoel299@gmail.com" gmail.password="YOUR_APP_PASSWORD_HERE"
```

---

## Step 6: Install Dependencies

```bash
cd functions
npm install nodemailer
```

---

## Step 7: Deploy Functions

```bash
firebase deploy --only functions
```

---

## How It Works

1. User submits demo registration → Document created in `demoSignups` collection
2. Cloud Function triggers automatically
3. Email sent to user with demo details
4. Same for enquiries in `enquiries` collection

---

## Testing

1. Submit a demo registration on your website
2. Check the Firebase Functions logs:
   ```bash
   firebase functions:log
   ```
3. Check if email was received
