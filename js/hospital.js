// =======================================================
// 🏥 Discover Antipolo — HospitalInteractions (with Inheritance)
// =======================================================

// 🌿 Base Class: InteractionBase
// This defines shared functionality for interactive pages
class InteractionBase {
  constructor() {
    this.scrollReveal();
  }

  // ✨ Smooth scroll animation for any page
  scrollReveal() {
    if (typeof ScrollReveal !== "undefined") {
      ScrollReveal().reveal('.hospital-card', {
        duration: 1000,
        distance: '60px',
        origin: 'bottom',
        interval: 200,
        easing: 'ease-out'
      });
    }
  }

  // Shared utility function for creating comment elements
  createCommentElement(text) {
    const div = document.createElement('div');
    div.className = 'comment-item';
    div.textContent = `💭 ${text}`;
    return div;
  }
}

// 🏥 Child Class: HospitalInteractions (inherits from InteractionBase)
class HospitalInteractions extends InteractionBase {
  constructor() {
    super(); // inherits scrollReveal() + shared utilities
    this.toggleDetails();
    this.initRatings();
    this.initComments();
  }

  // 🩺 Show/Hide More Details
  toggleDetails() {
    document.querySelectorAll('.show-details-btn').forEach(button => {
      button.addEventListener('click', () => {
        const card = button.closest('.hospital-card');
        const extra = card.querySelector('.hospital-extra');
        extra.classList.toggle('hidden');
        button.textContent = extra.classList.contains('hidden')
          ? '🏥 Click here for more details'
          : '⬆️ Hide details';
      });
    });
  }

  // ⭐ Hospital Rating System
  initRatings() {
    document.querySelectorAll('.hospital-stars').forEach(starGroup => {
      const stars = starGroup.querySelectorAll('.star');
      const result = starGroup.parentElement.querySelector('.rating-result');

      stars.forEach(star => {
        star.addEventListener('click', () => {
          const value = star.dataset.value;
          stars.forEach(s => s.classList.remove('active'));
          for (let i = 0; i < value; i++) stars[i].classList.add('active');
          result.textContent = `You rated this hospital ${value} ★`;
        });
      });
    });
  }  
}

// Hospital Comments
document.querySelectorAll('.post-hospital-comment').forEach(btn => {
  btn.addEventListener('click', () => {
    const textarea = btn.previousElementSibling;
    const list = btn.nextElementSibling;
    const text = textarea.value.trim();

    if (text) {
      const div = document.createElement('div');
      div.className = 'comment-item';
      div.textContent = `💭 ${text}`;
      list.appendChild(div);
      textarea.value = '';
    } else {
      alert('Please enter a comment for this hospital!');
    }
  });
});
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
