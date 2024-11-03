const express = require('express');
const path = require('path');
const cors = require('cors'); // Importando a biblioteca cors

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração CORS permissiva
app.use(cors());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Rota dinâmica de exemplo
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Olá, esta é uma resposta dinâmica!' });
});

// Redirecionar todas as outras rotas para o index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
