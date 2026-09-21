const lista = document.querySelector("#lista")
const contagem = document.querySelector("#contagem")

const ICONE_EDITAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4z"/><path d="M13 7l4 4"/></svg>`
const ICONE_APAGAR = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v6M14 11v6"/></svg>`

const MENSAGENS = {
    cadastrado: "Filme cadastrado.",
    atualizado: "Alterações salvas.",
    apagado: "Filme apagado."
}

function criarIngresso(filme) {
    const titulo = escapar(filme.titulo)

    const acoes = `
        <div class="acoes">
            <a class="botao-claquete" href="frontend/editar.html?id=${filme.id}" aria-label="Editar ${titulo}">${ICONE_EDITAR}Editar</a>
            <a class="botao-claquete perigo" href="frontend/apagar.html?id=${filme.id}" aria-label="Apagar ${titulo}">${ICONE_APAGAR}Apagar</a>
        </div>
    `

    return `<li class="claquete ${dadosNota(filme.classificacao).classe}" data-id="${filme.id}">${claqueteConteudo(filme, acoes)}</li>`
}

function mostrarFilmes(filmes) {
    contagem.textContent = filmes.length === 1 ? "1 filme cadastrado" : `${filmes.length} filmes cadastrados`

    if (filmes.length === 0) {
        lista.innerHTML = `<li class="vazio">Nenhum filme cadastrado. <a href="frontend/cadastrar.html">Cadastrar o primeiro filme</a></li>`
        return
    }

    lista.innerHTML = filmes.map(criarIngresso).join("")
}

// depois de cadastrar, editar ou apagar, a página volta pra cá com ?aviso=...&id=...
function mostrarResultadoDaAcao() {
    const params = new URLSearchParams(location.search)
    const mensagem = MENSAGENS[params.get("aviso")]

    if (!mensagem) return

    avisar(mensagem)

    const claquete = lista.querySelector(`[data-id="${params.get("id")}"]`)

    if (claquete) {
        claquete.classList.add("salvo")

        // filme novo entra deslizando; um filme editado só ganha o contorno
        if (params.get("aviso") === "cadastrado") {
            claquete.classList.add("novo")
        }

        claquete.scrollIntoView({ block: "nearest" })
    }

    // limpa a URL pra o aviso não aparecer de novo se a página for recarregada
    history.replaceState(null, "", location.pathname)
}

async function buscarFilmes() {
    // acessar a rota GET do backend e exibir os filmes na tela
    try {
        const filmes = await chamarApi("/all-movies")
        mostrarFilmes(filmes)
        mostrarResultadoDaAcao()
    } catch (erro) {
        contagem.textContent = "Filmes cadastrados"
        lista.innerHTML = `<li class="vazio">${escapar(erro.message)}</li>`
    }
}

buscarFilmes()
