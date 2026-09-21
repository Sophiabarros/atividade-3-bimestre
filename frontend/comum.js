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

// cor do canhoto segue a classificação indicativa oficial (L, 10, 12, 14, 16 e 18)
// valores fora do padrão, como 15 ou 27, usam a faixa de cima
function faixaClassificacao(classificacao) {
    if (classificacao <= 0) return "l"
    if (classificacao <= 10) return "10"
    if (classificacao <= 12) return "12"
    if (classificacao <= 14) return "14"
    if (classificacao <= 16) return "16"
    return "18"
}

function canhotoHtml(classificacao) {
    const nota = Number(classificacao)
    const informada = String(classificacao ?? "").trim() !== "" && !Number.isNaN(nota)
    const livre = informada && nota === 0
    const anos = nota === 1 ? "ano" : "anos"

    const faixa = informada ? faixaClassificacao(nota) : "nd"
    const numero = !informada ? "?" : livre ? "L" : nota
    const legenda = !informada ? "idade" : livre ? "livre" : anos
    const rotulo = !informada ? "ainda não informada" : livre ? "livre" : `${nota} ${anos}`

    return `
        <div class="ingresso-canhoto nota-${faixa}" role="img" aria-label="Classificação indicativa: ${rotulo}">
            <span class="canhoto-numero" aria-hidden="true">${numero}</span>
            <span class="canhoto-legenda" aria-hidden="true">${legenda}</span>
        </div>
    `
}

// conteúdo do ingresso, usado na lista e na página de apagar
function ingressoConteudo(filme, acoes = "") {
    return `
        <div class="ingresso-corpo">
            <p class="ingresso-titulo">${escapar(filme.titulo)}</p>
            <dl class="dados">
                <div>
                    <dt>Gênero</dt>
                    <dd>${escapar(filme.genero)}</dd>
                </div>
                <div>
                    <dt>Duração</dt>
                    <dd>${escapar(filme.duracao)}</dd>
                </div>
            </dl>
            ${acoes}
        </div>
        ${canhotoHtml(filme.classificacao)}
    `
}
