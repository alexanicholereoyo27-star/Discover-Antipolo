// 📸 Discover Antipolo Memories - PRODUCTION VERSION
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Memories system initializing...");

  // Import Firebase modules
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js");
  const { 
    getAuth, 
    setPersistence, 
    browserSessionPersistence, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
  } = await import("https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js");
  const { getDatabase, ref, onValue, push, set } = await import("https://www.gstatic.com/firebasejs/12.4.0/firebase-database.js");

  // Initialize Firebase for memories
  initializeFirebase();

  function initializeFirebase() {
      try {
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

          const app = initializeApp(firebaseConfig, "MemoriesApp");
          const auth = getAuth(app);
          const db = getDatabase(app);
          
          // Set persistence to SESSION (will persist until browser is closed)
          setPersistence(auth, browserSessionPersistence)
              .then(() => {
                  console.log("Auth persistence set to SESSION");
                  startMemoriesSystem(db, auth);
              })
              .catch((error) => {
                  console.error("Auth persistence error:", error);
                  startMemoriesSystem(db, auth);
              });

      } catch (error) {
          console.error("Firebase initialization error:", error);
          showError("Failed to initialize database.");
      }
  }

  function showError(message) {
      const container = document.getElementById("memoriesContainer");
      if (container) {
          container.innerHTML = `
              <div style="background: #ffebee; color: #c62828; padding: 20px; border-radius: 8px; text-align: center; margin: 20px;">
                  <h3>❌ Error</h3>
                  <p>${message}</p>
                  <button onclick="location.reload()" style="background: #c62828; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-top: 10px;">
                      Reload Page
                  </button>
              </div>
          `;
      }
  }

  function startMemoriesSystem(db, auth) {
      const form = document.getElementById("uploadForm");
      const container = document.getElementById("memoriesContainer");
      const uploadBtn = document.querySelector('.upload-btn');

      const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dzx8qxswu/image/upload";
      const CLOUDINARY_UPLOAD_PRESET = "discoverantipolo_uploads";

      if (!container) {
          console.error("Memories container not found");
          return;
      }

      let currentUser = null;
      let selectedFile = null;

      // ✅ Create fullscreen image viewer
      function createImageViewer() {
          const viewer = document.createElement("div");
          viewer.id = "imageViewer";
          viewer.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0,0,0,0.9);
              display: none;
              justify-content: center;
              align-items: center;
              z-index: 1000;
              cursor: pointer;
          `;
          
          const img = document.createElement("img");
          img.id = "fullSizeImage";
          img.style.cssText = `
              max-width: 90%;
              max-height: 90%;
              border-radius: 8px;
              box-shadow: 0 4px 20px rgba(0,0,0,0.5);
          `;
          
          const closeBtn = document.createElement("button");
          closeBtn.textContent = "✕";
          closeBtn.style.cssText = `
              position: absolute;
              top: 20px;
              right: 20px;
              background: rgba(255,255,255,0.2);
              color: white;
              border: none;
              width: 40px;
              height: 40px;
              border-radius: 50%;
              font-size: 20px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
          `;
          
          viewer.appendChild(img);
          viewer.appendChild(closeBtn);
          document.body.appendChild(viewer);
          
          // Close events
          closeBtn.addEventListener("click", closeImageViewer);
          viewer.addEventListener("click", (e) => {
              if (e.target === viewer) closeImageViewer();
          });
          
          // ESC key to close
          document.addEventListener("keydown", (e) => {
              if (e.key === "Escape") closeImageViewer();
          });
          
          return { viewer, img };
      }

      function openImageViewer(imageUrl) {
          const { viewer, img } = window.imageViewer;
          img.src = imageUrl;
          viewer.style.display = "flex";
          document.body.style.overflow = "hidden";
      }

      function closeImageViewer() {
          const { viewer } = window.imageViewer;
          viewer.style.display = "none";
          document.body.style.overflow = "auto";
      }

      // ✅ Create Login Popup Modal
      function createLoginModal() {
          // Check if modal already exists
          if (document.getElementById('loginModal')) {
              return;
          }

          const modal = document.createElement("div");
          modal.id = "loginModal";
          modal.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(0,0,0,0.7);
              display: none;
              justify-content: center;
              align-items: center;
              z-index: 2000;
              font-family: 'Poppins', sans-serif;
          `;

          modal.innerHTML = `
              <div style="background: white; padding: 30px; border-radius: 12px; width: 90%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                  <div style="text-align: center; margin-bottom: 20px;">
                      <h2 style="color: #2c5530; margin: 0 0 10px 0;"> Welcome Back</h2>
                      <p style="color: #666; margin: 0;">Login to share your memories</p>
                  </div>
                  
                  <form id="loginForm">
                      <div style="margin-bottom: 15px;">
                          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;"> Email Address</label>
                          <input type="email" id="loginEmail" required 
                                 style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; transition: all 0.3s ease;"
                                 placeholder="your@email.com">
                      </div>
                      
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;"> Password</label>
                          <input type="password" id="loginPassword" required 
                                 style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; transition: all 0.3s ease;"
                                 placeholder="Enter your password">
                      </div>
                      
                      <button type="submit" id="loginSubmitBtn" 
                              style="width: 100%; padding: 15px; border: none; border-radius: 8px; font-size: 16px; background: linear-gradient(135deg, #4a7c59, #3a6b4a); color: white; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                           Login
                      </button>
                      
                      <div style="text-align: center; margin-top: 15px;">
                          <p style="color: #666; font-size: 14px; margin: 0;">
                              Don't have an account? <a href="#" id="switchToSignup" style="color: #4a7c59; text-decoration: none; font-weight: 600;">Sign up here</a>
                          </p>
                      </div>
                  </form>
                  
                  <form id="signupForm" style="display: none;">
                      <div style="margin-bottom: 15px;">
                          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">📧 Email Address</label>
                          <input type="email" id="signupEmail" required 
                                 style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; transition: all 0.3s ease;"
                                 placeholder="your@email.com">
                      </div>
                      
                      <div style="margin-bottom: 15px;">
                          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">🔑 Password</label>
                          <input type="password" id="signupPassword" required 
                                 style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; transition: all 0.3s ease;"
                                 placeholder="Choose a password (min. 6 characters)">
                      </div>
                      
                      <div style="margin-bottom: 20px;">
                          <label style="display: block; margin-bottom: 5px; font-weight: 600; color: #333;">✅ Confirm Password</label>
                          <input type="password" id="signupConfirmPassword" required 
                                 style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; transition: all 0.3s ease;"
                                 placeholder="Confirm your password">
                      </div>
                      
                      <button type="submit" id="signupSubmitBtn" 
                              style="width: 100%; padding: 15px; border: none; border-radius: 8px; font-size: 16px; background: linear-gradient(135deg, #4a7c59, #3a6b4a); color: white; cursor: pointer; font-weight: 600; transition: all 0.3s ease;">
                           Create Account
                      </button>
                      
                      <div style="text-align: center; margin-top: 15px;">
                          <p style="color: #666; font-size: 14px; margin: 0;">
                              Already have an account? <a href="#" id="switchToLogin" style="color: #4a7c59; text-decoration: none; font-weight: 600;">Login here</a>
                          </p>
                      </div>
                  </form>
                  
                  <div id="authMessage" style="margin-top: 15px; padding: 10px; border-radius: 6px; text-align: center; display: none;"></div>
                  
                  <button id="closeModal" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 20px; cursor: pointer; color: #666;">✕</button>
              </div>
          `;

          document.body.appendChild(modal);
          setupLoginModal();
      }

      function setupLoginModal() {
          const modal = document.getElementById('loginModal');
          const closeModal = document.getElementById('closeModal');
          const loginForm = document.getElementById('loginForm');
          const signupForm = document.getElementById('signupForm');
          const switchToSignup = document.getElementById('switchToSignup');
          const switchToLogin = document.getElementById('switchToLogin');
          const authMessage = document.getElementById('authMessage');

          // Close modal events
          closeModal.addEventListener('click', closeLoginModal);
          modal.addEventListener('click', (e) => {
              if (e.target === modal) closeLoginModal();
          });

          // Form switching
          switchToSignup.addEventListener('click', (e) => {
              e.preventDefault();
              loginForm.style.display = 'none';
              signupForm.style.display = 'block';
              hideAuthMessage();
          });

          switchToLogin.addEventListener('click', (e) => {
              e.preventDefault();
              signupForm.style.display = 'none';
              loginForm.style.display = 'block';
              hideAuthMessage();
          });

          // Login form submission
          loginForm.addEventListener('submit', async (e) => {
              e.preventDefault();
              const email = document.getElementById('loginEmail').value;
              const password = document.getElementById('loginPassword').value;
              const submitBtn = document.getElementById('loginSubmitBtn');

              if (!email || !password) {
                  showAuthMessage('Please fill in all fields', 'error');
                  return;
              }

              submitBtn.textContent = 'Logging in...';
              submitBtn.disabled = true;

              try {
                  await signInWithEmailAndPassword(auth, email, password);
                  showAuthMessage('✅ Login successful!', 'success');
                  setTimeout(() => {
                      closeLoginModal();
                  }, 1500);
              } catch (error) {
                  showAuthMessage(`❌ ${error.message}`, 'error');
              } finally {
                  submitBtn.textContent = ' Login';
                  submitBtn.disabled = false;
              }
          });

          // Signup form submission
          signupForm.addEventListener('submit', async (e) => {
              e.preventDefault();
              const email = document.getElementById('signupEmail').value;
              const password = document.getElementById('signupPassword').value;
              const confirmPassword = document.getElementById('signupConfirmPassword').value;
              const submitBtn = document.getElementById('signupSubmitBtn');

              if (!email || !password || !confirmPassword) {
                  showAuthMessage('Please fill in all fields', 'error');
                  return;
              }

              if (password !== confirmPassword) {
                  showAuthMessage('Passwords do not match', 'error');
                  return;
              }

              if (password.length < 6) {
                  showAuthMessage('Password must be at least 6 characters', 'error');
                  return;
              }

              submitBtn.textContent = 'Creating account...';
              submitBtn.disabled = true;

              try {
                  await createUserWithEmailAndPassword(auth, email, password);
                  showAuthMessage('✅ Account created successfully!', 'success');
                  setTimeout(() => {
                      closeLoginModal();
                  }, 1500);
              } catch (error) {
                  showAuthMessage(`❌ ${error.message}`, 'error');
              } finally {
                  submitBtn.textContent = ' Create Account';
                  submitBtn.disabled = false;
              }
          });

          function showAuthMessage(message, type) {
              authMessage.textContent = message;
              authMessage.style.display = 'block';
              authMessage.style.background = type === 'error' ? '#ffebee' : '#e8f5e8';
              authMessage.style.color = type === 'error' ? '#c62828' : '#2e7d32';
              authMessage.style.border = type === 'error' ? '1px solid #c62828' : '1px solid #4caf50';
          }

          function hideAuthMessage() {
              authMessage.style.display = 'none';
          }
      }

      function openLoginModal() {
          const modal = document.getElementById('loginModal');
          if (modal) {
              modal.style.display = 'flex';
              document.body.style.overflow = 'hidden';
          }
      }

      function closeLoginModal() {
          const modal = document.getElementById('loginModal');
          if (modal) {
              modal.style.display = 'none';
              document.body.style.overflow = 'auto';
              // Reset forms
              document.getElementById('loginForm').reset();
              document.getElementById('signupForm').reset();
              document.getElementById('authMessage').style.display = 'none';
              // Show login form by default
              document.getElementById('loginForm').style.display = 'block';
              document.getElementById('signupForm').style.display = 'none';
          }
      }

      // ✅ Improve form CSS and reorder elements
      function improveFormStyles() {
          if (!form) return;

          // Clear the form and rebuild in correct order
          form.innerHTML = '';

          // 1. Location Dropdown
          const spotGroup = document.createElement('div');
          spotGroup.innerHTML = `
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;"> Select Location</label>
              <select id="spotSelect" required>
                  <option value=""> Choose a tourist spot...</option>
                  <option value="Hinulugang Taktak"> Hinulugang Taktak</option>
                  <option value="Pinto Art Museum">Pinto Art Museum</option>
                  <option value="Mount Purro Nature Reserve">Mount Purro Nature Reserve</option>
                  <option value="PACEM Eco Park">PACEM Eco Park</option>
                  <option value="Casa Santa Museum">Casa Santa Museum</option>
                  <option value="Luljetta's Hanging Gardens">Luljetta's Hanging Gardens</option>
                  <option value="Mystical Cave">Mystical Cave</option>
                  <option value="Antipolo Cathedral">Antipolo Cathedral</option>
                  <option value="Cloud 9">Cloud 9</option>
                  <option value="Yellow Lantern Cafe">Yellow Lantern Café</option>
              </select>
          `;
          form.appendChild(spotGroup);

          // 2. Photo Upload Section (Now comes before caption)
          const photoGroup = document.createElement('div');
          photoGroup.style.marginBottom = '20px';
          photoGroup.innerHTML = `
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;">📷 Choose Photo</label>
              <div id="photoUploadArea" style="border: 2px dashed #e0e0e0; border-radius: 8px; padding: 20px; text-align: center; background: #f8f9fa; cursor: pointer; transition: all 0.3s ease;">
                  <div id="photoPlaceholder">
                      <div style="font-size: 48px; margin-bottom: 10px;">📸</div>
                      <div style="color: #666; margin-bottom: 10px;">Click to choose photo or drag & drop</div>
                      <div style="font-size: 12px; color: #999;">Supported: JPG, PNG, WebP (Max 10MB)</div>
                  </div>
                  <div id="photoPreview" style="display: none;">
                      <img id="previewImage" style="max-width: 100%; max-height: 200px; border-radius: 6px; margin-bottom: 10px;">
                      <div style="color: #4a7c59; font-weight: 600;">✅ Photo selected</div>
                      <button type="button" id="changePhotoBtn" style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 5px;">
                          Change Photo
                      </button>
                  </div>
              </div>
              <input type="file" id="photoInput" accept="image/*" required style="display: none;">
          `;
          form.appendChild(photoGroup);

          // 3. Caption Input
          const captionGroup = document.createElement('div');
          captionGroup.innerHTML = `
              <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #333;"> Write Caption</label>
              <textarea id="captionInput" placeholder="Share your experience at this location..." required 
                        style="width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 16px; font-family: 'Poppins', sans-serif; background: white; margin-bottom: 15px; transition: all 0.3s ease; resize: vertical; min-height: 80px;"></textarea>
          `;
          form.appendChild(captionGroup);

          // 4. Upload Button
          const buttonGroup = document.createElement('div');
          buttonGroup.innerHTML = `
              <button type="submit" class="upload-btn" style="width: 100%; padding: 15px; border: none; border-radius: 8px; font-size: 18px; font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #4a7c59, #3a6b4a); color: white; cursor: pointer; transition: all 0.3s ease; font-weight: 600;">
                   Upload Memory
              </button>
          `;
          form.appendChild(buttonGroup);

          // Apply styles to the new elements
          applyFormStyles();
          setupPhotoPreview();
      }

      function applyFormStyles() {
          const spotSelect = document.getElementById('spotSelect');
          const captionInput = document.getElementById('captionInput');
          const uploadBtn = document.querySelector('.upload-btn');

          if (spotSelect) {
              spotSelect.style.cssText = `
                  width: 100%;
                  padding: 12px 15px;
                  border: 2px solid #e0e0e0;
                  border-radius: 8px;
                  font-size: 16px;
                  font-family: 'Poppins', sans-serif;
                  background: white;
                  margin-bottom: 20px;
                  transition: all 0.3s ease;
              `;
              spotSelect.addEventListener('focus', () => {
                  spotSelect.style.borderColor = '#4a7c59';
                  spotSelect.style.boxShadow = '0 0 0 3px rgba(74, 124, 89, 0.1)';
              });
              spotSelect.addEventListener('blur', () => {
                  spotSelect.style.borderColor = '#e0e0e0';
                  spotSelect.style.boxShadow = 'none';
              });
          }

          if (captionInput) {
              captionInput.addEventListener('focus', () => {
                  captionInput.style.borderColor = '#4a7c59';
                  captionInput.style.boxShadow = '0 0 0 3px rgba(74, 124, 89, 0.1)';
              });
              captionInput.addEventListener('blur', () => {
                  captionInput.style.borderColor = '#e0e0e0';
                  captionInput.style.boxShadow = 'none';
              });
          }

          if (uploadBtn) {
              uploadBtn.addEventListener('mouseenter', () => {
                  uploadBtn.style.transform = 'translateY(-2px)';
                  uploadBtn.style.boxShadow = '0 4px 12px rgba(74, 124, 89, 0.3)';
              });
              uploadBtn.addEventListener('mouseleave', () => {
                  uploadBtn.style.transform = 'translateY(0)';
                  uploadBtn.style.boxShadow = 'none';
              });
          }
      }

      function setupPhotoPreview() {
          const photoUploadArea = document.getElementById('photoUploadArea');
          const photoInput = document.getElementById('photoInput');
          const photoPlaceholder = document.getElementById('photoPlaceholder');
          const photoPreview = document.getElementById('photoPreview');
          const previewImage = document.getElementById('previewImage');
          const changePhotoBtn = document.getElementById('changePhotoBtn');

          if (!photoUploadArea) return;

          // Click to select file
          photoUploadArea.addEventListener('click', () => {
              photoInput.click();
          });

          // Drag and drop functionality
          photoUploadArea.addEventListener('dragover', (e) => {
              e.preventDefault();
              photoUploadArea.style.borderColor = '#4a7c59';
              photoUploadArea.style.background = '#f0f7f0';
          });

          photoUploadArea.addEventListener('dragleave', () => {
              photoUploadArea.style.borderColor = '#e0e0e0';
              photoUploadArea.style.background = '#f8f9fa';
          });

          photoUploadArea.addEventListener('drop', (e) => {
              e.preventDefault();
              photoUploadArea.style.borderColor = '#e0e0e0';
              photoUploadArea.style.background = '#f8f9fa';
              
              if (e.dataTransfer.files.length > 0) {
                  const file = e.dataTransfer.files[0];
                  if (file.type.startsWith('image/')) {
                      handleFileSelection(file);
                  } else {
                      alert('Please select an image file (JPG, PNG, WebP)');
                  }
              }
          });

          // File input change
          photoInput.addEventListener('change', (e) => {
              if (e.target.files.length > 0) {
                  handleFileSelection(e.target.files[0]);
              }
          });

          // Change photo button
          if (changePhotoBtn) {
              changePhotoBtn.addEventListener('click', (e) => {
                  e.stopPropagation();
                  photoInput.click();
              });
          }

          function handleFileSelection(file) {
              // Validate file type and size
              if (!file.type.startsWith('image/')) {
                  alert('Please select an image file (JPG, PNG, WebP)');
                  return;
              }

              if (file.size > 10 * 1024 * 1024) { // 10MB limit
                  alert('File size too large. Please select an image under 10MB.');
                  return;
              }

              selectedFile = file;

              // Show preview
              const reader = new FileReader();
              reader.onload = (e) => {
                  previewImage.src = e.target.result;
                  photoPlaceholder.style.display = 'none';
                  photoPreview.style.display = 'block';
                  photoUploadArea.style.borderColor = '#4a7c59';
                  photoUploadArea.style.borderStyle = 'solid';
                  photoUploadArea.style.background = '#e8f5e8';
              };
              reader.readAsDataURL(file);
          }
      }

      // ✅ Simple auth check
      function setupAuth() {
          createLoginModal(); // Create the modal first

          onAuthStateChanged(auth, (user) => {
              currentUser = user;
              console.log("Auth state:", user ? `Logged in as ${user.email}` : "Logged out");
              updateAuthDisplay();
              loadMemories();
          });

          // Add simple login button to the page
          const uploadBox = document.querySelector('.upload-box');
          if (uploadBox && !document.getElementById('authStatus')) {
              const authStatus = document.createElement('div');
              authStatus.id = 'authStatus';
              authStatus.style.cssText = `
                  text-align: center;
                  padding: 10px;
                  margin-bottom: 15px;
                  border-radius: 6px;
                  font-size: 14px;
              `;
              
              const loginBtn = document.createElement('button');
              loginBtn.innerHTML = ' Login to Upload Memories';
              loginBtn.style.cssText = `
                  background: #4a7c59;
                  color: white;
                  border: none;
                  padding: 12px 24px;
                  border-radius: 8px;
                  cursor: pointer;
                  font-size: 16px;
                  font-weight: 600;
                  transition: all 0.3s ease;
              `;
              
              const logoutBtn = document.createElement('button');
              logoutBtn.innerHTML = '🚪 Logout';
              logoutBtn.style.cssText = `
                  background: #c62828;
                  color: white;
                  border: none;
                  padding: 8px 16px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-size: 14px;
                  margin: 5px;
                  display: none;
              `;
              
              loginBtn.addEventListener('mouseenter', () => {
                  loginBtn.style.transform = 'translateY(-2px)';
                  loginBtn.style.boxShadow = '0 4px 12px rgba(74, 124, 89, 0.3)';
              });
              loginBtn.addEventListener('mouseleave', () => {
                  loginBtn.style.transform = 'translateY(0)';
                  loginBtn.style.boxShadow = 'none';
              });
              
              authStatus.appendChild(loginBtn);
              authStatus.appendChild(logoutBtn);
              uploadBox.insertBefore(authStatus, uploadBox.firstChild);
              
              loginBtn.addEventListener('click', openLoginModal);
              logoutBtn.addEventListener('click', handleLogout);
          }
      }

      function updateAuthDisplay() {
          const authStatus = document.getElementById('authStatus');
          if (!authStatus) return;

          if (currentUser) {
              authStatus.innerHTML = `
                  <div style="color: #2e7d32; margin-bottom: 10px; font-size: 16px;">
                      ✅ Welcome back!
                  </div>
                  <button id="logoutBtn" style="background: #c62828; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px;">
                       Logout
                  </button>
              `;
              document.getElementById('logoutBtn').addEventListener('click', handleLogout);
          } else {
              authStatus.innerHTML = `
                  <button id="loginBtn" style="background: #4a7c59; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.3s ease;">
                       Login to Upload Memories
                  </button>
              `;
              document.getElementById('loginBtn').addEventListener('click', openLoginModal);
              document.getElementById('loginBtn').addEventListener('mouseenter', function() {
                  this.style.transform = 'translateY(-2px)';
                  this.style.boxShadow = '0 4px 12px rgba(74, 124, 89, 0.3)';
              });
              document.getElementById('loginBtn').addEventListener('mouseleave', function() {
                  this.style.transform = 'translateY(0)';
                  this.style.boxShadow = 'none';
              });
          }
      }

      function handleLogout() {
          signOut(auth)
              .then(() => {
                  console.log("Logged out successfully");
              })
              .catch((error) => {
                  alert("Logout failed: " + error.message);
              });
      }

      // ✅ Load memories from Firebase
      function loadMemories() {
          container.innerHTML = '<div style="text-align: center; padding: 40px; color: #666;">Loading memories...</div>';

          const memoriesRef = ref(db, "memories");
          onValue(memoriesRef, (snapshot) => {
              const data = snapshot.val();

              container.innerHTML = "";
              container.style.cssText = "padding: 10px; max-width: 1200px; margin: 0 auto; font-family: 'Poppins', sans-serif;";

              if (!data) {
                  container.innerHTML = `
                      <div style="text-align: center; padding: 40px; color: #666; font-style: italic; background: #f9f9f9; border-radius: 8px; border: 1px dashed #ccc;">
                          No memories shared yet. ${currentUser ? 'Be the first to share your experience!' : 'Login to share your memories!'}
                      </div>
                  `;
                  return;
              }

              Object.entries(data).forEach(([spotKey, memories]) => {
                  const spotSection = document.createElement("div");
                  spotSection.style.cssText = "margin-bottom: 25px; background: white; padding: 12px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;";
                  
                  const spotTitle = document.createElement("h3");
                  spotTitle.textContent = ` ${spotKey.replace(/_/g, ' ')}`;
                  spotTitle.style.cssText = "color: #2c5530; text-align: center; font-size: 15px; font-weight: bold; margin: 3px 0 12px 0; padding-bottom: 6px; border-bottom: 1px solid #4a7c59;";
                  spotSection.appendChild(spotTitle);
                  
                  const gallery = document.createElement("div");
                  gallery.style.cssText = "display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;";
                  spotSection.appendChild(gallery);
                  
                  let memoryCount = 0;

                  Object.entries(memories).forEach(([memoryId, memory]) => {
                      if (!memory.photoURL) return;

                      const card = document.createElement("div");
                      card.style.cssText = `
                          background: white;
                          border-radius: 6px;
                          overflow: hidden;
                          box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                          border: 1px solid #e0e0e0;
                          height: fit-content;
                      `;
                      
                      const imageContainer = document.createElement("div");
                      imageContainer.style.cssText = `
                          width: 100%;
                          height: 160px;
                          background-image: url('${memory.photoURL}');
                          background-size: cover;
                          background-position: center;
                          background-repeat: no-repeat;
                          cursor: pointer;
                          transition: transform 0.2s ease;
                      `;
                      
                      imageContainer.addEventListener("mouseenter", () => {
                          imageContainer.style.transform = "scale(1.02)";
                      });
                      imageContainer.addEventListener("mouseleave", () => {
                          imageContainer.style.transform = "scale(1)";
                      });
                      
                      imageContainer.addEventListener("click", () => {
                          openImageViewer(memory.photoURL);
                      });
                      
                      const testImg = new Image();
                      testImg.onerror = function() {
                          imageContainer.innerHTML = '<div style="background: #ffeaa7; color: #e17055; height: 100%; display: flex; align-items: center; justify-content: center; font-weight: bold; text-align: center; padding: 10px; font-size: 11px; border-radius: 4px;">Image failed to load</div>';
                          imageContainer.style.cursor = "default";
                      };
                      testImg.src = memory.photoURL;
                      
                      const content = document.createElement("div");
                      content.style.cssText = "padding: 6px 8px 8px 8px;";
                      content.innerHTML = `
                          <p style="margin: 0 0 5px 0; color: #333; line-height: 1.3; font-size: 11px; min-height: 28px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">💭 ${memory.caption || 'No caption'}</p>
                          <div style="display: flex; justify-content: space-between; font-size: 9px; color: #666;">
                              <span>👤 ${memory.name || "Anonymous"}</span>
                              <span>${memory.timestamp ? formatTimeAgo(memory.timestamp) : 'Recently'}</span>
                          </div>
                      `;
                      
                      card.appendChild(imageContainer);
                      card.appendChild(content);
                      gallery.appendChild(card);
                      memoryCount++;
                  });

                  if (memoryCount > 0) {
                      container.appendChild(spotSection);
                  }
              });

          }, (error) => {
              console.error("Firebase error:", error);
              container.innerHTML = `
                  <div style="background: #ffebee; color: #c62828; padding: 20px; text-align: center; border-radius: 8px;">
                      ❌ Error loading memories. Please try again later.
                  </div>
              `;
          });
      }

      // ✅ Upload memory with auth check
      function setupUploadForm() {
          if (!form) return;

          form.addEventListener("submit", async (e) => {
              e.preventDefault();

              if (!currentUser) {
                  alert("Please login to upload memories!");
                  return;
              }

              const spotSelect = document.getElementById('spotSelect');
              const captionInput = document.getElementById('captionInput');

              const spot = spotSelect.value;
              const caption = captionInput.value.trim();

              if (!spot) {
                  alert("Please select a tourist spot!");
                  return;
              }
              if (!selectedFile) {
                  alert("Please select a photo to upload!");
                  return;
              }
              if (!caption) {
                  alert("Please write a caption for your memory!");
                  return;
              }

              const submitBtn = form.querySelector('.upload-btn');
              const originalText = submitBtn.textContent;
              submitBtn.textContent = "Uploading...";
              submitBtn.disabled = true;

              try {
                  const formData = new FormData();
                  formData.append("file", selectedFile);
                  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

                  const res = await fetch(CLOUDINARY_URL, { 
                      method: "POST", 
                      body: formData 
                  });
                  
                  const cloudinaryData = await res.json();

                  if (!cloudinaryData.secure_url) {
                      throw new Error("Upload failed");
                  }

                  const cleanSpotName = spot.replace(/[.#$\/\[\]]/g, '_').replace(/\s+/g, '_');
                  const memoryRef = push(ref(db, "memories/" + cleanSpotName));
                  const memoryData = {
                      name: currentUser.email.split('@')[0],
                      caption: caption,
                      photoURL: cloudinaryData.secure_url,
                      timestamp: new Date().toISOString(),
                      userId: currentUser.uid
                  };
                  
                  await set(memoryRef, memoryData);

                  const successMsg = document.createElement("div");
                  successMsg.style.cssText = "background: #e8f5e8; color: #2e7d32; padding: 10px; border-radius: 6px; margin: 10px 0; text-align: center; border: 1px solid #4caf50; font-size: 14px;";
                  successMsg.textContent = "🎉 Memory uploaded successfully! Refreshing...";
                  container.insertBefore(successMsg, container.firstChild);
                  
                  setTimeout(() => {
                      loadMemories();
                  }, 2000);
                  
                  // Reset form
                  form.reset();
                  selectedFile = null;
                  document.getElementById('photoPlaceholder').style.display = 'block';
                  document.getElementById('photoPreview').style.display = 'none';
                  document.getElementById('photoUploadArea').style.borderColor = '#e0e0e0';
                  document.getElementById('photoUploadArea').style.borderStyle = 'dashed';
                  document.getElementById('photoUploadArea').style.background = '#f8f9fa';
                  
              } catch (error) {
                  console.error("Upload error:", error);
                  alert("Error uploading memory. Please try again.");
              } finally {
                  submitBtn.textContent = originalText;
                  submitBtn.disabled = false;
              }
          });
      }

      function formatTimeAgo(timestamp) {
          try {
              const now = new Date();
              const memoryDate = new Date(timestamp);
              const diffInSeconds = Math.floor((now - memoryDate) / 1000);
              
              if (diffInSeconds < 60) return 'just now';
              if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
              if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
              if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
              
              return memoryDate.toLocaleDateString();
          } catch (e) {
              return 'Recently';
          }
      }

      // ✅ Initialize everything
      function initialize() {
          window.imageViewer = createImageViewer();
          improveFormStyles();
          setupAuth();
          setupUploadForm();
          // loadMemories will be called automatically when auth state is determined
      }

      initialize();
  }
});