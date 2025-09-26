const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("toggle"); // si quieres animar el ícono
});

// Espera a que el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Evita el envío normal del formulario

            const name = encodeURIComponent(document.getElementById('name').value);
            const email = encodeURIComponent(document.getElementById('email').value);
            const phone = encodeURIComponent(document.getElementById('phone').value);
            const eventType = encodeURIComponent(document.getElementById('event-type').value);
            const eventDate = encodeURIComponent(document.getElementById('event-date').value);
            const message = encodeURIComponent(document.getElementById('message').value);

            const whatsappNumber = '5491123456789'; // Cambia por tu número

            const whatsappMessage = `Hola! Quiero solicitar una cotización para: *${eventType}*\n\n` +
                                    `*Nombre:* ${name}\n` +
                                    `*Email:* ${email}\n` +
                                    `*Teléfono:* ${phone}\n` +
                                    `*Fecha del Evento:* ${eventDate}\n` +
                                    `*Mensaje:* ${message}`;

            window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank');

            // Opcional: limpiar el formulario después de enviar
            contactForm.reset();
        });
    }
});
