// usado pelas páginas cadastrar.html e editar.html
const formulario = document.querySelector("#formulario")
const botaoSalvar = document.querySelector("#botao-salvar")
const estado = document.querySelector("#estado")

const editando = document.body.dataset.pagina === "editar"
const id = idDaUrl()

// o selo da classificação muda de cor e de texto enquanto a pessoa digita
function atualizarPrevia() {
    definirNota(formulario, formulario.elements.classificacao.value)
}

function mostrarErro(mensagem) {
    estado.hidden = false
    estado.innerHTML = `${escapar(mensagem)} <a href="index.html">Voltar para a lista</a>`
}

async function carregarFilme() {
    if (id === null) {
        mostrarErro("Nenhum filme escolhido. Volte para a lista e clique em Editar.")
        return
    }

    try {
        const filme = await buscarFilme(id)

        formulario.elements.titulo.value = filme.titulo
        formulario.elements.genero.value = filme.genero
        formulario.elements.duracao.value = filme.duracao
        formulario.elements.classificacao.value = filme.classificacao

        estado.hidden = true
        formulario.hidden = false
        atualizarPrevia()
        formulario.elements.titulo.focus()
    } catch (erro) {
        mostrarErro(erro.message)
    }
}

formulario.elements.classificacao.addEventListener("input", atualizarPrevia)

formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault()

    const dados = Object.fromEntries(new FormData(formulario))
    dados.classificacao = Number(dados.classificacao)

    const opcoes = {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    }

    botaoSalvar.disabled = true

    try {
        if (editando) {
            await chamarApi(`/update-movie/${id}`, opcoes)
            location.href = `index.html?aviso=atualizado&id=${id}`
        } else {
            const resposta = await chamarApi("/create-movie", opcoes)
            location.href = `index.html?aviso=cadastrado&id=${resposta.id ?? ""}`
        }
    } catch (erro) {
        avisar(erro.message, true)
        botaoSalvar.disabled = false
    }
})

atualizarPrevia()

if (editando) {
    carregarFilme()
}
