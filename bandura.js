const bandura = document.querySelector('.bandura-standalone-avatar');
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

// Події для мишки
bandura.addEventListener("mousedown", dragStart);
window.addEventListener("mousemove", drag);
window.addEventListener("mouseup", dragEnd);

// Події для сенсорних екранів (мобільні)
bandura.addEventListener("touchstart", dragStart, { passive: false });
window.addEventListener("touchmove", drag, { passive: false });
window.addEventListener("touchend", dragEnd);

function dragStart(e) {
    if (e.type === "touchstart") {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
    } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
    }
    
    if (e.target === bandura || bandura.contains(e.target)) {
        isDragging = true;
    }
}

function drag(e) {
    if (isDragging) {
        e.preventDefault(); // Запобігає скролу сторінки під час руху

        if (e.type === "touchmove") {
            currentX = e.touches[0].clientX - initialX;
            currentY = e.touches[0].clientY - initialY;
        } else {
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
        }

        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, bandura);
    }
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
    
    // Тут можна додати логіку "повернення" або "притягування" до країв
    snapToEdges();
}

function snapToEdges() {
    // Якщо хочете, щоб вона завжди поверталася в куток, 
    // розкоментуйте код нижче (але зазвичай користувачам подобається, коли вона лишається де поклали)
    /*
    xOffset = 0;
    yOffset = 0;
    bandura.style.transition = "transform 0.5s ease";
    setTranslate(0, 0, bandura);
    setTimeout(() => { bandura.style.transition = "transform 0.2s ease"; }, 500);
    */
}
