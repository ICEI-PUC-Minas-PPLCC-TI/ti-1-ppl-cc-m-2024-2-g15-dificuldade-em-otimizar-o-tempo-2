// ------------------------------------------------
        // Define a estrutura de dados a ser utilizada na aplicação e obtida
        // através de uma requisição ao servidor JSONServer
        // ------------------------------------------------
        // const lancamentos = [
        //     { "mes": "jan-24", "categoria": "Alimentação", "valor": 500.00 },
        //     { "mes": "jan-24", "categoria": "Transporte", "valor": 200.00 },
        //     { "mes": "jan-24", "categoria": "Lazer", "valor": 300.00 },
        //     { "mes": "fev-24", "categoria": "Alimentação", "valor": 450.00 },
        //     { "mes": "fev-24", "categoria": "Transporte", "valor": 180.00 },
        //     { "mes": "fev-24", "categoria": "Lazer", "valor": 350.00 },
        //     { "mes": "mar-24", "categoria": "Alimentação", "valor": 600.00 },
        //     { "mes": "mar-24", "categoria": "Transporte", "valor": 250.00 },
        //     { "mes": "mar-24", "categoria": "Lazer", "valor": 400.00 }
        // ];
    
        // ------------------------------------------------
        // Aguarda o carregamento da página para montar o gráfico
        var usuarioCorrente = {};
        var numeroSemana = 0;

        function passarSemana(num) {
          numeroSemana += 7 * num;
          if(Chart.getChart(document.getElementById('divBarChart'))) {
            Chart.getChart(document.getElementById('divBarChart'))?.destroy()
          }
          execucao();
        }

        function execucao() {
          if(numeroSemana == 0) {
            document.getElementById("botaoPassada").disabled = false;
            document.getElementById("botaoAtual").disabled = true;
          } else {
            document.getElementById("botaoPassada").disabled = true;
            document.getElementById("botaoAtual").disabled = false;
          }
          usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
          if (usuarioCorrenteJSON) {
              usuarioCorrente = JSON.parse(usuarioCorrenteJSON);
          }
            fetch (`/tarefas?id_usuario=${usuarioCorrente.id}`, {
              method: 'GET',
              headers: {
                  'Cache-Control': 'no-cache', // Impede o cache
              }
            })
                .then (response => response.json())
                .then (data => {
                    createBarChart(data);
                    calcConclusao(data);
                    
                    // createPieChart(data);
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
      
          // ...existing code...
          execucao();
          fetch (`/tarefas?id_usuario=${usuarioCorrente.id}`, {
            method: 'GET',
            headers: {
                'Cache-Control': 'no-cache', // Impede o cache
            }
          })
          .then (response => response.json())
          .then (data => {
          tempoGasto(data)
          concluidasHoje(data)
          })
          .catch (error => {
            alert ('Erro ao obet dados do servidro:' + error.message);
          })
        });

        function createBarChart(data) {
            // ------------------------------------------------
            // Agrupa os dados por mês e categoria para serem utilizados no gráfico
            
            const diaSemana = ["Dom", "Seg","Ter","Qua","Qui","Sex","Sab"];

            // Obter a data atual
            const hoje = new Date();
            
            // Calcular o início da semana atual (domingo) e o início da semana passada
            const inicioSemanaAtual = new Date(hoje);
            inicioSemanaAtual.setDate(hoje.getDate() - hoje.getDay());

            const inicioSemanaPassada = new Date(inicioSemanaAtual);
            inicioSemanaPassada.setDate(inicioSemanaAtual.getDate() - numeroSemana);

            const filtroSemana = data.filter(item => {
              const dataConclusao = new Date(item.dataConclusao.yyyy, item.dataConclusao.mm - 1, item.dataConclusao.dd);
              if(numeroSemana != 0) {
                return dataConclusao < inicioSemanaAtual;
              } else {
                return dataConclusao >= inicioSemanaPassada;
              }
            });
            // const dataConclusao = new Date(data.dataConclusao).getDay;
            const dataString = Array.from(filtroSemana.map(item => new Date(item.dataConclusao.yyyy + "/" + item.dataConclusao.mm + "/" + item.dataConclusao.dd)));
            // const dias = Array.from(new Set(dataString.map(item => diaSemana[item.getDay()])));
            const dias = diaSemana.slice();
            
            const categorias = Array.from(new Set(data.map(item => item.categoria)));
            
            const dadosPorDia = dias.map(diaCat => {
              const valoresPorCategoria = categorias.map(categoria => {
                const valor = filtroSemana.filter(item => diaSemana[new Date(item.dataConclusao.yyyy + "/" + item.dataConclusao.mm + "/" + item.dataConclusao.dd).getDay()]
                 === diaCat && item.categoria === categoria)
                                   .reduce((acc, curr) => acc + curr.concluido, 0);
                //alert(diaSemana[new Date(item.dataConclusao.yyyy + "-" + item.dataConclusao.mm + "-" + item.dataConclusao.dd).getDay()]);
                return valor;
              });
              return {
                dataConclusao: dias,
                valores: valoresPorCategoria
              };
            });
            // ------------------------------------------------
            // Monta o gráfico utilizando a API do ChartJS

            const cores = [
                'rgba(255, 99, 132)',
                'rgba(54, 162, 235)',
                'rgba(255, 206, 86)',
              ]
            /*  
                'rgba(75, 192, 192)',
                'rgba(153, 102, 255)',
                'rgba(255, 159, 64)'
                ];
            */            
            const ctx = document.getElementById('divBarChart');
            const divBarChart = new Chart(ctx, {
              type: 'line',
              data: {
                labels: dias,
                datasets: categorias.map((categoria, index) => {
                    return {
                        label: categoria,
                        data: dadosPorDia.map(item => item.valores[index]),
                        backgroundColor: cores[index],
                        borderColor: cores[index],
                        borderWidth: 4
                    };
                })
              },
              options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            stacked: false
                        },
                        x: {
                            stacked: false
                        }
                    }
              }
            });
        }

        function calcConclusao(data) {
          let tarefasConcluidas = 0;
          for(let i = 0; i < data.length; i++) {
              if(data[i].concluido === 1) {
                  tarefasConcluidas++;
              }
          }
          let porcentagem = (tarefasConcluidas/(data.length)) * 100;
          const barra = document.getElementById("barraProgresso");
          barra.setAttribute("aria-valuenow", porcentagem);
          barra.style.width = porcentagem + "%"; 
          const fracao = document.getElementById("fracaoProgresso");
          fracao.innerHTML = tarefasConcluidas + "/" + data.length;
      }

      function concluidasHoje(data) {
        const dataString = Array.from(data.map(item => new Date(item.dataConclusao.yyyy + "/" + item.dataConclusao.mm + "/" + item.dataConclusao.dd)));
        const hoje = document.getElementById("hojeProgresso");
        if(hoje.textContent === '') {
          hoje.textContent = 0;
        }
        let qtdConcluidas = Number(hoje.textContent);
        for(let i = 0; i < dataString.length; i++) {
          if(dataString[i].toDateString() == new Date().toDateString()) {
              qtdConcluidas++;
          }
        }
        if(Number(hoje.textContent) < qtdConcluidas) {
          hoje.textContent = qtdConcluidas;
          hoje.innerHTML += "<img src='../../assets/images/blueTriangle.png'/>";
        }
        else if(Number(hoje.textContent) > qtdConcluidas) {
          hoje.textContent = qtdConcluidas;
          hoje.innerHTML += "<img src='../../assets/images/redTriangle.png'/>";
          alert(qtdConcluidas);
        }
        else{
          hoje.textContent = qtdConcluidas;
        }
      }

      function tempoGasto(data) {
        const categorias = Array.from(new Set(data.map(item => item.categoria)));
        const horasPorCategoria = categorias.map(categoria => {
          const horas = data.filter(item => item.categoria === categoria)
                             .reduce((acc, curr) => acc + curr, 0);
          return horas;
        });
        let divCategoria = document.getElementById("tempoGastoCategoria");
        for(let i = 0; i < categorias.length; i++) {
          divCategoria.innerHTML += categorias[i] + "<br>";
        }
      }