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

// ===== BANCO EM MEMÓRIA (Atv 8 - login/cadastro) =====
const usuarios = [];

// ====== BLOG: SQLite (Create + Read) ======
const db = new Database(path.join(__dirname, 'blog.sqlite'));
db.pragma('journal_mode = WAL');

db.prepare(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo   TEXT NOT NULL,
    resumo   TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const inserirPost = db.prepare(
  'INSERT INTO posts (titulo, resumo, conteudo) VALUES (?, ?, ?)'
);
const listarPosts = db.prepare(
  'SELECT id, titulo, resumo, conteudo, created_at FROM posts ORDER BY created_at DESC'
);

// ===== ROTAS =====

// Página inicial → Project.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade1', 'Project.html'));
});

// Home e Project
app.get('/Home.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade1', 'index.html'));
});
app.get('/Project.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade1', 'Project.html'));
});

// ===== ATIVIDADE 8 - CADASTRO E LOGIN =====

// Página de cadastro
app.get('/cadastra', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade8', 'Cadastro.html'));
});

// Envio do cadastro
app.post('/cadastra', (req, res) => {
  const { usuario, email, senha } = req.body;
  if (!usuario || !email || !senha) {
    return res.render('resposta', { status: 'Preencha todos os campos.', usuario: null });
  }
  usuarios.push({ usuario, email, senha });
  console.log('✅ Usuário cadastrado:', usuario);
  res.redirect('/login');
});

// Página de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade8', 'Login.html'));
});

// Envio do login
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  const user = usuarios.find(u => u.usuario === usuario && u.senha === senha);
  if (user) {
    return res.render('resposta', { status: 'Login bem-sucedido!', usuario: user.usuario });
  }
  return res.render('resposta', { status: 'Usuário ou senha inválidos.', usuario: null });
});

// ===== ATIVIDADE 9 - BLOG =====

// Página principal do blog (dinâmica com EJS)
app.get('/blog', (req, res) => {
  const posts = listarPosts.all(); // busca no BD
  res.render('blog', { posts });   // views/blog.ejs
});

// Página de cadastro de post (formulário estático)
app.get('/cadastrar_post', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'atividade9', 'cadastrar_post.html'));
});

// Recebe submissão do novo post (Create)
app.post('/cadastrar_post', (req, res) => {
  const { titulo, resumo, conteudo } = req.body;
  if (!titulo || !resumo || !conteudo) {
    return res.status(400).send('Preencha título, resumo e conteúdo.');
  }
  inserirPost.run(titulo, resumo, conteudo);
  res.redirect('/blog');
});

// ===== SERVIDOR =====
const PORT = 80;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor rodando em http://${HOST}:${PORT}/`);
  console.log('Use ipconfig para pegar o IP e acessar de outro PC:');
  console.log('➡  http://<seu-IP>/Project.html');
  console.log('➡  http://<seu-IP>/login');
  console.log('➡  http://<seu-IP>/blog');
});
