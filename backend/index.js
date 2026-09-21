/*Letícia de Alencar e Sophia Barros, as mais mais*/

import express from "express"
import mysql2 from "mysql2"
import cors from "cors"


const app = express()

app.use(express.json())
app.use(cors())

const sql = mysql2.createPool ({
    host: "benserverplex.ddns.net",
    user:"alunos",
    password:"senhaAlunos",
    database:"alunos_filmes03TB"
})

const TABELA = "filmes_LeticiaAlencarSophiaBarros"

// campos do filme e o nome que aparece nas mensagens de erro
const CAMPOS = {
    titulo: "título",
    genero: "gênero",
    duracao: "duração",
    classificacao: "classificação"
}

const idValido = (id) => Number.isInteger(Number(id)) && Number(id) > 0

const limpar = (valor) => typeof valor === "string" ? valor.trim() : valor

// devolve a mensagem de erro do campo, ou null se estiver tudo certo
function validarCampo(campo, valor) {
    const texto = String(limpar(valor) ?? "")

    if (texto === "") {
        return `O campo ${CAMPOS[campo]} é obrigatório.`
    }

    if (campo === "classificacao" && !(Number.isInteger(Number(texto)) && Number(texto) >= 0)) {
        return "A classificação deve ser um número inteiro maior ou igual a 0."
    }

    return null
}

function erroNoBanco(response, error) {
    console.log(error)
    response.status(500).json({
        message: "Erro ao acessar o banco de dados."
    })
}


app.get("/all-movies", (request, response) => {
    const selectCommand = `SELECT * FROM ${TABELA} ORDER BY id`

    sql.query(selectCommand, (error, data) => {
        if(error){
            return erroNoBanco(response, error)
        }

        response.json(data)
    })
})

app.get("/movie/:id", (request, response) => {
    const { id } = request.params

    if(!idValido(id)){
        return response.status(400).json({ message: "ID inválido." })
    }

    sql.query(`SELECT * FROM ${TABELA} WHERE id = ?`, [id], (error, data) => {
        if(error){
            return erroNoBanco(response, error)
        }

        if(data.length === 0){
            return response.status(404).json({ message: "Filme não encontrado." })
        }

        response.json(data[0])
    })
})

app.post("/create-movie", (request, response) => {
    const corpo = request.body ?? {}

    for(const campo of Object.keys(CAMPOS)){
        const erro = validarCampo(campo, corpo[campo])

        if(erro){
            return response.status(400).json({ message: erro })
        }
    }

    const { titulo, genero, duracao, classificacao } = corpo

    const insertCommand = `INSERT INTO ${TABELA}(titulo, genero, duracao, classificacao) VALUES (?, ?, ?, ?)`

    sql.query(insertCommand, [limpar(titulo), limpar(genero), limpar(duracao), Number(classificacao)], (error, result) => {
        if(error){
            return erroNoBanco(response, error)
        }

        response.status(201).json({
            message: "Filme cadastrado com sucesso!",
            id: result.insertId
        })
    })
})

// atualiza só os campos que vierem no corpo, o resto do filme continua como está
app.put("/update-movie/:id", (request, response) => {
    const { id } = request.params
    const corpo = request.body ?? {}

    if(!idValido(id)){
        return response.status(400).json({ message: "ID inválido." })
    }

    const enviados = Object.keys(CAMPOS).filter((campo) => corpo[campo] !== undefined)

    if(enviados.length === 0){
        return response.status(400).json({
            message: "Envie ao menos um campo para atualizar: titulo, genero, duracao ou classificacao."
        })
    }

    for(const campo of enviados){
        const erro = validarCampo(campo, corpo[campo])

        if(erro){
            return response.status(400).json({ message: erro })
        }
    }

    // os nomes das colunas vêm da lista CAMPOS, nunca do que o cliente mandou
    const alteracoes = enviados.map((campo) => `${campo} = ?`).join(", ")
    const valores = enviados.map((campo) => campo === "classificacao" ? Number(corpo[campo]) : limpar(corpo[campo]))

    sql.query(`UPDATE ${TABELA} SET ${alteracoes} WHERE id = ?`, [...valores, id], (error, result) => {
        if(error){
            return erroNoBanco(response, error)
        }

        if(result.affectedRows === 0){
            return response.status(404).json({ message: "Filme não encontrado." })
        }

        response.json({
            message: "Filme atualizado com sucesso!"
        })
    })
})

app.delete("/delete-movie/:id", (request, response) => {
    const { id } = request.params

    if(!idValido(id)){
        return response.status(400).json({ message: "ID inválido." })
    }

    sql.query(`DELETE FROM ${TABELA} WHERE id = ?`, [id], (error, result) => {
        if(error){
            return erroNoBanco(response, error)
        }

        if(result.affectedRows === 0){
            return response.status(404).json({ message: "Filme não encontrado." })
        }

        response.json({
            message: "Filme apagado com sucesso!"
        })
    })
})


app.use((request, response) => {
    response.status(404).json({ message: "Rota não encontrada." })
})

app.use((error, request, response, next) => {
    if(error.type === "entity.parse.failed"){
        return response.status(400).json({ message: "JSON inválido." })
    }

    console.log(error)
    response.status(500).json({ message: "Erro interno do servidor." })
})

app.listen(3333, () => {
    console.log("Servidor rodando na porta 3333")
})
