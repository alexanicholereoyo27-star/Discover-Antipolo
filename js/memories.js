document.addEventListener("DOMContentLoaded", () => {
  console.log("📸 Categorized Memories Page Loaded (Firebase v8)");

  // ---- Firebase config ----
  const firebaseConfig = {
    apiKey: "AIzaSyD9NfWr49Q0BKvVo8cGs_IZGvzWYAuCVKw",
    authDomain: "discoverantipolo.firebaseapp.com",
    databaseURL: "https://discoverantipolo-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "discoverantipolo",
    storageBucket: "discoverantipolo.firebasestorage.app",
    messagingSenderId: "49102168673",
    appId: "1:49102168673:web:a65f8f4c5fed1e594ac020"
  };

  // ---- Initialize Firebase ----
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.database();

  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dzx8qxswu/image/upload";
  const CLOUDINARY_UPLOAD_PRESET = "discoverantipolo_uploads";

  const container = document.getElementById("memoriesContainer");
  const form = document.getElementById("uploadForm");
  const authStatus = document.getElementById("authStatus");

  let currentUser = null;

  // ✅ AUTH CHECK — restrict upload, allow public viewing
  auth.onAuthStateChanged((user) => {
    currentUser = user;

    if (!user) {
      console.log("⚠️ Not logged in — upload disabled, view only");
      if (authStatus)
        authStatus.innerHTML = `<div style="color:#ffb3b3;">⚠️ Please log in to upload your memories.</div>`;
      if (form) form.style.display = "none";

      loadMemories();
    } else {
      console.log("✅ Logged in as:", user.email);
      if (authStatus)
        authStatus.innerHTML = `<div style="color:#a5f1af;">✅ Logged in as <b>${user.email}</b></div>`;
      if (form) form.style.display = "block";

      loadMemories();
    }
  });

  // ✅ LOAD MEMORIES (CATEGORIZED)
  function loadMemories() {
    if (!container) return;
    container.innerHTML = "<p style='text-align:center;color:#ccc;'>Loading memories...</p>";

    const memoriesRef = db.ref("memories");
    memoriesRef.on("value", (snapshot) => {
      const data = snapshot.val();
      container.innerHTML = "";

      if (!data) {
        container.innerHTML = "<p style='text-align:center;color:#999;'>No memories yet.</p>";
        return;
      }

      Object.entries(data).forEach(([spotKey, memories]) => {
        const section = document.createElement("div");
        section.className = "memory-spot fade-up";
        section.innerHTML = `<h3>${spotKey.replace(/_/g, " ")}</h3>`;

        const gallery = document.createElement("div");
        gallery.className = "spot-grid";

        Object.entries(memories).forEach(([memId, memory]) => {
          const card = document.createElement("div");
          card.className = "memory-card";
          card.innerHTML = `
            <img src="${memory.photoURL}" alt="Memory" class="memory-photo">
            <div class="memory-info">
              <p>${memory.caption}</p>
              <small>👤 ${memory.name}</small>
              ${
                currentUser && currentUser.email.split("@")[0] === memory.name
                  ? `<div class="card-actions">
                      <button class="edit-btn">✏️ Edit</button>
                      <button class="delete-btn">🗑️ Delete</button>
                    </div>`
                  : ""
              }
            </div>
          `;

          // 🖼️ View fullscreen
          const img = card.querySelector(".memory-photo");
          if (img) img.addEventListener("click", () => openModal(memory.photoURL, memory.caption));

          // 🗑️ Delete
          const delBtn = card.querySelector(".delete-btn");
          if (delBtn) {
            delBtn.addEventListener("click", () => {
              if (confirm("Delete this memory?")) {
                db.ref(`memories/${spotKey}/${memId}`).remove();
              }
            });
          }

          // ✏️ Edit
          const editBtn = card.querySelector(".edit-btn");
          if (editBtn) {
            editBtn.addEventListener("click", () => {
              const newCaption = prompt("Edit caption:", memory.caption);
              if (newCaption && newCaption.trim() !== "") {
                db.ref(`memories/${spotKey}/${memId}`).update({ caption: newCaption });
              }
            });
          }

          gallery.appendChild(card);
        });

        section.appendChild(gallery);
        container.appendChild(section);
      });
    });
  }

  // ✅ UPLOAD MEMORY
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!currentUser) return alert("Please log in first.");

      const spot = document.getElementById("spotSelect")?.value;
      const caption = document.getElementById("captionInput")?.value.trim();
      const file = document.getElementById("photoInput")?.files[0];
      if (!spot || !caption || !file) return alert("Please fill out all fields!");

      const uploadBtn = form.querySelector(".upload-btn");
      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.textContent = "Uploading...";
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      fetch(CLOUDINARY_URL, { method: "POST", body: formData })
        .then((res) => res.json())
        .then((data) => {
          const cleanSpot = spot.replace(/[.#$/[\]]/g, "_").replace(/\s+/g, "_");
          const newRef = db.ref(`memories/${cleanSpot}`).push();
          newRef.set({
            name: currentUser.email.split("@")[0],
            caption,
            photoURL: data.secure_url,
            timestamp: new Date().toISOString(),
          });
          alert("✅ Memory uploaded!");
          form.reset();
        })
        .catch((err) => {
          console.error(err);
          alert("Upload failed.");
        })
        .finally(() => {
          if (uploadBtn) {
            uploadBtn.disabled = false;
            uploadBtn.textContent = "Upload";
          }
        });
    });
  }

  // ✅ MODAL (safe check)
  const modal = document.getElementById("imageModal");
  const modalImg = document.getElementById("modalImg");
  const captionText = document.getElementById("modalCaption");
  const closeBtn = document.querySelector(".close-modal");

  function openModal(src, caption) {
    if (!modal || !modalImg || !captionText) return;
    modal.classList.remove("hidden");
    modalImg.src = src;
    captionText.textContent = caption;
  }

  if (modal && closeBtn) {
    closeBtn.addEventListener("click", () => modal.classList.add("hidden"));
    modal.addEventListener("click", (e) => {
      if (e.target === modal) modal.classList.add("hidden");
    });
  } else {
    console.warn("⚠️ Modal elements not found — skipping modal setup");
  }

});
