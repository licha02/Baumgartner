// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        document.querySelectorAll('.nav-menu a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Lightbox functionality
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = document.querySelector('.lightbox-content img');
    const closeBtn = document.querySelector('.lightbox .close');

    // Open lightbox when clicking on gallery images
    document.querySelectorAll('.gallery-item img, .member-photo').forEach(img => {
        img.addEventListener('click', function() {
            if (lightbox && lightboxImg) {
                lightbox.style.display = 'block';
                lightboxImg.src = this.src;
                lightboxImg.alt = this.alt;
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // Close lightbox
    if (closeBtn && lightbox) {
        closeBtn.addEventListener('click', function() {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        });

        // Close lightbox when clicking outside the image
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
    }

    // Contact Form Validation and Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                eventType: formData.get('event-type'),
                eventDate: formData.get('event-date'),
                message: formData.get('message')
            };

            // Basic validation
            if (!data.name || !data.email || !data.message) {
                showNotification('Por favor completa todos los campos obligatorios.', 'error');
                return;
            }

            if (!isValidEmail(data.email)) {
                showNotification('Por favor ingresa un email válido.', 'error');
                return;
            }

            // Show loading state
            const submitBtn = contactForm.querySelector('.submit-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'ENVIANDO...';
            submitBtn.disabled = true;

            // Submit to Strapi (when backend is ready)
            submitContactForm(data)
                .then(response => {
                    showNotification('¡Mensaje enviado exitosamente! Te contactaremos pronto.', 'success');
                    contactForm.reset();
                })
                .catch(error => {
                    console.error('Error:', error);
                    showNotification('Error al enviar el mensaje. Por favor intenta nuevamente.', 'error');
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Load dynamic content from Strapi
    loadBandInfo();
    loadServices();
    loadSocialMedia();
});

// Email validation function
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        max-width: 400px;
        animation: slideIn 0.3s ease;
    `;

    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                margin-left: auto;
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// API Functions for Strapi integration
async function submitContactForm(data) {
    try {
        const response = await fetch('/api/contact-forms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ data })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        // Fallback: send email using mailto (temporary solution)
        const subject = encodeURIComponent(`Solicitud de cotización - ${data.eventType || 'Evento'}`);
        const body = encodeURIComponent(`
Nombre: ${data.name}
Email: ${data.email}
Teléfono: ${data.phone || 'No proporcionado'}
Tipo de evento: ${data.eventType || 'No especificado'}
Fecha del evento: ${data.eventDate || 'No especificada'}

Mensaje:
${data.message}
        `);
        
        window.location.href = `mailto:info@banda.com?subject=${subject}&body=${body}`;
        throw error;
    }
}

async function loadBandInfo() {
    try {
        const response = await fetch('/api/band-infos');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            const bandInfo = data.data[0].attributes;
            updateBandInfo(bandInfo);
        }
    } catch (error) {
        console.log('Using fallback band info');
        // Fallback content is already in HTML
    }
}

async function loadServices() {
    try {
        const response = await fetch('/api/services');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            updateServices(data.data);
        }
    } catch (error) {
        console.log('Using fallback services');
        // Fallback content is already in HTML
    }
}

async function loadSocialMedia() {
    try {
        const response = await fetch('/api/social-medias');
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
            updateSocialMedia(data.data);
        }
    } catch (error) {
        console.log('Using fallback social media');
        // Fallback content is already in HTML
    }
}

// Update functions for dynamic content
function updateBandInfo(bandInfo) {
    const heroTitle = document.querySelector('.hero-content h1');
    const heroDescription = document.querySelector('.hero-content p');
    
    if (heroTitle && bandInfo.name) {
        heroTitle.textContent = bandInfo.name;
    }
    
    if (heroDescription && bandInfo.description) {
        heroDescription.textContent = bandInfo.description;
    }
}

function updateServices(services) {
    const servicesGrid = document.querySelector('.services-grid');
    if (!servicesGrid) return;
    
    servicesGrid.innerHTML = '';
    
    services.forEach(service => {
        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <button class="service-btn">${service.attributes.title}</button>
            <p style="color: #ccc; margin-top: 1rem;">${service.attributes.description}</p>
        `;
        servicesGrid.appendChild(serviceCard);
    });
}

function updateSocialMedia(socialMedia) {
    const socialIcons = document.querySelector('.social-icons');
    if (!socialIcons) return;
    
    socialIcons.innerHTML = '';
    
    socialMedia.forEach(social => {
        const socialIcon = document.createElement('a');
        socialIcon.href = social.attributes.url;
        socialIcon.className = 'social-icon';
        socialIcon.target = '_blank';
        socialIcon.textContent = social.attributes.icon || '🔗';
        socialIcons.appendChild(socialIcon);
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .member-card, .timeline-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});