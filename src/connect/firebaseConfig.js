import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDwD5SV0TBltwhx1p-fhpwxQVWqboW81Gk",
  projectId: "caketea-f7c95",
  authDomain: "caketea-f7c95.firebaseapp.com",
  storageBucket: "caketea-f7c95.appspot.com",
  messagingSenderId: "641062191147",
  appId: "1:641062191147:android:f0173f67dc9727631faa6e"
};

// Khởi tạo Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các service
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;