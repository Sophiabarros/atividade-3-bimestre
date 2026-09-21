// usado pela página apagar.html
const estado = document.querySelector("#estado")
const confirmacao = document.querySelector("#confirmacao")
const ingresso = document.querySelector("#ingresso")
const botaoApagar = document.querySelector("#botao-apagar")

const id = idDaUrl()

function mostrarErro(mensagem) {
    estado.hidden = false
    estado.innerHTML = `${escapar(mensagem)} <a href="../index.html">Voltar para a lista</a>`
}

async function carregarFilme() {
    if (id === null) {
        mostrarErro("Nenhum filme escolhido. Volte para a lista e clique em Apagar.")
        return
    }

    try {
        const filme = await buscarFilme(id)

        ingresso.innerHTML = ingressoConteudo(filme)
        estado.hidden = true
        confirmacao.hidden = false
    } catch (erro) {
        mostrarErro(erro.message)
    }
}

botaoApagar.addEventListener("click", async () => {
    botaoApagar.disabled = true

    try {
        await chamarApi(`/delete-movie/${id}`, { method: "DELETE" })
        location.href = "../index.html?aviso=apagado"
    } catch (erro) {
        avisar(erro.message, true)
        botaoApagar.disabled = false
    }
})

carregarFilme()
