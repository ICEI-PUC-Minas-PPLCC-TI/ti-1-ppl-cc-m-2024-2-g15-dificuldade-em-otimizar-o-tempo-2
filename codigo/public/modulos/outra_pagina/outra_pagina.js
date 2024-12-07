document.addEventListener('DOMContentLoaded', async () => {
    try {
        const headerResponse = await fetch('../../header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-container').innerHTML = headerHtml;
    } catch (error) {
        console.error('Erro ao carregar header:', error);
    }

    // ...existing code...
});