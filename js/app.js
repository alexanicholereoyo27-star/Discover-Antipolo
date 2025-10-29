// app.js

// Hero Animation Class
class HeroAnimation {
  constructor() {
    this.heroText = document.querySelector('.hero-content h1');
    if (this.heroText) {
      this.fadeIn();
    }
  }

  fadeIn() {
    this.heroText.style.transition = 'all 1.5s ease';
    this.heroText.style.opacity = 1;
  }
}

// Mobile Navigation Class - UPDATED FOR CURRENT HTML STRUCTURE
class MobileNavigation {
  constructor() {
    // Updated selectors to match your current HTML structure
    this.menuToggle = document.querySelector('.menu-toggle');
    this.navMenu = document.querySelector('.navbar ul'); // Changed from .nav-menu
    this.mobileOverlay = document.querySelector('.mobile-overlay');
    this.navLinks = document.querySelectorAll('.navbar ul li a'); // Updated selector
    this.isMenuOpen = false;
    
    this.init();
  }

  init() {
    // Create mobile overlay if it doesn't exist
    if (!this.mobileOverlay && this.menuToggle) {
      this.createMobileOverlay();
    }

    // Add event listeners if elements exist
    if (this.menuToggle && this.navMenu) {
      this.menuToggle.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.toggleMenu();
      });
    }

    if (this.mobileOverlay) {
      this.mobileOverlay.addEventListener('click', () => this.toggleMenu());
    }

    // Close menu when clicking on navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        if (this.navMenu && this.navMenu.classList.contains('active')) {
          this.toggleMenu();
        }
        // Don't prevent default - let the link navigate normally
      });
    });

    // Close menu when clicking anywhere outside the menu
    document.addEventListener('click', (e) => {
      if (this.isMenuOpen && 
          !this.navMenu.contains(e.target) && 
          !this.menuToggle.contains(e.target)) {
        this.closeMenu();
      }
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.navMenu && this.navMenu.classList.contains('active')) {
        this.toggleMenu();
      }
    });

    // Close menu when window is resized to desktop size
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && this.navMenu && this.navMenu.classList.contains('active')) {
        this.closeMenu();
      }
    });

    // Set active link based on current page
    this.setActiveLink();
  }

  createMobileOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'mobile-overlay';
    // Alternative Quick Fix: Set overlay styles to prevent blocking clicks when inactive
    overlay.style.cssText = `
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      z-index: 998;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    document.querySelector('.navbar').appendChild(overlay);
    this.mobileOverlay = overlay;
  }

  toggleMenu() {
    if (!this.menuToggle || !this.navMenu || !this.mobileOverlay) return;
    
    this.menuToggle.classList.toggle('active');
    this.navMenu.classList.toggle('active');
    
    // Alternative Quick Fix: Only show overlay when menu is active
    if (this.navMenu.classList.contains('active')) {
      this.mobileOverlay.style.display = 'block';
      setTimeout(() => {
        this.mobileOverlay.style.opacity = '1';
      }, 10);
      document.body.style.overflow = 'hidden';
    } else {
      this.mobileOverlay.style.opacity = '0';
      setTimeout(() => {
        this.mobileOverlay.style.display = 'none';
      }, 300);
      document.body.style.overflow = '';
    }
    
    this.isMenuOpen = this.navMenu.classList.contains('active');
  }

  closeMenu() {
    if (!this.menuToggle || !this.navMenu || !this.mobileOverlay) return;
    
    this.menuToggle.classList.remove('active');
    this.navMenu.classList.remove('active');
    
    // Alternative Quick Fix: Hide overlay completely
    this.mobileOverlay.style.opacity = '0';
    setTimeout(() => {
      this.mobileOverlay.style.display = 'none';
    }, 300);
    
    this.isMenuOpen = false;
    document.body.style.overflow = '';
  }

  setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    this.navLinks.forEach(link => {
      const linkPage = link.getAttribute('href');
      
      // Remove active class from all links first
      link.classList.remove('active');
      
      // Add active class to current page link
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
      
      // Special case for index.html (home page)
      if ((currentPage === '' || currentPage === 'index.html') && linkPage === 'index.html') {
        link.classList.add('active');
      }
    });
  }
}

// Fix for Explore Now button and other external links
class LinkHandler {
  constructor() {
    this.init();
  }

  init() {
    // Remove any global click handlers that might interfere
    // The navigation class now handles menu closing properly
    
    // Ensure all buttons and links work normally
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      // If it's the Explore Now button or any regular link/button
      if (target.matches('.btn[href], a[href]') || target.closest('.btn[href], a[href]')) {
        const link = target.matches('a[href], .btn[href]') ? target : target.closest('a[href], .btn[href]');
        
        // Allow normal navigation for all external links
        if (link && !link.getAttribute('href').startsWith('#')) {
          // Let the browser handle the navigation naturally
          return;
        }
      }
    });
  }
}

// Smooth Scroll Functionality
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    // Add smooth scrolling to all anchor links (internal page links starting with #)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        // Only prevent default for same-page anchor links
        if (this.getAttribute('href').startsWith('#')) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }
        // External links (like destination.html) will work normally
      });
    });
  }
}

// Page Loader (optional)
class PageLoader {
  constructor() {
    this.init();
  }

  init() {
    // Remove loading state if any
    window.addEventListener('load', () => {
      document.body.classList.add('loaded');
    });
  }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Hero Animation
  new HeroAnimation();
  
  // Initialize Mobile Navigation
  new MobileNavigation();
  
  // Initialize Link Handler (fix for Explore Now button)
  new LinkHandler();
  
  // Initialize Smooth Scroll
  new SmoothScroll();
  
  // Initialize Page Loader
  new PageLoader();
  
  console.log('Discover Antipolo - All systems loaded!');
});

// Additional utility functions
const AppUtils = {
  // Debounce function for resize events
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Check if device is mobile
  isMobileDevice() {
    return window.innerWidth <= 768;
  },

  // Add loading state to buttons
  addButtonLoader(button) {
    const originalText = button.innerHTML;
    button.innerHTML = '<span class="loading-spinner"></span> Loading...';
    button.disabled = true;
    
    return {
      reset: () => {
        button.innerHTML = originalText;
        button.disabled = false;
      }
    };
  },

  // Format date for comments/memories
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Show notification message
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
      color: white;
      border-radius: 5px;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
};

// Add CSS for notifications
const notificationStyles = `
@keyframes slideInRight {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOutRight {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 8px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

body:not(.loaded) * {
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
  
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

// Inject notification styles
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HeroAnimation,
    MobileNavigation,
    SmoothScroll,
    PageLoader,
    AppUtils
  };
}