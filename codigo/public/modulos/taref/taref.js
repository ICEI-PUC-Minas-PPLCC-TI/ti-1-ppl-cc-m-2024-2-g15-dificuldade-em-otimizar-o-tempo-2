document.addEventListener('DOMContentLoaded', async () => {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
    if (!usuario) return window.location.href = "/login.html";

    // Funções utilitárias
    const formatDate = date => date.dd === 0 ? 'Sem data' : 
        `${String(date.dd).padStart(2, '0')}/${String(date.mm).padStart(2, '0')}/${date.yyyy}`;

    const getDateObject = dateString => {
        if (!dateString) return { dd: 0, mm: 0, yyyy: 0 };
        const [yyyy, mm, dd] = dateString.split('-').map(Number);
        return { dd, mm, yyyy };
    };

    const dateToString = date => date.yyyy ? 
        `${date.yyyy}-${String(date.mm).padStart(2, '0')}-${String(date.dd).padStart(2, '0')}` : null;

    const getPriorityColor = priority => {
        switch (priority) {
            case 1: return '#dc3545'; // Alta - Vermelho
            case 2: return '#ffc107'; // Média - Amarelo
            case 3: return '#198754'; // Baixa - Verde
            default: return '#6c757d'; // Padrão - Cinza
        }
    };

    // Carregar header e atualizar nome do usuário
    try {
        const headerResponse = await fetch('../../header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-container').innerHTML = headerHtml;
        
        const userNameElement = document.getElementById('userName');
        if (userNameElement && usuario.nome) {
            userNameElement.textContent = `Tarefas de ${usuario.nome}`;
        }
    } catch (error) {
        console.error('Erro ao carregar header:', error);
    }

    // Atualizar nome do usuário
    const userNameElement = document.getElementById('userName');
    if (userNameElement && usuario.nome) {
        userNameElement.textContent = `Tarefas de ${usuario.nome}`;
    }

    // Inicializar calendário
    const calendar = new FullCalendar.Calendar(document.getElementById('calendar'), {
        initialView: 'dayGridMonth',
        locale: 'pt-br',
        height: 'auto',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek'
        },
        buttonText: {
            today: 'Hoje',
            month: 'Mês',
            week: 'Semana'
        },
        events: async (info, successCallback) => {
            try {
                const response = await fetch(`/tarefas?id_usuario=${usuario.id}`);
                const tasks = await response.json();
                const events = tasks.map(task => ({
                    title: task.nomeTarefa,
                    start: dateToString(task.dataInicio),
                    end: dateToString(task.dataFim),
                    backgroundColor: getPriorityColor(task.prioridade),
                    textColor: task.prioridade === 2 ? '#000' : '#fff',
                    borderColor: 'transparent'
                }));
                successCallback(events);
            } catch (error) {
                console.error('Erro ao carregar eventos:', error);
                successCallback([]);
            }
        }
    });

    calendar.render();

    // Controle de datas - Adicionar logo após a verificação do usuário
    const setupDateControls = () => {
        const dateTypes = ['Start', 'End'];
        dateTypes.forEach(type => {
            const checkbox = document.getElementById(`enable${type}Date`);
            const dateInput = document.getElementById(`task${type}Date`);
            
            if (checkbox && dateInput) {
                checkbox.addEventListener('change', (e) => {
                    console.log(`Checkbox ${type} alterado:`, e.target.checked);
                    dateInput.disabled = !e.target.checked;
                    if (!e.target.checked) {
                        dateInput.value = '';
                    }
                });
            } else {
                console.error(`Elementos de data ${type} não encontrados`);
            }
        });
    };

    // Chamar a configuração das datas imediatamente
    setupDateControls();

    // Função para atualizar nome do usuário
    const atualizarNomeUsuario = () => {
        const userNameElement = document.getElementById('userName');
        if (userNameElement && usuario.nome) {
            userNameElement.textContent = `Tarefas de ${usuario.nome}`;
            console.log('Nome do usuário atualizado:', usuario.nome);
        } else {
            console.error('Elemento não encontrado ou nome do usuário indefinido');
        }
    };

    // Handlers
    const loadTasks = () => {
        fetch(`/tarefas?id_usuario=${usuario.id}`)
            .then(res => res.json())
            .then(tasks => {
                const taskList = document.getElementById('taskList');
                taskList.innerHTML = '';
                tasks.forEach(task => taskList.appendChild(createTaskElement(task)));
            })
            .catch(err => console.error('Erro:', err));
    };

    const createTaskElement = (task) => {
        const li = document.createElement('li');
        li.className = `list-group-item task-item priority-${
            task.prioridade === 1 ? 'high' : 
            task.prioridade === 2 ? 'medium' : 'low'
        } ${task.concluido ? 'task-completed' : ''}`;
        
        const formatDate = date => date.dd === 0 ? 'Sem data' : `${String(date.dd).padStart(2, '0')}/${String(date.mm).padStart(2, '0')}/${date.yyyy}`;
        
        const taskContent = document.createElement('div');
        taskContent.className = 'task-content d-flex justify-content-between align-items-start w-100';
        
        const mainContent = document.createElement('div');
        mainContent.innerHTML = `
            <div class="task-title">${task.nomeTarefa}</div>
            <div class="task-details">
                <span class="task-category">${task.categoria}</span>
                <span class="task-dates">
                    ${formatDate(task.dataInicio) !== 'Sem data' ? `<i class="bi bi-calendar-event"></i> Início: ${formatDate(task.dataInicio)}` : ''}
                    ${formatDate(task.dataFim) !== 'Sem data' ? `<br><i class="bi bi-calendar-check"></i> Fim: ${formatDate(task.dataFim)}` : ''}
                </span>
            </div>
        `;
        
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        // Array com as ações disponíveis
        const actionButtons = [
            {
                name: 'Concluir',
                icon: 'check-circle',  // Alterado aqui
                class: 'outline-success',
                action: () => completeTask(task)
            },
            {
                name: 'Editar',
                icon: 'pencil',
                class: 'outline-warning',
                action: () => editTask(task)
            },
            {
                name: 'Remover',
                icon: 'trash',
                class: 'outline-danger',
                action: () => deleteTask(task)
            }
        ];

        // Criar botões de ação
        actionButtons.forEach(({name, icon, class: btnClass, action}) => {
            const btn = document.createElement('button');
            btn.className = `btn btn-${btnClass} btn-sm me-1`;
            btn.innerHTML = `<i class="bi bi-${icon}"></i>`; // Removido o -fill
            btn.title = name;
            btn.onclick = action;
            // Desabilitar botões de editar e concluir se a tarefa já estiver concluída
            if ((name === 'Editar' || name === 'Concluir') && task.concluido) {
                btn.disabled = true;
            }
            actions.appendChild(btn);
        });
        
        taskContent.appendChild(mainContent);
        taskContent.appendChild(actions);
        li.appendChild(taskContent);
        return li;
    };

    // Função para concluir tarefa
    const completeTask = (task) => {
        if (confirm(`Deseja marcar a tarefa "${task.nomeTarefa}" como concluída?`)) {
            const now = new Date();
            const dataConclusao = {
                dd: now.getDate(),
                mm: now.getMonth() + 1,
                yyyy: now.getFullYear()
            };

            fetch(`/tarefas/${task.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...task,
                    concluido: 1,
                    dataConclusao
                })
            })
            .then(() => {
                loadTasks();
                calendar.refetchEvents(); // Atualizar o calendário
            })
            .catch(err => console.error('Erro ao concluir tarefa:', err));
        }
    };

    // Função para editar tarefa
    const editTask = (task) => {
        console.log('Editar tarefa:', task);
        // Preencher o formulário com os dados da tarefa
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskName').value = task.nomeTarefa;
        document.getElementById('taskCategory').value = task.categoria;
        document.getElementById('taskPriority').value = task.prioridade;
        
        if (task.dataInicio.dd !== 0) {
            document.getElementById('enableStartDate').checked = true;
            document.getElementById('taskStartDate').disabled = false;
            document.getElementById('taskStartDate').value = dateToString(task.dataInicio);
        } else {
            document.getElementById('enableStartDate').checked = false;
            document.getElementById('taskStartDate').disabled = true;
            document.getElementById('taskStartDate').value = '';
        }
        
        if (task.dataFim.dd !== 0) {
            document.getElementById('enableEndDate').checked = true;
            document.getElementById('taskEndDate').disabled = false;
            document.getElementById('taskEndDate').value = dateToString(task.dataFim);
        } else {
            document.getElementById('enableEndDate').checked = false;
            document.getElementById('taskEndDate').disabled = true;
            document.getElementById('taskEndDate').value = '';
        }
        
        // Alterar o texto do botão para "Salvar Alterações"
        document.querySelector('#taskForm button[type="submit"]').textContent = 'Salvar Alterações';
        
        // Rolar a página até o formulário
        document.querySelector('#taskForm').scrollIntoView({ behavior: 'smooth' });
    };

    // Função para limpar o formulário
    const resetForm = () => {
        document.getElementById('taskForm').reset();
        document.getElementById('taskId').value = '';
        document.getElementById('taskStartDate').disabled = true;
        document.getElementById('taskEndDate').disabled = true;
        document.querySelector('#taskForm button[type="submit"]').textContent = 'Adicionar Tarefa';
    };

    // Função para excluir tarefa
    const deleteTask = (task) => {
        console.log('Excluir tarefa:', task);
        if (confirm(`Tem certeza que deseja excluir a tarefa "${task.nomeTarefa}"?`)) {
            fetch(`/tarefas/${task.id}`, {
                method: 'DELETE'
            })
            .then(() => {
                loadTasks();
            })
            .catch(err => console.error('Erro ao excluir tarefa:', err));
        }
    };

    // Event Listeners
    document.getElementById('taskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const taskId = document.getElementById('taskId').value;
        const formData = {
            id_usuario: usuario.id,
            nomeTarefa: document.getElementById('taskName').value,
            categoria: document.getElementById('taskCategory').value,
            prioridade: parseInt(document.getElementById('taskPriority').value),
            dataInicio: document.getElementById('enableStartDate').checked ? 
                getDateObject(document.getElementById('taskStartDate').value) :
                { dd: 0, mm: 0, yyyy: 0 },
            dataFim: document.getElementById('enableEndDate').checked ?
                getDateObject(document.getElementById('taskEndDate').value) :
                { dd: 0, mm: 0, yyyy: 0 },
            dataConclusao: null,
            concluido: 0,
            tempoGasto: { hr: 0, min: 0 }
        };

        const method = taskId ? 'PUT' : 'POST';
        const url = taskId ? `/tarefas/${taskId}` : '/tarefas';

        fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        .then(() => {
            loadTasks();
            resetForm();
        })
        .catch(err => console.error('Erro:', err));
    });

    // Inicialização
    loadTasks();

    // Garante que o nome seja atualizado mesmo se o header falhar
    atualizarNomeUsuario();
});