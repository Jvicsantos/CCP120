// === index.js ===

// Importa o framework Express para criar o servidor web
const express = require('express');

// Importa o módulo 'path' para manipular caminhos de arquivos
const path = require('path');

// Importa o banco de dados SQLite usando a biblioteca better-sqlite3
const Database = require('better-sqlite3');

// Cria a aplicação Express
const app = express();


// ===== EJS =====
// Define que o Express vai usar o EJS como motor de templates
app.set('view engine', 'ejs');

// Define onde ficam os arquivos .ejs
app.set('views', path.join(__dirname, 'views'));


// ===== PUBLIC =====
// Define a pasta que contém arquivos estáticos (css, js, imagens, html)
app.use(express.static(path.join(__dirname, 'public')));


// ===== BODY PARSER =====
// Permite receber dados enviados via formulário (POST)
app.use(express.urlencoded({ extended: false }));

// Permite receber dados em JSON
app.use(express.json());


// ===== BANCO DE DADOS =====
// Abre (ou cria) o arquivo banco.sqlite
const db = new Database(path.join(__dirname, 'banco.sqlite'));

// Ativa modo WAL (melhora performance e evita travamento)
db.pragma('journal_mode = WAL');


// === Tabelas ===
// Cria tabela de usuários caso não exista
db.prepare(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    login TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL
  )
`).run();

// Cria tabela de carros caso não exista
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
// Pré-carrega comando de inserir carro para melhorar performance
const inserirCarro = db.prepare(`
  INSERT INTO carros (marca, modelo, ano, qtde_disponivel)
  VALUES (?, ?, ?, ?)
`);

// Busca todos os carros ordenados do mais novo para o mais antigo
const listarCarros = db.prepare(`SELECT * FROM carros ORDER BY id DESC`);

// Busca um carro específico pelo ID
const buscarCarro = db.prepare(`SELECT * FROM carros WHERE id = ?`);

// Atualiza um carro pelo ID
const atualizarCarro = db.prepare(`
  UPDATE carros SET marca=?, modelo=?, ano=?, qtde_disponivel=? WHERE id=?
`);

// Remove um carro pelo ID
const removerCarro = db.prepare(`DELETE FROM carros WHERE id=?`);

// Decrementa a quantidade somente se qtde_disponivel > 0
const venderCarro = db.prepare(`
  UPDATE carros SET qtde_disponivel = qtde_disponivel - 1
  WHERE id=? AND qtde_disponivel > 0
`);


// ======================
// ===== ROTAS WEB =====
// ======================

// Página inicial → abre um arquivo HTML estático
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade1', 'Project.html'));
});


// ===== ROTAS DE CARROS =====

// Página com listagem de carros usando EJS
app.get('/carros', (req, res) => {
  const carros = listarCarros.all();  // busca todos no BD
  res.render('carros_lista', { carros }); // renderiza o template
});

// Página de formulário para cadastro (HTML estático)
app.get('/carros/novo', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade10', 'carros_novo.html'));
});

// Recebe formulário e cadastra no BD (CREATE)
app.post('/carros/novo', (req, res) => {
  const { marca, modelo, ano, qtde_disponivel } = req.body;

  // Verifica se todos os campos foram enviados
  if (!marca || !modelo || !ano || !qtde_disponivel) {
    return res.status(400).send('Preencha todos os campos.');
  }

  // Insere no banco
  inserirCarro.run(marca, modelo, ano, qtde_disponivel);
  res.redirect('/carros'); // volta para a lista
});

// Página de edição de carro (dinâmica em EJS)
app.get('/carros/editar/:id', (req, res) => {
  const carro = buscarCarro.get(req.params.id); // busca pelo ID

  if (!carro) return res.status(404).send('Carro não encontrado.');

  res.render('carros_editar', { carro });
});

// Atualiza os dados do carro (UPDATE)
app.post('/carros/editar/:id', (req, res) => {
  const { marca, modelo, ano, qtde_disponivel } = req.body;

  // Atualiza no banco
  atualizarCarro.run(marca, modelo, ano, qtde_disponivel, req.params.id);

  res.redirect('/carros');
});

// Remove carro pelo ID (DELETE)
app.get('/carros/remover/:id', (req, res) => {
  removerCarro.run(req.params.id);
  res.redirect('/carros');
});

// Vende carro → decrementa qtde (se existir)
app.get('/carros/vender/:id', (req, res) => {
  venderCarro.run(req.params.id);
  res.redirect('/carros');
});


// ===== SERVIDOR =====
// Define porta e endereço que o servidor vai rodar
const PORT = 80;
const HOST = '0.0.0.0';

// Inicializa o servidor
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}/`);
  console.log('➡  http://localhost/carros');
});

//baixar o sql no terminal: npm install better-sqlite3
// atualizar: npm rebuild better-sqlite3 --update-binary

