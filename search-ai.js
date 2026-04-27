document.addEventListener('DOMContentLoaded', () => {
    const textField = document.getElementById('bandura-text-field');
    const banduraImg = document.getElementById('bandura-image');
    const modal = document.getElementById('result-modal');
    const modalText = document.getElementById('modal-text');

    async function performSearch(query) {
        if (!query || query.length < 2) return;

        banduraImg.src = 'bandura-thinking.png';
        textField.value = "Шукаю...";

        try {
            const response = await fetch('https://n8n.narodocnt.online/webhook/search-ai', {
                method: 'POST',
                mode: 'cors', // Додано примусовий CORS режим
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: query })
            });

            if (!response.ok) throw new Error('CORS or Server Error');

            const data = await response.json();
            const result = data.text || data.output || "Відповідь не знайдена";

            banduraImg.src = 'bandura-pointing.png';
            
            setTimeout(() => {
                modalText.innerText = result;
                modal.style.display = 'flex';
                document.body.style.overflow = 'hidden';
                banduraImg.src = 'bandura-idle.png';
                textField.value = "";
            }, 800);

        } catch (error) {
            console.error(error);
            banduraImg.src = 'bandura-idle.png';
            textField.value = "Помилка доступу (CORS)";
        }
    }

    document.getElementById('btn-search').onclick = () => performSearch(textField.value.trim());
    
    document.querySelector('.close-modal').onclick = () => {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        window.speechSynthesis.cancel();
    };
});
