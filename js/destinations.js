// =======================================================
// 🌟 DestinationInteractions - FIXED for Firebase Auth & Database
// =======================================================
class DestinationInteractions {
  constructor() {
    this.db = null;
    this.currentUser = null;
    this.initializeFirebase();
    this.initEverything();
  }

  // 🔥 Firebase Initialization
  initializeFirebase() {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyD9NfWr49Q0BKvVo8cGs_IZGvzWYAuCVKw",
        authDomain: "discoverantipolo.firebaseapp.com",
        databaseURL: "https://discoverantipolo-default-rtdb.asia-southeast1.firebasedatabase.app/",
        projectId: "discoverantipolo",
        storageBucket: "discoverantipolo.firebasestorage.app",
        messagingSenderId: "49102168673",
        appId: "1:49102168673:web:a65f8f4c5fed1e594ac020"
      };
      
      if (typeof firebase !== 'undefined') {
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        this.db = firebase.database();
        console.log("✅ Firebase initialized successfully");
      } else {
        console.error("❌ Firebase not loaded");
      }
    } catch (error) {
      console.error("❌ Firebase initialization error:", error);
    }
  }

  // 🚀 Initialize everything
  initEverything() {
    console.log("🚀 Initializing destination interactions...");
    
    // Find user from Firebase Auth
    this.getUserFromFirebaseAuth();
    
    // Initialize features
    this.initRatings();
    this.initComments();
    this.toggleHospitalInfo();
    this.fixImages();
    this.updateUI();
    
    console.log("🎯 Ready! User:", this.currentUser?.name || "Not logged in");
  }

  // 👤 Get user from Firebase Authentication - ENHANCED VERSION
  getUserFromFirebaseAuth() {
    console.log("🔍 Getting user from Firebase Auth...");
    
    // Method 1: Direct Firebase Auth check
    if (typeof firebase !== 'undefined' && firebase.auth) {
      try {
        const auth = firebase.auth();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
          console.log("✅ Firebase Auth currentUser:", currentUser);
          this.currentUser = {
            id: currentUser.uid,
            name: currentUser.displayName || currentUser.email.split('@')[0] || 'User',
            email: currentUser.email,
            isGuest: false
          };
          this.updateUI();
          return;
        }
      } catch (error) {
        console.log("❌ Firebase Auth error:", error);
      }
    }
    
    // Method 2: Parse from sessionStorage (your case)
    this.getUserFromSessionStorage();
    
    // Method 3: Set up auth state listener for future changes
    this.setupAuthListener();
  }

  // 📁 Get user from sessionStorage (where Firebase stores it)
  getUserFromSessionStorage() {
    console.log("🔍 Checking sessionStorage for Firebase user...");
    
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      
      // Look for Firebase auth user keys
      if (key && key.startsWith('firebase:authUser:')) {
        try {
          const value = sessionStorage.getItem(key);
          console.log("📦 Found Firebase auth user:", key);
          
          const authData = JSON.parse(value);
          if (authData && authData.uid) {
            console.log("✅ Firebase user data:", authData);
            
            this.currentUser = {
              id: authData.uid,
              name: authData.displayName || (authData.email ? authData.email.split('@')[0] : 'User'),
              email: authData.email || '',
              isGuest: false
            };
            
            console.log("🎯 Extracted user:", this.currentUser);
            this.updateUI();
            return;
          }
        } catch (error) {
          console.log("❌ Error parsing Firebase auth data:", error);
        }
      }
    }
    
    console.log("❌ No Firebase user found in sessionStorage");
    this.currentUser = null;
    this.updateUI();
  }

  // 🔊 Listen for auth state changes
  setupAuthListener() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          console.log("🎯 Auth state changed - User signed in:", user);
          this.currentUser = {
            id: user.uid,
            name: user.displayName || user.email.split('@')[0] || 'User',
            email: user.email,
            isGuest: false
          };
          this.updateUI();
        } else {
          console.log("🎯 Auth state changed - User signed out");
          this.currentUser = null;
          this.updateUI();
        }
      });
    }
  }

  // ✅ Simple login check
  isLoggedIn() {
    const loggedIn = this.currentUser && this.currentUser.name && this.currentUser.name !== 'Guest';
    console.log("🔐 Login check:", loggedIn, "User:", this.currentUser?.name);
    return loggedIn;
  }

  // 🎨 Update UI
  updateUI() {
    const loggedIn = this.isLoggedIn();
    console.log("🎨 UI Update - Logged in:", loggedIn, "User:", this.currentUser?.name);
    
    // Update comment areas
    document.querySelectorAll('.comment-input').forEach(textarea => {
      if (loggedIn) {
        textarea.placeholder = `Share your experience... (as ${this.currentUser.name})`;
        textarea.disabled = false;
      } else {
        textarea.placeholder = "Please login to comment...";
        textarea.disabled = true;
      }
    });
    
    // Update buttons
    document.querySelectorAll('.post-spot-comment').forEach(btn => {
      if (loggedIn) {
        btn.disabled = false;
        btn.textContent = "Post Comment";
        btn.style.opacity = '1';
        btn.style.cursor = 'pointer';
      } else {
        btn.disabled = true;
        btn.textContent = "Please Login to Comment";
        btn.style.opacity = '0.6';
        btn.style.cursor = 'not-allowed';
      }
    });
    
    // Update stars
    document.querySelectorAll('.star').forEach(star => {
      if (loggedIn) {
        star.style.cursor = 'pointer';
        star.style.opacity = '1';
      } else {
        star.style.cursor = 'not-allowed';
        star.style.opacity = '0.6';
      }
    });
  }

  // 🖼️ Fix images
  fixImages() {
    setTimeout(() => {
      document.querySelectorAll('img').forEach(img => {
        if (!img.complete || img.naturalHeight === 0) {
          const src = img.src.split('?')[0];
          img.src = src + '?t=' + Date.now();
        }
      });
    }, 100);
  }

  // ⭐ Ratings
initRatings() {
  document.querySelectorAll('.stars').forEach(group => {
    const stars = group.querySelectorAll('.star');
    const result = group.parentElement.querySelector('.rating-result');
    const itemName = group.closest('.spot-section').querySelector('h2').textContent.trim();

    // ✅ Load ratings immediately on page load
    this.loadRatings(itemName, group.parentElement);

    stars.forEach(star => {
      star.addEventListener('click', () => {
        console.log("⭐ Star clicked by:", this.currentUser?.name);
        
        if (!this.isLoggedIn()) {
          alert("Please login first!");
          return;
        }

        const val = star.dataset.value;
        console.log(`⭐ ${this.currentUser.name} rating: ${val} stars`);
        
        // Update UI immediately
        stars.forEach(s => s.classList.remove('active'));
        for (let i = 0; i < val; i++) stars[i].classList.add('active');
        result.textContent = `You rated this ${val} ★`;

        // ✅ Pass the correct parent section to saveRating()
        this.saveRating(itemName, val, group.parentElement);
      });
    });
  });
}

async saveRating(itemName, rating, ratingSection) {
  if (!this.db || !this.isLoggedIn()) {
    console.error("❌ Cannot save rating - no DB or not logged in");
    return;
  }

  try {
    const sanitizedKey = this.sanitizeKey(itemName);
    const userRatingRef = this.db.ref(`ratings/spots/${sanitizedKey}/userRatings/${this.currentUser.id}`);
    
    await userRatingRef.set({
      value: parseInt(rating),
      timestamp: Date.now(),
      itemName: itemName,
      userName: this.currentUser.name,
      userEmail: this.currentUser.email || 'no-email',
      userId: this.currentUser.id
    });
    
    console.log("✅ Rating saved successfully");
    // ✅ Refresh only this spot's rating
    this.loadRatings(itemName, ratingSection);
  } catch (error) {
    console.error("❌ Rating save error:", error);
  }
}

loadRatings(itemName, ratingSection) {
  if (!this.db) return;

  const sanitizedKey = this.sanitizeKey(itemName);
  const ratingsRef = this.db.ref(`ratings/spots/${sanitizedKey}/userRatings`);
  
  ratingsRef.on('value', (snapshot) => {
    const ratings = snapshot.val();
    let total = 0, count = 0;

    if (ratings) {
      Object.values(ratings).forEach(rating => {
        total += rating.value;
        count++;
      });

      const average = count > 0 ? (total / count).toFixed(1) : 0;
      
      let ratingStats = ratingSection.querySelector('.rating-stats');
      if (!ratingStats) {
        ratingStats = document.createElement('div');
        ratingStats.className = 'rating-stats';
        ratingSection.appendChild(ratingStats);
      }
      
      ratingStats.innerHTML = `<strong>${average} ★</strong> (${count} ratings)`;

      if (this.currentUser && ratings[this.currentUser.id]) {
        const userRating = ratings[this.currentUser.id].value;
        const result = ratingSection.querySelector('.rating-result');
        if (result) {
          result.textContent = `You rated this ${userRating} ★`;
        }

        const stars = ratingSection.querySelectorAll('.star');
        stars.forEach(s => s.classList.remove('active'));
        for (let i = 0; i < userRating; i++) stars[i].classList.add('active');
      }
    } else {
      const ratingStats = ratingSection.querySelector('.rating-stats');
      if (ratingStats) ratingStats.innerHTML = `<strong>0 ★</strong> (0 ratings)`;
    }
  });
}

// 🚫 Old rating functions below are now replaced

  initRatings() {
    document.querySelectorAll('.stars').forEach(group => {
      const stars = group.querySelectorAll('.star');
      const result = group.parentElement.querySelector('.rating-result');
      const itemName = group.closest('.spot-section').querySelector('h2').textContent.trim();

      this.loadRatings(itemName, group.parentElement);

      stars.forEach(star => {
        star.addEventListener('click', () => {
          console.log("⭐ Star clicked by:", this.currentUser?.name);
          
          if (!this.isLoggedIn()) {
            alert("Please login first! If you just logged in, try refreshing the page.");
            return;
          }

          const val = star.dataset.value;
          console.log(`⭐ ${this.currentUser.name} rating: ${val} stars`);
          
          // Visual feedback
          stars.forEach(s => s.classList.remove('active'));
          for (let i = 0; i < val; i++) stars[i].classList.add('active');
          result.textContent = `You rated this ${val} ★`;

          this.saveRating(itemName, val);
        });
      });
    });
  }

  // 💾 Save rating
  async saveRating(itemName, rating) {
    if (!this.db || !this.isLoggedIn()) {
      console.error("❌ Cannot save rating - no DB or not logged in");
      return;
    }

    try {
      const sanitizedKey = this.sanitizeKey(itemName);
      const userRatingRef = this.db.ref(`ratings/spots/${sanitizedKey}/userRatings/${this.currentUser.id}`);
      
      await userRatingRef.set({
        value: parseInt(rating),
        timestamp: Date.now(),
        itemName: itemName,
        userName: this.currentUser.name,
        userEmail: this.currentUser.email || 'no-email',
        userId: this.currentUser.id
      });
      
      console.log("✅ Rating saved successfully");
      this.loadRatings(itemName, document.querySelector('.stars').parentElement);
    } catch (error) {
      console.error("❌ Rating save error:", error);
    }
  }

  // 📊 Load ratings
  loadRatings(itemName, ratingSection) {
    if (!this.db) return;

    const sanitizedKey = this.sanitizeKey(itemName);
    const ratingsRef = this.db.ref(`ratings/spots/${sanitizedKey}/userRatings`);
    
    ratingsRef.on('value', (snapshot) => {
      const ratings = snapshot.val();
      let total = 0, count = 0;

      if (ratings) {
        Object.values(ratings).forEach(rating => {
          total += rating.value;
          count++;
        });

        const average = count > 0 ? (total / count).toFixed(1) : 0;
        
        let ratingStats = ratingSection.querySelector('.rating-stats');
        if (!ratingStats) {
          ratingStats = document.createElement('div');
          ratingStats.className = 'rating-stats';
          ratingSection.appendChild(ratingStats);
        }
        
        ratingStats.innerHTML = `<strong>${average} ★</strong> (${count} ratings)`;
        
        // Update current user's rating if exists
        if (this.currentUser && ratings[this.currentUser.id]) {
          const userRating = ratings[this.currentUser.id].value;
          const result = ratingSection.querySelector('.rating-result');
          if (result) {
            result.textContent = `You rated this ${userRating} ★`;
          }
          
          // Update star display
          const stars = ratingSection.querySelectorAll('.star');
          stars.forEach(s => s.classList.remove('active'));
          for (let i = 0; i < userRating; i++) stars[i].classList.add('active');
        }
      }
    });
  }

  // 💬 Comments - ENHANCED VERSION
  initComments() {
    document.querySelectorAll('.post-spot-comment').forEach(btn => {
      btn.addEventListener('click', () => {
        console.log("💬 Comment button clicked by:", this.currentUser?.name);
        
        if (!this.isLoggedIn()) {
          alert("Please login first! If you just logged in, try refreshing the page.");
          return;
        }

        const textarea = btn.previousElementSibling;
        const list = btn.nextElementSibling;
        const itemName = btn.closest('.spot-section').querySelector('h2').textContent.trim();
        const text = textarea.value.trim();
        
        if (text) {
          console.log(`💬 ${this.currentUser.name} commenting: ${text}`);
          
          // Add comment immediately for better UX
          const div = document.createElement('div');
          div.className = 'comment-item';
          div.innerHTML = `
            <div class="comment-header">
              <strong>${this.currentUser.name}</strong>
              <span class="comment-time">just now</span>
            </div>
            <div class="comment-text">${text}</div>
          `;
          list.appendChild(div);
          
          // Save to Firebase
          this.saveComment(itemName, text);
          textarea.value = '';
          
          // Scroll to show new comment
          div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          alert('Please enter a comment!');
        }
      });
    });

    // Load comments for all sections
    document.querySelectorAll('.spot-section').forEach(section => {
      const itemName = section.querySelector('h2').textContent.trim();
      const commentsList = section.querySelector('.spot-comments');
      if (commentsList) {
        this.loadComments(itemName, commentsList);
      }
    });
  }

  // 💾 Save comment - ENHANCED VERSION
  async saveComment(itemName, comment) {
    if (!this.db || !this.isLoggedIn()) {
      console.error("❌ Cannot save comment - no DB or not logged in");
      return;
    }

    try {
      const sanitizedKey = this.sanitizeKey(itemName);
      const commentsRef = this.db.ref(`comments/spots/${sanitizedKey}`).push();
      
      const commentData = {
        text: comment,
        timestamp: Date.now(),
        itemName: itemName,
        userName: this.currentUser.name,
        userEmail: this.currentUser.email || 'no-email',
        userId: this.currentUser.id
      };
      
      await commentsRef.set(commentData);
      
      console.log("✅ Comment saved successfully:", commentData);
    } catch (error) {
      console.error("❌ Comment save error:", error);
      alert("Error saving comment. Please try again.");
    }
  }

  // 📝 Load comments - ENHANCED VERSION
  loadComments(itemName, commentsList) {
    if (!this.db) {
      console.log("❌ Firebase not available for loading comments");
      return;
    }

    const sanitizedKey = this.sanitizeKey(itemName);
    const commentsRef = this.db.ref(`comments/spots/${sanitizedKey}`);
    
    commentsRef.on('value', (snapshot) => {
      const comments = snapshot.val();
      commentsList.innerHTML = '';

      if (comments) {
        // Convert to array and sort by timestamp (newest first)
        const commentsArray = Object.entries(comments)
          .map(([key, value]) => ({ id: key, ...value }))
          .sort((a, b) => b.timestamp - a.timestamp);
        
        console.log(`📝 Loading ${commentsArray.length} comments for ${itemName}`);
        
        commentsArray.forEach(comment => {
          const div = document.createElement('div');
          div.className = 'comment-item';
          div.innerHTML = `
            <div class="comment-header">
              <strong>${comment.userName}</strong>
              <span class="comment-time">${this.getTimeAgo(comment.timestamp)}</span>
            </div>
            <div class="comment-text">${comment.text}</div>
          `;
          commentsList.appendChild(div);
        });
      } else {
        console.log(`📝 No comments found for ${itemName}`);
        commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
      }
    }, (error) => {
      console.error("❌ Error loading comments:", error);
      commentsList.innerHTML = '<div class="error-comments">Error loading comments</div>';
    });
  }

  // 🔧 Sanitize keys for Firebase
  sanitizeKey(key) {
    return key.replace(/[.#$\/\[\]]/g, '_').replace(/\s+/g, '_').toLowerCase();
  }

  // ⏰ Time ago
  getTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  // 🏥 Hospital info
  toggleHospitalInfo() {
    document.querySelectorAll('.show-hospital-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const hospital = btn.nextElementSibling;
        hospital.classList.toggle('hidden');
        btn.textContent = hospital.classList.contains('hidden')
          ? '🏥 Click here for Hospital Information'
          : '⬆️ Hide Hospital Information';
      });
    });
  }

  // 🔄 Refresh user (call this after login)
  refreshUser() {
    console.log("🔄 Manually refreshing user data...");
    this.currentUser = null;
    this.getUserFromFirebaseAuth();
    this.updateUI();
    
    const loggedIn = this.isLoggedIn();
    console.log("🔄 Refresh result - Logged in:", loggedIn, "User:", this.currentUser?.name);
    
    return loggedIn;
  }
}

// =======================================================
// 🛠️ UTILITY FUNCTIONS
// =======================================================

// 🔄 Call this after login
function onLoginSuccess() {
  console.log("🎉 Login success detected!");
  
  // Wait for Firebase to update
  setTimeout(() => {
    if (window.destinationApp) {
      const success = window.destinationApp.refreshUser();
      if (success) {
        console.log("✅ App updated successfully!");
        alert("Login successful! You can now rate and comment.");
      } else {
        console.log("❌ App update failed, reloading...");
        location.reload();
      }
    } else {
      console.log("🔄 No app found, reloading...");
      location.reload();
    }
  }, 1000);
}

// 🎧 Voice Reading Controls
function initVoiceButtons() {
  const voiceButtons = document.querySelectorAll(".voice-btn");
  const stopButtons = document.querySelectorAll(".stop-voice-btn");
  let currentUtterance = null;

  // 🟢 PLAY BUTTON FUNCTION
  voiceButtons.forEach(button => {
    button.addEventListener("click", () => {
      const text = button.getAttribute("data-voice");
      if (!text) return;

      // Stop any ongoing speech before starting a new one
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      // --- Voice settings for natural tone ---
      utterance.lang = "en-US";     // Use standard English voice
      utterance.pitch = 0.8;        // Lower pitch (0.7–0.9 sounds more natural)
      utterance.rate = 0.95;        // Slightly slower for clarity
      utterance.volume = 1;         // Full volume

      // --- Optional: choose a more neutral/female voice if available ---
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v =>
        v.name.toLowerCase().includes("female") ||
        v.name.toLowerCase().includes("english")
      );
      if (preferredVoice) utterance.voice = preferredVoice;

      // Stop previous speech and speak again
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);

      // 🟡 Automatically clear when speech ends
      utterance.onend = () => {
        currentUtterance = null;
        console.log("✅ Speech finished.");
      };

      currentUtterance = utterance;
    });
  });
  
  stopButtons.forEach(button => {
    button.addEventListener("click", () => {
      console.log("🟥 Stop button clicked");
      if (window.speechSynthesis.speaking || window.speechSynthesis.paused) {
        // Force stop on mobile
        window.speechSynthesis.pause();
        setTimeout(() => {
          window.speechSynthesis.cancel();
          console.log("✅ Speech stopped (forced for mobile)");
        }, 100);
      } else {
        console.log("⚠️ No speech currently playing");
      }
    });
  });
}

// =======================================================
// ⚙️ INITIALIZE
// =======================================================

// Add some CSS for better comment display - FIXED to prevent duplicate declarations
function injectCommentStyles() {
  // Check if styles already exist
  if (document.querySelector('#comment-styles')) return;
  
  const commentStyles = `
.comment-item {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  transition: all 0.3s ease;
}

.comment-item:hover {
  background: #e9ecef;
  border-color: #dee2e6;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-header strong {
  color: #495057;
  font-size: 14px;
}

.comment-time {
  color: #6c757d;
  font-size: 12px;
}

.comment-text {
  color: #212529;
  line-height: 1.4;
}

.no-comments, .error-comments {
  text-align: center;
  color: #6c757d;
  font-style: italic;
  padding: 20px;
}

.rating-stats {
  margin-top: 8px;
  font-size: 14px;
  color: #495057;
}

.star {
  cursor: pointer;
  font-size: 24px;
  color: #ddd;
  transition: color 0.2s ease;
}

.star.active {
  color: #ffc107;
}

.star:hover {
  color: #ffc107;
}
`;

  const styleSheet = document.createElement('style');
  styleSheet.id = 'comment-styles';
  styleSheet.textContent = commentStyles;
  document.head.appendChild(styleSheet);
}

document.addEventListener('DOMContentLoaded', () => {
  console.log("🚀 Starting Discover Antipolo...");
  
  // Inject styles first
  injectCommentStyles();
  
  // Initialize voice buttons
  initVoiceButtons();
  
  // Initialize the main app
  window.destinationApp = new DestinationInteractions();
  
  // Global function for login success
  window.onLoginSuccess = onLoginSuccess;

  // Status indicators for opening hours
  const indicators = document.querySelectorAll(".status-indicator");
  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;

  indicators.forEach(indicator => {
    const openTime = parseFloat(indicator.dataset.open);
    const closeTime = parseFloat(indicator.dataset.close);

    // Reset classes first
    indicator.classList.remove("open", "closed", "soon");

    // 24-hour open spots
    if (openTime === 0 && closeTime === 24) {
      indicator.textContent = "Open 24 Hours";
      indicator.classList.add("open");
      return;
    }

    // Normal open/close logic
    if (currentHour >= openTime && currentHour < closeTime - 0.5) {
      indicator.textContent = "Open Now";
      indicator.classList.add("open");
    } else if (currentHour >= closeTime - 0.5 && currentHour < closeTime) {
      indicator.textContent = "Closes Soon";
      indicator.classList.add("soon");
    } else {
      indicator.textContent = "Closed";
      indicator.classList.add("closed");
    }
  });

  // Toggle comments visibility
  const toggleButtons = document.querySelectorAll(".toggle-comments-btn");

  toggleButtons.forEach(button => {
    button.addEventListener("click", () => {
      const wrapper = button.nextElementSibling; // The .comment-wrapper
      const commentSection = wrapper.querySelector(".comment-section");

      // Toggle visibility
      commentSection.classList.toggle("hidden");

      // Update button text
      if (commentSection.classList.contains("hidden")) {
        button.textContent = "💬 View Comments";
      } else {
        button.textContent = "🔼 Hide Comments";
      }
    });
  });
});

// Directions function
function openDirections(lat, lng) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        // ✅ Use backticks and proper Google Maps API parameters
        const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}&travelmode=driving`;

        window.open(mapsUrl, "_blank");
      },
      () => {
        alert("⚠️ Please allow location access to get directions from your current location.");
      }
    );
  } else {
    alert("Your browser does not support geolocation.");
  }
}
