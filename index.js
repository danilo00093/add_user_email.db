const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Para lidar com o banco de dados SQLite
const app = express();
const cors = require('cors');

app.use(cors());

// Configuração do Express
app.use(express.json()); // Para fazer o parse do corpo das requisições em JSON

// Função para conectar ao banco de dados
const db = new sqlite3.Database('meubanco.db', (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco de dados:", err);
    } else {
        console.log("Conectado ao banco de dados SQLite!");
    }
});

// Criar a tabela de usuários se não existir
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT NOT NULL
        );
    `);
});

// Rota para criar um novo usuário
app.post('/usuarios', (req, res) => {
    const { nome, email } = req.body;

    if (!nome || !email) {
        return res.status(400).json({ error: "Nome e email são obrigatórios!" });
    }

    const stmt = db.prepare('INSERT INTO usuarios (nome, email) VALUES (?, ?)');
    stmt.run(nome, email, function(err) {
        if (err) {
            return res.status(500).json({ error: "Erro ao inserir usuário!" });
        }
        res.status(201).json({ id: this.lastID, nome, email });
    });
});

// Rota para listar todos os usuários
app.get('/usuarios', (req, res) => {
    db.all('SELECT * FROM usuarios', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: "Erro ao buscar usuários!" });
        }
        res.json(rows);
    });
});

// Rota para deletar um usuário pelo ID
app.delete('/usuarios/:id', (req, res) => {
    const { id } = req.params;

    const stmt = db.prepare('DELETE FROM usuarios WHERE id = ?');
    stmt.run(id, function(err) {
        if (err) {
            return res.status(500).json({ error: "Erro ao deletar usuário!" });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "Usuário não encontrado!" });
        }
        res.json({ message: `Usuário com ID ${id} deletado com sucesso!` });
    });
});

// Iniciar o servidor na porta 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API rodando em http://localhost:${PORT}`);
});
