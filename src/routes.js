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

/**
 * Função utilitária para garantir que o handler existe
 * Evita erros em tempo de execução quando um handler não é implementado
 */
function ensureFunction(fn, name) {
    if (typeof fn !== "function") {
        return (req, res) => res.status(500).json({ 
            error: `Erro de configuração: Handler '${name}' não é uma função. Verifique o controller.` 
        });
    }
    return fn;
}

// ======================================
// Rotas de teste
// ======================================
rota.get('/', (req, res) => {
    res.json({
        titulo: "Pizzaria do seu Zé ",
        rotas: [
            { usuarios: "/usuarios" },
            { login: "/usuarios/login" },
            { produtos: "/produtos" },
            { pedidos: "/pedidos" },
            { pagamentos: "/pagamentos" },
        ]
    })
})

// ========================================
// ROTAS DE USUÁRIO
// ========================================
rota.post("/usuarios", ensureFunction(usuario.create, "usuario.create")); // Cadastro
rota.post("/usuarios/login", ensureFunction(usuario.login, "usuario.login")); // Login
rota.post("/usuarios/resetar-senha", ensureFunction(usuario.resetarSenha, "usuario.resetarSenha")); // Resetar Senha
rota.get("/usuarios", autenticarJWT, verificargerente, ensureFunction(usuario.listar, "usuario.listar")); // Listar (Gerente)

// ========================================
// ROTAS DE PRODUTO
// ========================================
rota.get("/produtos", ensureFunction(produto.listar, "produto.listar"));
rota.post("/produtos", autenticarJWT, verificargerente, ensureFunction(produto.create, "produto.create"));
rota.put("/produtos/:id", autenticarJWT, verificargerente, ensureFunction(produto.update, "produto.update"));
rota.delete("/produtos/:id", autenticarJWT, verificargerente, ensureFunction(produto.remove, "produto.remove"));

// ========================================
// ROTAS DE PEDIDO
// ========================================
rota.get('/pedidos', ensureFunction(pedido.read, "pedido.read"));
rota.post('/pedidos', ensureFunction(pedido.create, "pedido.create"));
rota.put('/pedidos/:id', ensureFunction(pedido.update, "pedido.update"));
rota.delete('/pedidos/:id', ensureFunction(pedido.remove, "pedido.remove"));

// ========================================
// ROTA DE PAGAMENTO
// ========================================
rota.post("/pagamentos", autenticarJWT, ensureFunction(pagamento.criarPagamento, "pagamento.criarPagamento"));

// ========================================
// WEBHOOK ASAAS
// ========================================
rota.post("/webhook/asaas", express.json(), ensureFunction(webhook.receberWebhook, "webhook.receberWebhook"));

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

module.exports = rota;
