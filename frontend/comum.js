// funções usadas por todas as páginas

// para testar com o backend local, troque por "http://localhost:3333"
const API = "https://backend-3-bimestre.vercel.app"

const aviso = document.querySelector("#aviso")
let temporizadorAviso

function escapar(texto) {
    const trocas = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }
    return String(texto ?? "").replace(/[&<>"']/g, (caractere) => trocas[caractere])
}

function avisar(mensagem, erro = false) {
    clearTimeout(temporizadorAviso)
    aviso.textContent = mensagem
    aviso.classList.toggle("erro", erro)
    temporizadorAviso = setTimeout(() => { aviso.textContent = "" }, 5000)
}

async function chamarApi(caminho, opcoes = {}) {
    let resposta

    try {
        resposta = await fetch(`${API}${caminho}`, opcoes)
    } catch {
        throw new Error("Não foi possível falar com o servidor. Confira se ele está no ar e tente de novo.")
    }

    const dados = await resposta.json().catch(() => ({}))

    if (!resposta.ok) {
        throw new Error(dados.message || "Algo deu errado. Tente de novo.")
    }

    return dados
}

// pega o id da página (editar.html?id=3), ou null se não tiver um válido
function idDaUrl() {
    const id = Number(new URLSearchParams(location.search).get("id"))

    return Number.isInteger(id) && id > 0 ? id : null
}

async function buscarFilme(id) {
    const filmes = await chamarApi("/all-movies")
    const filme = filmes.find((item) => item.id === id)

    if (!filme) {
        throw new Error("Filme não encontrado. Ele pode já ter sido apagado.")
    }

    return filme
}

// a cor das barras da claquete segue a classificação indicativa oficial (L, 10, 12, 14, 16 e 18)
// valores fora do padrão, como 15 ou 27, usam a faixa de cima
function faixaClassificacao(classificacao) {
    if (classificacao <= 0) return "l"
    if (classificacao <= 10) return "10"
    if (classificacao <= 12) return "12"
    if (classificacao <= 14) return "14"
    if (classificacao <= 16) return "16"
    return "18"
}

// tudo que a tela precisa para mostrar a classificação de um filme
function dadosNota(classificacao) {
    const nota = Number(classificacao)
    const informada = String(classificacao ?? "").trim() !== "" && !Number.isNaN(nota)
    const livre = informada && nota === 0
    const anos = nota === 1 ? "ano" : "anos"

    return {
        classe: informada ? `nota-${faixaClassificacao(nota)}` : "nota-nd",
        numero: !informada ? "?" : livre ? "Livre" : nota,
        legenda: !informada || livre ? "" : anos
    }
}

// troca a classe nota-* do elemento, que muda a cor das barras da claquete
function definirNota(elemento, classificacao) {
    const antigas = [...elemento.classList].filter((classe) => classe.startsWith("nota-"))

    elemento.classList.remove(...antigas)
    elemento.classList.add(dadosNota(classificacao).classe)
}

// conteúdo da claquete, usado na lista e na página de apagar
function claqueteConteudo(filme, acoes = "") {
    const nota = dadosNota(filme.classificacao)

    return `
        <div class="barras" aria-hidden="true"><span></span><span></span></div>
        <div class="claquete-corpo">
            <p class="claquete-titulo">${escapar(filme.titulo)}</p>
            <dl class="celulas">
                <div class="celula">
                    <dt>Gênero</dt>
                    <dd>${escapar(filme.genero)}</dd>
                </div>
                <div class="celula">
                    <dt>Duração</dt>
                    <dd>${escapar(filme.duracao)}</dd>
                </div>
                <div class="celula celula-nota">
                    <dt>Classificação</dt>
                    <dd><span class="nota-numero">${nota.numero}</span> <span class="nota-legenda">${nota.legenda}</span></dd>
                </div>
            </dl>
            ${acoes}
        </div>
    `
}
