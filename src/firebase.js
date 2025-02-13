import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAxqpitI_HnJ9dP-srulLl9G2RfN-y4NG0",
  authDomain: "evrad-takip.firebaseapp.com",
  projectId: "evrad-takip",
  storageBucket: "evrad-takip.firebasestorage.app",
  messagingSenderId: "118092782634",
  appId: "1:118092782634:web:c9448ee4972a716691f753",
  measurementId: "G-SHET7NSYKH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Yeni koleksiyonlar için referanslar
export const adminsRef = collection(db, 'admins');
export const evradlarRef = collection(db, 'evradlar');

// Süper admin kontrolü
export const isSuperAdmin = async (uid) => {
  const userDoc = await getDoc(doc(db, 'admins', uid));
  return userDoc.exists() && userDoc.data().role === 'superadmin';
};

// Admin kontrolü
export const isAdmin = async (uid) => {
  const userDoc = await getDoc(doc(db, 'admins', uid));
  return userDoc.exists();
};