const express = require("express");
const rota = express.Router();

// Controllers 
const usuario = require("./controllers/usuario");
const produto = require("./controllers/produto");
const pedido = require("./controllers/pedido");
const pagamento = require("./controllers/pagamento");
const webhook = require("./controllers/webhook");

// Middleware
const { autenticarJWT, verificargerente } = require("./middleware/auth");

// ========================================
// ROTA DE TESTE (Health Check)
// ========================================
rota.get("/", (req, res) => {
    res.json({
        message: "API da Pizzaria está funcionando! 🍕",
        timestamp: new Date().toISOString(),
        endpoints: {
            usuarios: "POST /usuarios (Cadastro), POST /usuarios/login, POST /usuarios/resetar-senha, GET /usuarios (Listar)",
            produtos: "/produtos",
            pedidos: "/pedidos",
            pagamentos: "/pagamentos",
            webhook: "/webhook/asaas"
        }
    });
});

// ========================================
// ROTAS DE USUÁRIO
// ========================================
rota.post("/usuarios", usuario.create); // Cadastro
rota.post("/usuarios/login", usuario.login); // Login
rota.post("/usuarios/resetar-senha", usuario.resetarSenha); // Resetar Senha
rota.get("/usuarios", autenticarJWT, verificargerente, usuario.listar); // Listar (Gerente)

// ========================================
// ROTAS DE PRODUTO
// ========================================
rota.get("/produtos", produto.listar);
rota.post("/produtos", autenticarJWT, verificargerente, produto.create);
rota.put("/produtos/:id", autenticarJWT, verificargerente, produto.update);
rota.delete("/produtos/:id", autenticarJWT, verificargerente, produto.remove);

// ========================================
// ROTAS DE PEDIDO
// ========================================
rota.get('/pedidos', pedido.read);
rota.post('/pedidos', pedido.create);
rota.put('/pedidos/:id', pedido.update);
rota.delete('/pedidos/:id', pedido.remove);

// ========================================
// ROTA DE PAGAMENTO
// ========================================
rota.post("/pagamentos", autenticarJWT, pagamento.criarPagamento);

// ========================================
// WEBHOOK ASAAS
// ========================================
rota.post("/webhook/asaas", express.json(), webhook.receberWebhook);

module.exports = rota;
