// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyCGW6FV6jwKQduHk2wqODC3Ihv6jCyWzV4",
  authDomain: "kirtansamagam-b45b9.firebaseapp.com",
  projectId: "kirtansamagam-b45b9",
  storageBucket: "kirtansamagam-b45b9.firebasestorage.app",
  messagingSenderId: "382581209872",
  appId: "1:382581209872:web:054fb314d6695a54544395"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export Firebase services
export { 
    auth, 
    db, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp
};

export default firebaseConfig;
