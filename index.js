// === index.js ===
const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');

const app = express();

// ===== EJS =====
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ===== PUBLIC =====
app.use(express.static(path.join(__dirname, 'public')));

// ===== BODY PARSER =====
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ===== BANCO DE DADOS =====
const db = new Database(path.join(__dirname, 'banco.sqlite'));
db.pragma('journal_mode = WAL');

// === Tabelas ===
db.prepare(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    login TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS carros (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    marca TEXT NOT NULL,
    modelo TEXT NOT NULL,
    ano INTEGER NOT NULL,
    qtde_disponivel INTEGER NOT NULL
  )
`).run();

// === Prepared Statements ===
const inserirCarro = db.prepare(`
  INSERT INTO carros (marca, modelo, ano, qtde_disponivel)
  VALUES (?, ?, ?, ?)
`);
const listarCarros = db.prepare(`SELECT * FROM carros ORDER BY id DESC`);
const buscarCarro = db.prepare(`SELECT * FROM carros WHERE id = ?`);
const atualizarCarro = db.prepare(`
  UPDATE carros SET marca=?, modelo=?, ano=?, qtde_disponivel=? WHERE id=?
`);
const removerCarro = db.prepare(`DELETE FROM carros WHERE id=?`);
const venderCarro = db.prepare(`
  UPDATE carros SET qtde_disponivel = qtde_disponivel - 1 WHERE id=? AND qtde_disponivel > 0
`);

// ===== ROTAS =====

// Página inicial → Projects.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade1', 'Project.html'));
});

// ===== ROTAS DE CARROS =====

// Listagem de carros (dinâmica com EJS)
app.get('/carros', (req, res) => {
  const carros = listarCarros.all();
  res.render('carros_lista', { carros });
});

// Página de cadastro (HTML estático)
app.get('/carros/novo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade10', 'carros_novo.html'));
});

// Envio do formulário de cadastro (CREATE)
app.post('/carros/novo', (req, res) => {
  const { marca, modelo, ano, qtde_disponivel } = req.body;
  if (!marca || !modelo || !ano || !qtde_disponivel) {
    return res.status(400).send('Preencha todos os campos.');
  }
  inserirCarro.run(marca, modelo, ano, qtde_disponivel);
  res.redirect('/carros');
});

// Editar carro (form dinâmico)
app.get('/carros/editar/:id', (req, res) => {
  const carro = buscarCarro.get(req.params.id);
  if (!carro) return res.status(404).send('Carro não encontrado.');
  res.render('carros_editar', { carro });
});

// Atualizar carro (UPDATE)
app.post('/carros/editar/:id', (req, res) => {
  const { marca, modelo, ano, qtde_disponivel } = req.body;
  atualizarCarro.run(marca, modelo, ano, qtde_disponivel, req.params.id);
  res.redirect('/carros');
});

// Remover carro (DELETE)
app.get('/carros/remover/:id', (req, res) => {
  removerCarro.run(req.params.id);
  res.redirect('/carros');
});

// Vender carro (decrementa quantidade)
app.get('/carros/vender/:id', (req, res) => {
  venderCarro.run(req.params.id);
  res.redirect('/carros');
});

// ===== SERVIDOR =====
const PORT = 80;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}/`);
  console.log('➡  http://localhost/carros');
});
