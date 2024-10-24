const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Configura o CORS para aceitar apenas requisições do domínio específico
const corsOptions = {
    origin: 'https://www.boteco.live', // Domínio específico permitido
    methods: ["GET", "POST", "PUT", "OPTIONS"], // Métodos permitidos
    allowedHeaders: ['Content-Type'],
    credentials: true // Permite o envio de cookies, se necessário
};

// Serve arquivos estáticos da pasta /public
app.use(express.static(path.join(__dirname, 'public')));

// Rota para servir o index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
