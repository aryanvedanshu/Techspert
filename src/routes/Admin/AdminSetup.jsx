/**
 * AdminSetup.jsx
 * 
 * Admin setup page accessible at /admin/setup
 * Used to configure admin roles in Firestore.
 * PROTECTED: Only accessible when an admin is already logged in
 * 
 * @module routes/Admin/AdminSetup
 */

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../config/firebase'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminSetup() {
    const { isAuthenticated, loading: authLoading } = useAuth()
    const [email, setEmail] = useState('admin@techspert.com')
    const [password, setPassword] = useState('admin123456')
    const [status, setStatus] = useState('')
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState('create') // 'create' or 'update'

    // Wait for auth to be determined
    if (authLoading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        )
    }

    // Require admin to be logged in
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />
    }

    const log = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }])
    }

    const createNewAdmin = async () => {
        setLoading(true)
        setStatus('')
        setLogs([])

        try {
            log('Creating new Firebase Auth user...')
            const userCredential = await createUserWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid
            log(`✅ Created user! UID: ${uid}`, 'success')

            // Create user document
            log('Creating user document...')
            const userDocRef = doc(db, 'users', uid)
            await setDoc(userDocRef, {
                email: email,
                displayName: email.includes('aryan') ? 'Aryan Goel' : 'Super Admin',
                role: 'super-admin',
                isAdmin: true,
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            log('✅ Created user document with super-admin role', 'success')

            // Create admin document
            log('Creating admin document...')
            const adminDocRef = doc(db, 'admins', uid)
            await setDoc(adminDocRef, {
                email: email,
                name: email.includes('aryan') ? 'Aryan Goel' : 'Super Admin',
                displayName: email.includes('aryan') ? 'Aryan Goel' : 'Super Admin',
                role: 'super-admin',
                isActive: true,
                isLocked: false,
                permissions: {
                    courses: { create: true, read: true, update: true, delete: true },
                    projects: { create: true, read: true, update: true, delete: true },
                    alumni: { create: true, read: true, update: true, delete: true },
                    users: { create: true, read: true, update: true, delete: true },
                    admins: { create: true, read: true, update: true, delete: true },
                    settings: { create: true, read: true, update: true, delete: true },
                    enquiries: { create: true, read: true, update: true, delete: true }
                },
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            log('✅ Created admin document with super-admin role', 'success')

            setStatus('success')
            log('🎉 New admin created! You can now log in.', 'success')
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') {
                log('⚠️ User already exists. Try "Update Existing" mode instead.', 'error')
            } else if (error.code === 'auth/weak-password') {
                log('❌ Password is too weak. Use at least 6 characters.', 'error')
            } else {
                log(`❌ Error: ${error.message}`, 'error')
            }
            setStatus('error')
        }

        setLoading(false)
    }

    const updateExistingAdmin = async () => {
        setLoading(true)
        setStatus('')
        setLogs([])

        try {
            log('Signing in with credentials...')
            const userCredential = await signInWithEmailAndPassword(auth, email, password)
            const uid = userCredential.user.uid
            log(`✅ Signed in! UID: ${uid}`, 'success')

            // Update users collection
            log('Checking users collection...')
            const userDocRef = doc(db, 'users', uid)
            const userDocSnap = await getDoc(userDocRef)

            if (userDocSnap.exists()) {
                log('Found existing user document, updating role...')
                await setDoc(userDocRef, {
                    ...userDocSnap.data(),
                    role: 'super-admin',
                    isAdmin: true,
                    updatedAt: new Date(),
                }, { merge: true })
                log('✅ Updated role to super-admin in users collection', 'success')
            } else {
                log('Creating new user document...')
                await setDoc(userDocRef, {
                    email: email,
                    displayName: email.includes('aryan') ? 'Aryan Goel' : 'Super Admin',
                    role: 'super-admin',
                    isAdmin: true,
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                log('✅ Created user document with super-admin role', 'success')
            }

            // Update admins collection
            log('Checking admins collection...')
            const adminDocRef = doc(db, 'admins', uid)
            const adminDocSnap = await getDoc(adminDocRef)

            if (adminDocSnap.exists()) {
                log('Found existing admin document, updating role...')
                await setDoc(adminDocRef, {
                    ...adminDocSnap.data(),
                    role: 'super-admin',
                    updatedAt: new Date(),
                }, { merge: true })
                log('✅ Updated role to super-admin in admins collection', 'success')
            } else {
                log('Creating new admin document...')
                await setDoc(adminDocRef, {
                    email: email,
                    name: email.includes('aryan') ? 'Aryan Goel' : 'Super Admin',
                    displayName: email.includes('aryan') ? 'Aryan Goel' : 'Super Admin',
                    role: 'super-admin',
                    isActive: true,
                    isLocked: false,
                    permissions: {
                        courses: { create: true, read: true, update: true, delete: true },
                        projects: { create: true, read: true, update: true, delete: true },
                        alumni: { create: true, read: true, update: true, delete: true },
                        users: { create: true, read: true, update: true, delete: true },
                        admins: { create: true, read: true, update: true, delete: true },
                        settings: { create: true, read: true, update: true, delete: true },
                        enquiries: { create: true, read: true, update: true, delete: true }
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                log('✅ Created admin document with super-admin role', 'success')
            }

            setStatus('success')
            log('🎉 Admin setup complete! You can now log in.', 'success')
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                log('⚠️ User does not exist. Try "Create New" mode instead.', 'error')
            } else if (error.code === 'auth/wrong-password') {
                log('❌ Wrong password. Please check your credentials.', 'error')
            } else if (error.code === 'auth/invalid-credential') {
                log('⚠️ Invalid credentials. User may not exist. Try "Create New" mode.', 'error')
            } else {
                log(`❌ Error: ${error.message}`, 'error')
            }
            setStatus('error')
        }

        setLoading(false)
    }

    const handleSubmit = () => {
        if (mode === 'create') {
            createNewAdmin()
        } else {
            updateExistingAdmin()
        }
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Admin Setup</h1>
                    <p className="text-neutral-500 mt-2">Create or configure admin users</p>
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                        ⚠️ Remove this page in production!
                    </div>
                </div>

                {/* Quick Setup Presets */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-3">Quick Setup Presets:</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => {
                                setEmail('admin@techspert.com')
                                setPassword('admin123456')
                                setMode('update')
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-white border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            Default Admin (Existing)
                        </button>
                        <button
                            onClick={() => {
                                setEmail('aryangoel299@gmail.com')
                                setPassword('Man@12345H')
                                setMode('create')
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Aryan (Create New)
                        </button>
                    </div>
                </div>

                {/* Mode Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Mode</label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setMode('create')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${mode === 'create'
                                ? 'bg-green-600 text-white'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                        >
                            🆕 Create New User
                        </button>
                        <button
                            onClick={() => setMode('update')}
                            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors ${mode === 'update'
                                ? 'bg-blue-600 text-white'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                        >
                            🔄 Update Existing
                        </button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">
                        {mode === 'create'
                            ? 'Creates a new Firebase Auth user and Firestore documents'
                            : 'Signs in existing user and updates their admin role'
                        }
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className={`w-full py-3 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'create'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading
                            ? 'Processing...'
                            : mode === 'create'
                                ? '🆕 Create New Admin'
                                : '🔄 Update Admin Role'
                        }
                    </button>
                </div>

                {logs.length > 0 && (
                    <div className="mt-6 p-4 bg-neutral-900 rounded-lg max-h-64 overflow-y-auto">
                        <pre className="text-xs font-mono">
                            {logs.map((log, i) => (
                                <div
                                    key={i}
                                    className={
                                        log.type === 'success' ? 'text-green-400' :
                                            log.type === 'error' ? 'text-red-400' :
                                                'text-neutral-300'
                                    }
                                >
                                    [{log.time}] {log.message}
                                </div>
                            ))}
                        </pre>
                    </div>
                )}

                {status === 'success' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 text-center">
                        ✅ Setup complete! <a href="/admin/login" className="underline font-medium">Go to Login</a>
                    </div>
                )}
            </div>
        </div>
    )
}
