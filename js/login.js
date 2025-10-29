import { auth, provider, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("login-form");
  const googleLogin = document.getElementById("googleLogin");
  const loginContainer = document.querySelector(".login-container");
  const loading = document.getElementById("loading");

  // Hide login form while Firebase checks
  loginContainer.style.display = "none";
  loading.style.display = "block";

  // ✅ Make session temporary — logs out when browser/tab is closed
  await setPersistence(auth, browserSessionPersistence);

  // ✅ Handle authentication state safely
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("User logged in:", user.email);
      window.location.href = "destination.html";
    } else {
      loading.style.display = "none";
      loginContainer.style.display = "block";

      // Animate the form only after it's shown
      ScrollReveal().reveal(".login-container", {
        duration: 800,
        distance: "20px",
        origin: "bottom",
        easing: "ease-out",
        reset: false,
      });
    }
  });

  // ✅ Save user info to Realtime Database
  function saveUserData(user) {
    const userRef = ref(db, "users/" + user.uid);
    set(userRef, {
      uid: user.uid,
      name: user.displayName || "Anonymous",
      email: user.email,
      photoURL: user.photoURL || "default-avatar.png",
      lastLogin: new Date().toISOString(),
    });
  }

  // ✅ Email + Password Login
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        saveUserData(result.user);
        window.location.href = "destination.html";
      })
      .catch((error) => {
        alert("Login failed: " + error.message);
      });
  });

  // ✅ Google Login
  googleLogin.addEventListener("click", () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        saveUserData(result.user);
        window.location.href = "destination.html";
      })
      .catch((error) => {
        alert("Google login failed: " + error.message);
      });
  });
});
