import { auth, provider, db } from "./firebase-init.js";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  onAuthStateChanged,
  setPersistence,
  browserSessionPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js";

document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("login-form");
  const googleLogin = document.getElementById("googleLogin");
  const loginContainer = document.querySelector(".login-container");
  const loading = document.getElementById("loading");

  // ✅ Legal Agreement Modal Logic
  const legalModal = document.getElementById('legalModal');
  const agreeCheck = document.getElementById('agreeCheck');
  const agreeBtn = document.getElementById('agreeBtn');
  const cancelBtn = document.getElementById('cancelBtn');

  // Check if user is already logged in (don't redirect, just update UI)
  const isFirstLogin = !localStorage.getItem('hasLoggedInBefore');

  // Show modal only on first visit or if not agreed yet
  if (isFirstLogin || !localStorage.getItem('legalAgreed')) {
    legalModal.style.display = 'flex';
  } else {
    legalModal.style.display = 'none';
    loading.style.display = 'block';
  }

  // Enable Proceed button only when checkbox is ticked
  agreeCheck.addEventListener('change', () => {
    agreeBtn.disabled = !agreeCheck.checked;
  });

  // Proceed to login
  agreeBtn.addEventListener('click', () => {
    localStorage.setItem('legalAgreed', 'true');
    legalModal.style.display = 'none';
    loading.style.display = 'block';
    checkAuthState();
  });

  // Cancel and redirect to home
  cancelBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // ✅ Check authentication state (NO AUTO-REDIRECT for existing sessions)
  function checkAuthState() {
    onAuthStateChanged(auth, (user) => {
      loading.style.display = "none";
      loginContainer.style.display = "block";

      if (user) {
        console.log("User logged in:", user.email);
        // Set login state for navbar (but don't redirect for existing sessions)
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('userName', user.displayName || 'User');
        localStorage.setItem('hasLoggedInBefore', 'true');
        
        // Show success message but stay on login page for existing sessions
        showLoginSuccess(user.displayName || user.email);
        
        // Animate the success state
        if (typeof ScrollReveal !== 'undefined') {
          ScrollReveal().reveal(".login-success", {
            duration: 800,
            distance: "20px",
            origin: "bottom",
            easing: "ease-out",
          });
        }
      } else {
        // Show normal login form for non-logged in users
        if (typeof ScrollReveal !== 'undefined') {
          ScrollReveal().reveal(".login-container", {
            duration: 800,
            distance: "20px",
            origin: "bottom",
            easing: "ease-out",
            reset: false,
          });
        }
      }
    });
  }

  // ✅ Show login success message
  function showLoginSuccess(userName) {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
      loginForm.innerHTML = `
        <div class="login-success">
          <div class="success-icon">✅</div>
          <h2>Welcome back, ${userName}!</h2>
          <p>You are successfully logged in.</p>
          <div class="success-actions">
            <a href="destination.html" class="btn-primary">Explore Destinations</a>
            <a href="index.html" class="btn-secondary">Go to Homepage</a>
          </div>
        </div>
      `;
    }
  }

  // ✅ Make session temporary — logs out when browser/tab is closed
  await setPersistence(auth, browserSessionPersistence);

  // ✅ Save user info to Realtime Database
  function saveUserData(user) {
    const userRef = ref(db, "users/" + user.uid);
    set(userRef, {
      uid: user.uid,
      name: user.displayName || "Anonymous",
      email: user.email,
      photoURL: user.photoURL || "default-avatar.png",
      lastLogin: new Date().toISOString(),
    }).then(() => {
      // Set login state for navbar after saving user data
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || 'User');
      localStorage.setItem('hasLoggedInBefore', 'true');
    }).catch((error) => {
      console.error("Database save failed:", error);
      // Still set login state even if database fails
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.displayName || 'User');
      localStorage.setItem('hasLoggedInBefore', 'true');
    });
  }

  // ✅ Email + Password Login - REDIRECT AFTER LOGIN
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please fill in all fields.");
      return;
    }

    loading.style.display = 'block';
    loginContainer.style.opacity = '0.7';

    signInWithEmailAndPassword(auth, email, password)
      .then((result) => {
        saveUserData(result.user);
        // REDIRECT to destination page after successful login
        setTimeout(() => {
          window.location.href = "destination.html";
        }, 1000); // 1 second delay to show success briefly
      })
      .catch((error) => {
        loading.style.display = 'none';
        loginContainer.style.opacity = '1';
        alert("Login failed: " + error.message);
      });
  });

  // ✅ Google Login - REDIRECT AFTER LOGIN
  googleLogin.addEventListener("click", () => {
    loading.style.display = 'block';
    loginContainer.style.opacity = '0.7';

    signInWithPopup(auth, provider)
      .then((result) => {
        saveUserData(result.user);
        // REDIRECT to destination page after successful login
        setTimeout(() => {
          window.location.href = "destination.html";
        }, 1000); // 1 second delay to show success briefly
      })
      .catch((error) => {
        loading.style.display = 'none';
        loginContainer.style.opacity = '1';
        alert("Google login failed: " + error.message);
      });
  });

  // Initialize auth check (if legal already agreed)
  if (localStorage.getItem('legalAgreed')) {
    checkAuthState();
  }
});

// ✅ Global logout function with confirmation
function handleLogout() {
  // Show confirmation dialog
  if (confirm('Are you sure you want to log out?')) {
    // Clear all local storage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    // Sign out from Firebase
    if (auth) {
      signOut(auth).then(() => {
        console.log('User signed out successfully');
        // Redirect to home page
        window.location.href = 'index.html';
      }).catch((error) => {
        console.error('Logout error:', error);
        // Still redirect even if Firebase signout fails
        window.location.href = 'index.html';
      });
    } else {
      // Fallback redirect
      window.location.href = 'index.html';
    }
  }
}