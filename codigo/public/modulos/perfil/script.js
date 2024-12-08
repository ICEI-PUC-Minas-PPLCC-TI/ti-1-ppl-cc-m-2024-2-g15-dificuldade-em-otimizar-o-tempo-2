var usuarioCorrente = {};

document.addEventListener("DOMContentLoaded", function () {
    

    const fullNameInput = document.getElementById("fullName");
    const emailInput = document.getElementById("email");

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const editInfoButton = document.getElementById("editInfoButton");
    const saveInfoButton = document.getElementById("saveInfoButton");

    const deleteAccountButton = document.getElementById("deleteAccountButton");

    usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    }

    const userId = usuarioCorrente.id;
    if (!userId) {
        console.error('Erro: userId não encontrado no sessionStorage.');
    }

    const apiUrl = `/usuarios?id=${userId}`;
    const putUrl = `/usuarios/${userId}`;



    function loadProfile() {
        fetch(apiUrl , {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache', // Impede o cache
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                    data = data[0];
                    fullNameInput.value = data.nome;
                    emailInput.value = data.email;
                    usernameInput.value = data.login;
                    passwordInput.value = data.senha;

            })
            .catch(error => {
                console.error("Erro ao carregar os dados:", error);
            });
    }

    editInfoButton.addEventListener("click", function () {
        fullNameInput.disabled = !fullNameInput.disabled;
        emailInput.disabled = !emailInput.disabled;
        usernameInput.disabled = !usernameInput.disabled;
        passwordInput.disabled = !passwordInput.disabled;
        editInfoButton.style.display = "none";
        saveInfoButton.style.display = "inline-block";
    });

    saveInfoButton.addEventListener("click", function () {
        const updatedData = {
            nome: fullNameInput.value,
            email: emailInput.value,
            login: usernameInput.value,
            senha: passwordInput.value
        };

        fetch(`${putUrl}`, {
            method: "PUT",
            headers: {
                'Cache-Control': 'no-cache',
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => response.json())
            .then(() => {
                fullNameInput.disabled = true;
                emailInput.disabled = true;
                usernameInput.disabled = true;
                passwordInput.disabled = true;
                editInfoButton.style.display = "inline-block";
                saveInfoButton.style.display = "none";
            })
            .catch(error => {
                console.error("Erro ao salvar informações do perfil:", error);
            });
    });

    deleteAccountButton.addEventListener("click", function () {

        fetch(`${putUrl}`, {
            method: 'DELETE',
            headers: {
                'Cache-Control': 'no-cache',
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(() => {
                setTimeout(() => {
                    window.location.href = "http://localhost:3000/modulos/login/login.html";
                }, 2000);
            })
            .catch(error => {
                console.error('Erro ao remover conta:', error);
            });
    });

    loadProfile();
});

function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    window.location = "/modulos/login/login.html";
}
