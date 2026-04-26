document.addEventListener('DOMContentLoaded', () => {
    // Елементи панелі
    const barTextField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const loader = document.getElementById('bandura-bar-loader');
    
    // Елементи модалки
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');
    const voiceBtn = document.getElementById('btn-voice');
    const closeBtn = document.querySelector('.close-modal');

    let lastResult = "";
    let isSpeaking = false;

    // 1. АВТОМАТИЧНІ ПІДКАЗКИ (зміна placeholder)
    const idlePhrases = ["Питання є?", "Хто шукає, той находить!"];
    let phraseIdx = 0;
    setInterval(() => {
        if (!barTextField.value || idlePhrases.includes(barTextField.value)) {
            phraseIdx = (phraseIdx + 1) % idlePhrases.length;
            barTextField.placeholder = idlePhrases[phraseIdx];
            barTextField.value = ""; 
        }
    }, 8000);

    // 2. ФУНКЦІЯ ВІДКРИТТЯ МОДАЛКИ
    function openModal(text) {
        lastResult = text;
        modalText.innerText = text;
        modal.style.display = 'flex';
        document.body.classList.add('modal-open'); // Блокуємо скрол сайту
    }

    // 3. ФУНКЦІЯ ЗАКРИТТЯ МОДАЛКИ
    function closeModalFunc() {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open'); // Повертаємо скро
