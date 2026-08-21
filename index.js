/*Letícia de Alencar e Sophia Barros, as mais mais*/

import express, { request, response } from "express"
import mysql2 from "mysql2"
import cors from "cors"


const app = express()

app.use(express.json())
app.use(cors())

app.post("/create-movie", (request, response) => {
    const { titulo, genero, duracao, classificacao} = request.body

    const insertCommand = "INSERT INTO filmes_LeticiaAlencarSophiaBarros(titulo, genero, duracao, classificacao) VALUES (?, ?, ?, ?)"

    sql.query(insertCommand, [titulo, genero, duracao, classificacao], (error) => {
        if(error){
            console.log(error)
            return
        }

        response.status(201).json({
            message:"filme cadastrado com sucesso!"
        })
    })
})


app.delete("/delete-movie/:id", (request, response) => {
    const { id } = request.params

    const deleteCommand = "DELETE FROM filmes_LeticiaAlencarSophiaBarros WHERE ID = ?"

    sql.query(deleteCommand, [id], (error) => {
        if(error){
            console.log(error)
            return
        }

        response.json({
            message:"filme apagado com sucesso!"
        })
    })
})

app.get("/all-movies", (request, response) => {
    const selectCommand = "SELECT * FROM filmes_LeticiaAlencarSophiaBarros"

    sql.query(selectCommand, (error, data) => {
        if(error){
            console.log(error)
            return
        }

        response.json(data)
    })
})

app.put("/update-movie/:id", (request, response) => {
    const { id } = request.params
    const { titulo, genero, duracao, classificacao } = request.body

    const updateCommand = `
        UPDATE filmes_LeticiaAlencarSophiaBarros
        SET titulo = ?, genero = ?, duracao = ?, classificacao = ?
        WHERE ID = ?
    `

    sql.query(
        updateCommand,
        [titulo, genero, duracao, classificacao, id],
        (error) => {
            if (error) {
                console.log(error)
                return
            }

            response.json({
                message: "Filme atualizado com sucesso!"
            })
        }
    )
})

app.listen(3333, () => {
    console.log("Servidor rodando na porta 3333")
})

const sql = mysql2.createPool ({
    host: "benserverplex.ddns.net",
    user:"alunos",
    password:"senhaAlunos",
    database:"alunos_filmes03TB"
})  