import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Config pública de Firebase (va en el cliente; no es secreta).
const firebaseConfig = {
  apiKey: 'AIzaSyBv0lJE4Lfx9Loql4bU5Y0xYMVYkDfil4w',
  authDomain: 'dahia-app.firebaseapp.com',
  projectId: 'dahia-app',
  storageBucket: 'dahia-app.firebasestorage.app',
  messagingSenderId: '990861850151',
  appId: '1:990861850151:web:9994f728fcf355dbe1c002',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
