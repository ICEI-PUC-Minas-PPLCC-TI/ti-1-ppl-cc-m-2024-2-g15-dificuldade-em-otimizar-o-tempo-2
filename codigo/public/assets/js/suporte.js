var usuarioCorrente = {};

window.onload = () => {
    usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    }
    fetch(`/usuarios?id=${usuarioCorrente.id}`);
}

(function () {
    emailjs.init("Ks27mHXoHCdkct1Vr");
})();

document.getElementById('feedbackForm').addEventListener('submit', function (event) {
    event.preventDefault();
    var radios = document.getElementsByName('tipoAjuda');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            var tipo_radio = radios[i].value;
            break;
        }
    }

    const templateParams = {
        message_type: tipo_radio,
        from_name: usuarioCorrente.nome,
        user_email: usuarioCorrente.email,
        subject: document.getElementById("assunto").value,
        message: document.getElementById("mensagem").value
    };

    emailjs.send('service_m6l7euo', 'template_5r0s015', templateParams)
        .then(function (response) {
            alert('Mensagem enviada com sucesso!');
        }, function (error) {
            alert('Erro ao enviar feedback: ' + JSON.stringify(error));
        });
    document.getElementById("assunto").value = "";
    document.getElementById("mensagem").value = "";
});

function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    window.location = "/modulos/login/login.html";
}

