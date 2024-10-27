(function () {
    emailjs.init("Ks27mHXoHCdkct1Vr");
})();

document.getElementById('feedbackForm').addEventListener('submit', function (event) {
    event.preventDefault(); 

    const templateParams = {
        assunto: document.getElementById('assunto').value,
        mensagem: document.getElementById('mensagem').value
    };

    emailjs.send('service_m6l7euo', 'template_5r0s015', templateParams)
        .then(function (response) {
            alert('Solicitação enviado com sucesso!');
        }, function (error) {
            alert('Erro ao enviar feedback: ' + JSON.stringify(error));
        });
});

