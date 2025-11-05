// Mobile menu functionality with Firebase login/logout management
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const mobileOverlay = document.querySelector('.mobile-overlay');
    const navLinks = document.querySelectorAll('.nav-menu li a');

    // Check if user is logged in
    function isLoggedIn() {
        return localStorage.getItem('isLoggedIn') === 'true';
    }

    // Update login/logout button
    function updateAuthButton() {
        const loginLink = document.querySelector('a[href="login.html"]');
        if (loginLink) {
            if (isLoggedIn()) {
                loginLink.textContent = 'Logout';
                loginLink.href = '#';
                loginLink.classList.add('logout-btn');
                // Add user email display if needed
                const userEmail = localStorage.getItem('userEmail');
                if (userEmail) {
                    // You can add a user info display here if desired
                }
            } else {
                loginLink.textContent = 'Login';
                loginLink.href = 'login.html';
                loginLink.classList.remove('logout-btn');
            }
        }
    }

    // Handle logout
    function handleNavbarLogout() {
        // Check if Firebase auth is available
        if (typeof handleLogout === 'function') {
            handleLogout(); // Use the Firebase logout function
        } else {
            // Fallback: clear localStorage and redirect
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userEmail');
            window.location.href = 'index.html';
        }
    }

    // Toggle mobile menu
    function toggleMenu() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        mobileOverlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    // Event listeners
    menuToggle.addEventListener('click', toggleMenu);
    mobileOverlay.addEventListener('click', toggleMenu);

    // Close menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Handle logout click
            if (link.classList.contains('logout-btn')) {
                e.preventDefault();
                handleNavbarLogout();
            }
            
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            toggleMenu();
        }
    });

    // Update active link based on current page
    function setActiveLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('href');
            if (linkPage === currentPage && !link.classList.contains('logout-btn')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Initialize
    updateAuthButton();
    setActiveLink();
});