const urlBase = "https://backend-jogadores-1qxs.vercel.app/";

async function carregaJogadores() {
  const tabela = document.getElementById("dadosTabela");
  tabela.innerHTML = ""; //limpa antes de recarregar
  //Faremos a requisição GET para a nossa API REST
  await fetch(`${urlBase}/jogadores`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // console.table(data)
      data.forEach((jogador) => {
        tabela.innerHTML += `
            <tr>
              <td>${jogador.nome}</td>
              <td>${jogador.numero_camisa}</td>
              <td>${jogador.posicao}</td>
              <td>${jogador.time}</td>
              <td>
                <button class='btn btn-danger btn-sm' onclick='removeJogador("${jogador._id}")'>
                  🗑 
                </button>
              </td>
              <td>
                <button class='btn btn-success btn-sm' onclick='editaJogador("${jogador._id}")'>
                  ✏️ 
                </button>
              </td>
            </tr>
            `;
      });
    });
}

async function removeJogador(id) {
  if (confirm("Deseja realmente excluir este jogador?")) {
    await fetch(`${urlBase}/jogadores/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.deletedCount > 0) {
          carregaJogadores(); //atualizamos a UI
        }
      })
      .catch((error) => {
        alert(error.message);
        // document.getElementById(
        //   "mensagem"
        // ).innerHTML = `Erro ao remover o jogador: ${error.message}`;
        // resultadoModal.show(); //exibe o modal com o erro
      });
  }
}

function editaJogador(id) {
  let url = new URL(
    "https://backend-jogadores-1qxs.vercel.app/jogadoresUpdate.html"
  );
  url.searchParams.append("id", id);
  window.location.href = url.href;
}
