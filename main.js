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


// Gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    // Gallery filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all') {
                    item.style.display = 'block';
                    item.classList.add('show');
                } else {
                    const itemCategories = item.getAttribute('data-category').split(' ');
                    if (itemCategories.includes(filterValue)) {
                        item.style.display = 'block';
                        item.classList.add('show');
                    } else {
                        item.style.display = 'none';
                        item.classList.remove('show');
                    }
                }
            });
        });
    });

    // Video play functionality
    const videoItems = document.querySelectorAll('.video-item');
    
    videoItems.forEach(item => {
        const playBtn = item.querySelector('.video-play-btn');
        const thumbnail = item.querySelector('.video-thumbnail');
        const video = item.querySelector('.gallery-video');
        const overlay = item.querySelector('.gallery-overlay');

        if (playBtn && video) {
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // Hide thumbnail and show video
                thumbnail.style.display = 'none';
                video.style.display = 'block';
                overlay.style.opacity = '0';
                
                // Play video
                video.play();
                
                // Add event listener for when video ends
                video.addEventListener('ended', function() {
                    // Show thumbnail again and hide video
                    thumbnail.style.display = 'block';
                    video.style.display = 'none';
                    overlay.style.opacity = '';
                });
            });

            // Handle video click to pause/play
            video.addEventListener('click', function(e) {
                e.stopPropagation();
                if (video.paused) {
                    video.play();
                } else {
                    video.pause();
                }
            });
        }
    });

    // Gallery item click for lightbox (using existing lightbox functionality)
    const galleryImages = document.querySelectorAll('.gallery-image');
    
    galleryImages.forEach(image => {
        image.addEventListener('click', function(e) {
            // Only trigger lightbox for photo items, not video items
            const parentItem = this.closest('.gallery-item');
            if (!parentItem.classList.contains('video-item')) {
                e.preventDefault();
                openLightbox(this.src, this.alt);
            }
        });
    });

    // Enhanced lightbox functionality for gallery
    function openLightbox(src, alt) {
        // Check if lightbox already exists
        let lightbox = document.querySelector('.lightbox');
        
        if (!lightbox) {
            // Create lightbox if it doesn't exist
            lightbox = document.createElement('div');
            lightbox.className = 'lightbox';
            lightbox.innerHTML = `
                <div class="lightbox-content">
                    <span class="lightbox-close">&times;</span>
                    <img class="lightbox-image" src="" alt="">
                    <div class="lightbox-caption"></div>
                </div>
            `;
            document.body.appendChild(lightbox);
        }

        const lightboxImage = lightbox.querySelector('.lightbox-image');
        const lightboxCaption = lightbox.querySelector('.lightbox-caption');
        const closeBtn = lightbox.querySelector('.lightbox-close');

        // Set image and caption
        lightboxImage.src = src;
        lightboxImage.alt = alt;
        lightboxCaption.textContent = alt;

        // Show lightbox
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        // Close lightbox functionality
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
    }

    function closeLightbox() {
        const lightbox = document.querySelector('.lightbox');
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    // Smooth scroll animation for gallery items
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Apply animation to gallery items
    galleryItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
});

const form = document.getElementById('contactForm');
const modal = document.getElementById('sendOptionsModal');
const btnWhatsApp = document.getElementById('sendWhatsApp');
const btnEmail = document.getElementById('sendEmail');
const btnClose = document.getElementById('closeModal');

let fullMessage = ""; // mensaje preparado

form.addEventListener('submit', function(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const eventType = document.getElementById('event-type').value;
  const eventDate = document.getElementById('event-date').value;
  const message = document.getElementById('message').value.trim();

  if (!name || !email || !message) {
    alert('Por favor completa los campos obligatorios.');
    return;
  }

  fullMessage = 
`Nueva solicitud de cotización:
-------------------------
👤 Nombre: ${name}
📧 Email: ${email}
📞 Teléfono: ${phone || "No especificado"}
🎉 Tipo de Evento: ${eventType || "No especificado"}
📅 Fecha: ${eventDate || "No especificada"}
📝 Mensaje: ${message}`;

  modal.style.display = "flex"; // mostrar modal
});

// WhatsApp
btnWhatsApp.addEventListener('click', () => {
  const whatsappNumber = "18187145008";
  const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fullMessage)}`;
  window.open(url, '_blank');
  modal.style.display = "none";
  form.reset();
});

// Email
btnEmail.addEventListener('click', () => {
  const mailtoEmail = "stereotyposla@gmail.com";
  const subject = encodeURIComponent("Solicitud de Cotización");
  const body = encodeURIComponent(fullMessage);
  window.location.href = `mailto:${mailtoEmail}?subject=${subject}&body=${body}`;
  modal.style.display = "none";
  form.reset();
});

// Cerrar modal
btnClose.addEventListener('click', () => {
  modal.style.display = "none";
});
