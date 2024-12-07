var usuarioCorrente = {};

function execucao() {
    usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    if (usuarioCorrenteJSON) {
        usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
    }
        fetch(`/cronograma?id=${usuarioCorrente.id}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache', // Impede o cache
            }
        })
          .then (response => response.json())
          .then (data => {
              carregarCronograma(data);
          })
          .catch (error => {
              alert ('Erro ao obter dados do servidor:' + error.message);
          })
  }

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const headerResponse = await fetch('../../header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-container').innerHTML = headerHtml;
    } catch (error) {
        console.error('Erro ao carregar header:', error);
    }

    execucao();
});

window.onload = () => {
    document.getElementById('btn_salvar').addEventListener('click', criarHorario);  
    execucao();
    /* fetch (`/cronograma?id=${usuarioCorrente.id}`)
    .then (response => response.json())
    .then (data => {

    })
    .catch (error => {
      alert ('Erro ao obter dados do servidor:' + error.message);
    }) */
  }

function carregarCronograma(data) {
    alert(JSON.stringify(data));
    let ids_array = Array.from(data.map(item => item.tarefas.ids)).flat();
    fetch(`/tarefas?id_usuario=${usuarioCorrente.id}`, {
        method: 'GET',
        headers: {
            'Cache-Control': 'no-cache',
        }
    })
    .then(response => response.json())
    .then(dataTasks => {
        tarefaModal(dataTasks);
        for (let i = 0; i < ids_array.length; i++) {
            alert(i);
            carregarTarefa(data, dataTasks, i);
        }
    })
    .catch(error => {
        alert('Erro ao obter dados do servidor 1: ' + error.message);
    });
}

function tarefaModal(dataTasks) {
    let tarefas = Array.from(dataTasks.map(item => item.nomeTarefa));
    let ids = Array.from(dataTasks.map(item => item.id));
    for(let i = 0; i < tarefas.length; i++) {
        let novaOpcao = document.createElement("option");
        novaOpcao.value = ids[i];
        novaOpcao.innerHTML = tarefas[i];
        document.getElementById("tasks").appendChild(novaOpcao);
    }

}

function valorCheckbox() {
    let checkboxes = document.getElementsByName('checkSem');
    const checkValues = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) {
            checkValues.push(checkboxes[i].value);
        }
    }
    return checkValues;
}

async function montarHorario(tarefa, diasCheck, horasInicio, minutosInicio, horasFim, minutosFim) {
    try {
        const response = await fetch(`/cronograma?id=${usuarioCorrente.id}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache', // Impede o cache
            }
        });

        const data = await response.json();

        // A lógica de montagem dos horários continua
        let idsAnt = data.flatMap(item => item.tarefas.ids);
        if (idsAnt.includes(tarefa)) {
            return; // Se já tiver o id, retorna sem fazer nada
        }
        idsAnt.push(parseInt(tarefa));

        let horariosInicio = data.flatMap(item => item.tarefas.horarios.inicio);
        let inicio = {
            hr: parseInt(horasInicio),
            min: parseInt(minutosInicio)
        };
        horariosInicio.push(inicio);

        let horariosFim = data.flatMap(item => item.tarefas.horarios.fim);
        let fim = {
            hr: parseInt(horasFim),
            min: parseInt(minutosFim)
        };
        horariosFim.push(fim);

        let diasDaSemana = data.flatMap(item => item.tarefas.horarios.diasSemana);
        diasCheck = diasCheck.map(Number); // Converte os valores para números
        let novosDias = {
            dias: diasCheck
        };
        diasDaSemana.push(novosDias);

        const novoHorario = {
            id: usuarioCorrente.id,
            tarefas: {
                ids: idsAnt,
                horarios: {
                    inicio: horariosInicio,
                    fim: horariosFim,
                    diasSemana: diasDaSemana
                }
            }
        };

        // Se você quiser confirmar a execução antes de retornar
        console.log("Novo horário montado dentro de montarHorario:", novoHorario);
        
        return novoHorario;
    } catch (error) {
        alert('Erro ao obter dados do servidor 2: ' + error.message);
    }
}



function inserirHorario(data, novoHorario) {
    alert(JSON.stringify(novoHorario));
    fetch(`/cronograma/${usuarioCorrente.id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
        },
        body: JSON.stringify(novoHorario),
    })
        .then(response => response.json())
        .then(data => {
                alert("Novo horário inserido com sucesso.");
                execucao(); 
        })
        .catch(error => {
            console.error('Erro ao atualizar cronograma via API JSONServer:', error);
            alert("Erro ao atualizar cronograma");
        });
}

async function criarHorario() {
    try {
        // Recupera o usuário atual da sessão
        const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
        if (usuarioCorrenteJSON) {
            usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
        }

        // Faz a requisição GET para obter os dados do cronograma
        const response = await fetch(`/cronograma?id=${usuarioCorrente.id}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache', // Impede o cache
            }
        });

        // Aguarda a resposta e converte os dados para JSON
        const data = await response.json();

        // Coleta os valores dos elementos HTML
        let tarefa = document.getElementById('tasks').value;
        let horarioInicio = document.getElementById('horarioInicio').value;
        let horarioFim = document.getElementById('horarioFim').value;
        let diasCheck = valorCheckbox();

        // Divide os horários em horas e minutos
        let horas = horarioInicio.split(":");
        let horasInicio = horas[0];
        let minutosInicio = horas[1];
        horas = horarioFim.split(":");
        let horasFim = horas[0];
        let minutosFim = horas[1];

        // Aqui, chamamos a função montarHorario e aguardamos o seu retorno
        const novoHorario = await montarHorario(tarefa, diasCheck, horasInicio, minutosInicio, horasFim, minutosFim);

        // Adiciona um alert para ver se novoHorario está correto
        alert("Novo horário montado: " + JSON.stringify(novoHorario));

        // Depois que novoHorario estiver montado, chamamos inserirHorario
        inserirHorario(data, novoHorario);

    } catch (error) {
        // Se ocorrer algum erro, exibe uma mensagem
        alert('Erro ao obter dados do servidor 3: ' + error.message);
    }
}


function carregarTarefa(data, dataTasks, i) {
    
    let dias = Array.from(data.map(item => item.tarefas.horarios.diasSemana[i].dias));
    alert(dias);
    //let horarios = Array.from(data.map(item => item.tarefas.horarios.inicio[i].hr + ":" + item.tarefas.horarios.inicio[i].min + " - "
    //   + item.tarefas.horarios.fim[i].hr + ":" + item.tarefas.horarios.fim[i].min));
    let horarios = Array.from(data.map(item => item.tarefas.horarios.inicio[i].hr + ":" + String(item.tarefas.horarios.inicio[i].min).padStart(2, '0') + " - "
       + item.tarefas.horarios.fim[i].hr + ":" + String(item.tarefas.horarios.fim[i].min).padStart(2, '0')));
    let nomes = Array.from(data.map(item => dataTasks.find(task => task.id === item.tarefas.ids[i])?.nomeTarefa));
    
    // tarefaHTML.className = "col";
    for(let i = 0; i < dias.length; i++) {
        dias[i].forEach(dia => {
            let tarefaHTML = document.createElement("div");
            let tarefaInfo = `${horarios[i]}\n${nomes[i]}`;
            tarefaHTML.innerHTML = `${tarefaInfo}`;
            document.getElementById(dia).appendChild(tarefaHTML);
        })
    }
    

}