document.addEventListener("DOMContentLoaded", function () {
    const apiUrl = '/usuarios';

    sessionStorage.setItem('userId', 1);

    const fullNameInput = document.getElementById("fullName");
    const birthDateInput = document.getElementById("birthDate");
    const emailInput = document.getElementById("email");

    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const editPersonalInfoButton = document.getElementById("editPersonalInfoButton");
    const savePersonalInfoButton = document.getElementById("savePersonalInfoButton");

    const editLoginInfoButton = document.getElementById("editLoginInfoButton");
    const saveLoginInfoButton = document.getElementById("saveLoginInfoButton");

    const deleteAccountButton = document.getElementById("deleteAccountButton");

    function displayMessage(mensagem) {
        const msg = document.getElementById('msg');
        msg.innerHTML = `<div class="alert alert-warning">${mensagem}</div>`;
    }

    const userId = sessionStorage.getItem('userId');
    if (!userId) {
        console.error('Erro: userId não encontrado no sessionStorage.');
    }



    function loadProfile() {
        fetch(apiUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Erro na requisição: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                if (data && data.length > 0) {
                    const user = data[userId];
                    fullNameInput.value = user.nome;
                    birthDateInput.value = user.dataNascimento;
                    emailInput.value = user.email;
                    usernameInput.value = user.login;
                    passwordInput.value = user.senha;
                } else {
                    console.error("Nenhum usuário encontrado.");
                    displayMessage("Nenhum usuário encontrado.");
                }
            })
            .catch(error => {
                console.error("Erro ao carregar os dados:", error);
                displayMessage("Erro ao carregar os dados");
            });
    }

    editPersonalInfoButton.addEventListener("click", function () {
        fullNameInput.disabled = !fullNameInput.disabled;
        birthDateInput.disabled = !birthDateInput.disabled;
        emailInput.disabled = !emailInput.disabled;
        editPersonalInfoButton.style.display = "none";
        savePersonalInfoButton.style.display = "inline-block";
    });

    savePersonalInfoButton.addEventListener("click", function () {
        const updatedData = {
            nome: fullNameInput.value,
            dataNascimento: birthDateInput.value,
            email: emailInput.value,
        };

        fetch(`${apiUrl}/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => response.json())
            .then(() => {
                displayMessage("Informações pessoais atualizadas com sucesso!");
                fullNameInput.disabled = true;
                birthDateInput.disabled = true;
                emailInput.disabled = true;
                editPersonalInfoButton.style.display = "inline-block";
                savePersonalInfoButton.style.display = "none";
            })
            .catch(error => {
                console.error("Erro ao salvar informações pessoais:", error);
                displayMessage("Erro ao salvar informações pessoais");
            });
    });

    editLoginInfoButton.addEventListener("click", function () {
        usernameInput.disabled = !usernameInput.disabled;
        passwordInput.disabled = !passwordInput.disabled;
        editLoginInfoButton.style.display = "none";
        saveLoginInfoButton.style.display = "inline-block";
    });

    saveLoginInfoButton.addEventListener("click", function () {
        const updatedData = {
            username: usernameInput.value,
            senha: passwordInput.value,
        };

        fetch(`${apiUrl}/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        })
            .then(response => response.json())
            .then(() => {
                displayMessage("Informações de login atualizadas com sucesso!");
                usernameInput.disabled = true;
                passwordInput.disabled = true;
                editLoginInfoButton.style.display = "inline-block";
                saveLoginInfoButton.style.display = "none";
            })
            .catch(error => {
                console.error("Erro ao salvar informações de login:", error);
                displayMessage("Erro ao salvar informações de login");
            });
    });

    deleteAccountButton.addEventListener("click", function () {

        fetch(`${apiUrl}/${userId}`, {
            method: 'DELETE',
            headers: {
                'Cache-Control': 'no-cache',
                "Content-Type": "application/json",
            },
        })
            .then(response => response.json())
            .then(() => {
                displayMessage("Conta removida com sucesso");
                setTimeout(() => {
                    window.location.href = "http://localhost:3000/modulos/login/login.html";
                }, 2000);
            })
            .catch(error => {
                console.error('Erro ao remover conta:', error);
                displayMessage("Erro ao remover conta");
            });
    });

    loadProfile();
});

function logoutUser() {
    sessionStorage.removeItem('usuarioCorrente');
    window.location = "/modulos/login/login.html";
}
