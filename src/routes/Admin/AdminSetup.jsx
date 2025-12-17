/**
 * AdminSetup.jsx
 * 
 * Temporary admin setup page accessible at /admin/setup
 * Used to configure admin roles in Firestore.
 * 
 * IMPORTANT: Remove this page in production!
 * 
 * @module routes/Admin/AdminSetup
 */

import { useState } from 'react'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../config/firebase'

export default function AdminSetup() {
    const [email, setEmail] = useState('admin@techspert.com')
    const [password, setPassword] = useState('admin123456')
    const [status, setStatus] = useState('')
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(false)

    const log = (message, type = 'info') => {
        setLogs(prev => [...prev, { message, type, time: new Date().toLocaleTimeString() }])
    }

    const setupAdmin = async () => {
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
                    displayName: 'Super Admin',
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
                    name: 'Super Admin',
                    role: 'super-admin',
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
                log('✅ Created admin document with super-admin role', 'success')
            }

            setStatus('success')
            log('🎉 Admin setup complete! You can now log in.', 'success')
        } catch (error) {
            log(`❌ Error: ${error.message}`, 'error')
            setStatus('error')
        }

        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">Admin Setup</h1>
                    <p className="text-neutral-500 mt-2">Configure admin roles in Firestore</p>
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                        ⚠️ Remove this page in production!
                    </div>
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
                        onClick={setupAdmin}
                        disabled={loading}
                        className="w-full py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Setting up...' : 'Setup Admin Role'}
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
