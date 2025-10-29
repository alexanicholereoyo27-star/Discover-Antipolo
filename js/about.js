// 💚 About Page Animation
document.addEventListener("DOMContentLoaded", () => {
  ScrollReveal().reveal('.about-text, .about-image, .team-card, .contact-section', {
    duration: 1000,
    distance: '60px',
    origin: 'bottom',
    interval: 200,
    easing: 'ease-out'
  });
});
ScrollReveal().reveal('.collage-item', {
  duration: 1000,
  distance: '50px',
  origin: 'bottom',
  interval: 150,
  easing: 'ease-out'
});
