const express = require('express');
const cors = require('cors');
const app = express();

// Importa o roteador
const routes = require('../src/routes'); 

// ========================================
// MIDDLEWARES
// ========================================
app.use(cors({
    origin: '*', // Em produção, especifique os domínios permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware de log para desenvolvimento
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`📥 ${req.method} ${req.path}`, req.body);
        next();
    });
}

// ========================================
// ROTAS
// ========================================
app.use(routes); 

// ========================================
// TRATAMENTO DE ERROS 404
// ========================================
app.use((req, res) => {
    res.status(404).json({ 
        error: "Rota não encontrada",
        path: req.path,
        method: req.method
    });
});

// ========================================
// TRATAMENTO DE ERROS GLOBAL
// ========================================
app.use((err, req, res, next) => {
    console.error('❌ Erro não tratado:', err);
    res.status(500).json({ 
        error: "Erro interno do servidor",
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ========================================
// EXPORTA O APP PARA O VERCEL
// ========================================
module.exports = app;
