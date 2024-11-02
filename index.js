const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de CORS para permitir acesso de uma origem específica ou múltiplas origens
const allowedOrigins = ['https://www.boteco.live', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Permite requisições sem origem (ex: scripts internos)
    if (!origin) return callback(null, true);
    // Checa se a origem está na lista de permitidas
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Olá, esta é uma resposta dinâmica!' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
