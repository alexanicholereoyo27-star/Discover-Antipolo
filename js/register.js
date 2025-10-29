import { auth, provider, db } from "./firebase-init.js";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
  ref,
  set,
  get,
  child
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const googleRegister = document.getElementById("googleRegister");

  // ✅ Save user info to Realtime Database (only if not existing)
  async function saveUserData(user) {
    try {
      const dbRef = ref(db);
      const snapshot = await get(child(dbRef, "users/" + user.uid));

      if (!snapshot.exists()) {
        await set(ref(db, "users/" + user.uid), {
          uid: user.uid,
          name: user.displayName || document.getElementById("name")?.value.trim() || "Anonymous",
          email: user.email,
          photoURL: user.photoURL || "default-avatar.png",
          createdAt: new Date().toISOString(),
        });
        console.log("✅ User added to Realtime Database");
      } else {
        console.log("ℹ️ User already exists in database");
      }
    } catch (error) {
      console.error("❌ Failed to save user data:", error);
    }
  }

  // ✅ Normal Email/Password Registration
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      await saveUserData(result.user);
      alert("🎉 Registration successful! Redirecting...");
      window.location.href = "destination.html";
    } catch (error) {
      alert("❌ Registration failed: " + error.message);
    }
  });

  // ✅ Google Sign-Up
  googleRegister.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserData(result.user);
      alert("🎉 Welcome, " + result.user.displayName + "!");
      window.location.href = "destination.html";
    } catch (error) {
      alert("❌ Google sign-up failed: " + error.message);
    }
  });
});
