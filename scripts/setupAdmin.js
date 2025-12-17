/**
 * setupAdmin.js
 * 
 * Script to set up an admin user in Firestore.
 * Run this once to create the initial admin account.
 * 
 * Usage: node scripts/setupAdmin.js
 */

import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// Firebase config - update with your project's config
const firebaseConfig = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
};

// Admin credentials
const ADMIN_EMAIL = 'admin@techspert.com';
const ADMIN_PASSWORD = 'admin123456';
const ADMIN_NAME = 'Super Admin';

async function setupAdmin() {
    console.log('🚀 Setting up admin user...\n');

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    try {
        // Try to sign in first to get the UID
        console.log(`📧 Signing in as ${ADMIN_EMAIL}...`);
        const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
        const uid = userCredential.user.uid;
        console.log(`✅ Signed in successfully. UID: ${uid}\n`);

        // Check if user exists in 'users' collection
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log(`📄 Found in 'users' collection. Current role: ${userData.role || 'none'}`);

            // Update role to super-admin
            await setDoc(userDocRef, {
                ...userData,
                role: 'super-admin',
                isAdmin: true,
                updatedAt: new Date(),
            }, { merge: true });
            console.log(`✅ Updated role to 'super-admin' in 'users' collection.\n`);
        } else {
            // Create user document
            console.log(`📄 User not found in 'users' collection. Creating...`);
            await setDoc(userDocRef, {
                email: ADMIN_EMAIL,
                displayName: ADMIN_NAME,
                role: 'super-admin',
                isAdmin: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`✅ Created user document with 'super-admin' role.\n`);
        }

        // Also create/update in 'admins' collection for legacy support
        const adminDocRef = doc(db, 'admins', uid);
        const adminDocSnap = await getDoc(adminDocRef);

        if (adminDocSnap.exists()) {
            console.log(`📄 Found in 'admins' collection.`);
            await setDoc(adminDocRef, {
                ...adminDocSnap.data(),
                role: 'super-admin',
                updatedAt: new Date(),
            }, { merge: true });
            console.log(`✅ Updated role to 'super-admin' in 'admins' collection.\n`);
        } else {
            console.log(`📄 User not found in 'admins' collection. Creating...`);
            await setDoc(adminDocRef, {
                email: ADMIN_EMAIL,
                name: ADMIN_NAME,
                role: 'super-admin',
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            console.log(`✅ Created admin document with 'super-admin' role.\n`);
        }

        console.log('🎉 Admin setup complete!');
        console.log(`\n📝 You can now log in at /admin/login with:`);
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}\n`);

    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log(`❌ User ${ADMIN_EMAIL} not found in Firebase Auth.`);
            console.log(`\nCreating new admin user...`);

            try {
                const newUser = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
                const uid = newUser.user.uid;
                console.log(`✅ Created Firebase Auth user. UID: ${uid}\n`);

                // Create in both collections
                await setDoc(doc(db, 'users', uid), {
                    email: ADMIN_EMAIL,
                    displayName: ADMIN_NAME,
                    role: 'super-admin',
                    isAdmin: true,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                await setDoc(doc(db, 'admins', uid), {
                    email: ADMIN_EMAIL,
                    name: ADMIN_NAME,
                    role: 'super-admin',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                console.log('🎉 Admin user created successfully!');
                console.log(`\n📝 You can now log in at /admin/login with:`);
                console.log(`   Email: ${ADMIN_EMAIL}`);
                console.log(`   Password: ${ADMIN_PASSWORD}\n`);
            } catch (createError) {
                console.error('❌ Failed to create user:', createError.message);
            }
        } else {
            console.error('❌ Error:', error.message);
        }
    }

    process.exit(0);
}

setupAdmin();
