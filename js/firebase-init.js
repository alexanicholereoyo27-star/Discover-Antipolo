// js/firebase-init.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";

// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9NfWr49Q0BKvVo8cGs_IZGvzWYAuCVKw",
  authDomain: "discoverantipolo.firebaseapp.com",
  databaseURL: "https://discoverantipolo-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "discoverantipolo",
  storageBucket: "discoverantipolo.firebasestorage.app",
  messagingSenderId: "49102168673",
  appId: "1:49102168673:web:a65f8f4c5fed1e594ac020",
  measurementId: "G-J5GD63LQQ0"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);
const storage = getStorage(app);

export { app, auth, provider, db, storage };
