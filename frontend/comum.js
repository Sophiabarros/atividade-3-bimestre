// funções usadas por todas as páginas

// para testar com o backend local, troque por "http://localhost:3333"
const API = "https://backend-3-bimestre.vercel.app"

const aviso = document.querySelector("#aviso")
let temporizadorAviso

function escapar(texto) {
    const trocas = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }
    return String(texto ?? "").replace(/[&<>"']/g, (caractere) => trocas[caractere])
}

// o aviso some devagar: a classe "saindo" faz o fade e só depois o texto é limpo
function avisar(mensagem, erro = false) {
    clearTimeout(temporizadorAviso)
    aviso.classList.remove("saindo")
    aviso.textContent = mensagem
    aviso.classList.toggle("erro", erro)

    temporizadorAviso = setTimeout(() => {
        aviso.classList.add("saindo")

        temporizadorAviso = setTimeout(() => {
            aviso.textContent = ""
            aviso.classList.remove("saindo")
        }, 300)
    }, 5000)
}

// espera a animação de saída terminar; quem pediu menos movimento não espera
function esperarAnimacao(ms = 350) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve()

    return new Promise((resolver) => setTimeout(resolver, ms))
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

// tudo que a tela precisa para mostrar a classificação de um filme:
// a classe com a cor, o texto do selo (L, 10, 12...) e a descrição para leitores de tela
function dadosNota(classificacao) {
    const nota = Number(classificacao)
    const informada = String(classificacao ?? "").trim() !== "" && !Number.isNaN(nota)

    if (!informada) {
        return { classe: "nota-nd", selo: "?", descricao: "Classificação indicativa não informada" }
    }

    if (nota <= 0) {
        return { classe: "nota-l", selo: "L", descricao: "Classificação indicativa: livre para todos os públicos" }
    }

    return {
        classe: `nota-${faixaClassificacao(nota)}`,
        selo: nota,
        descricao: `Classificação indicativa: não recomendado para menores de ${nota} ${nota === 1 ? "ano" : "anos"}`
    }
}

// troca a classe nota-* do elemento (muda a cor do selo) e atualiza o selo dentro dele, se tiver
function definirNota(elemento, classificacao) {
    const nota = dadosNota(classificacao)
    const antigas = [...elemento.classList].filter((classe) => classe.startsWith("nota-"))
    const selo = elemento.querySelector(".selo")

    elemento.classList.remove(...antigas)
    elemento.classList.add(nota.classe)

    if (selo) {
        selo.textContent = nota.selo
        selo.setAttribute("aria-label", nota.descricao)
    }
}

// conteúdo da claquete, usado na lista e na página de apagar
function claqueteConteudo(filme, acoes = "") {
    const nota = dadosNota(filme.classificacao)

    return `
        <div class="barras" aria-hidden="true"><span></span><span></span></div>
        <div class="claquete-corpo">
            <dl class="celulas">
                <div class="celula celula-filme">
                    <dt>Filme</dt>
                    <dd class="claquete-titulo">${escapar(filme.titulo)}</dd>
                </div>
                <div class="celula celula-nota">
                    <dt>Classif.</dt>
                    <dd><span class="selo" role="img" aria-label="${nota.descricao}">${nota.selo}</span></dd>
                </div>
                <div class="celula celula-metade">
                    <dt>Gênero</dt>
                    <dd>${escapar(filme.genero)}</dd>
                </div>
                <div class="celula celula-metade">
                    <dt>Duração</dt>
                    <dd>${escapar(filme.duracao)}</dd>
                </div>
            </dl>
            ${acoes}
        </div>
    `
}
