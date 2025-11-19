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

// Função utilitária para garantir que o handler existe
function ensureFunction(fn, name) {
  if (typeof fn !== "function") {
    throw new Error(`Handler inválido: ${name} não é uma função. Verifique se está exportado corretamente no controller.`);
  }
  return fn;
}

// ROTAS DE USUÁRIO
rota.post("/usuarios", ensureFunction(usuario.create, "usuario.create"));
rota.post("/login", ensureFunction(usuario.login, "usuario.login"));
rota.post("/resetar-senha", ensureFunction(usuario.resetarSenha, "usuario.resetarSenha"));
rota.get("/usuarios", autenticarJWT, verificargerente, ensureFunction(usuario.listar, "usuario.listar")); // GERENTE

// ROTAS DE PRODUTO
rota.get("/produtos", ensureFunction(produto.listar, "produto.listar"));
rota.post("/produtos", autenticarJWT, verificargerente, ensureFunction(produto.create, "produto.create"));
rota.put("/produtos/:id", autenticarJWT, verificargerente, ensureFunction(produto.update, "produto.update"));
rota.delete("/produtos/:id", autenticarJWT, verificargerente, ensureFunction(produto.remove, "produto.remove"));

// ROTAS DE PEDIDO
rota.post("/pedidos", autenticarJWT, ensureFunction(pedido.criarPedido, "pedido.criarPedido"));
rota.get("/pedidos", autenticarJWT, verificargerente, ensureFunction(pedido.listarTodos, "pedido.listarTodos"));
rota.get("/meus-pedidos", autenticarJWT, ensureFunction(pedido.listarPorUsuario, "pedido.listarPorUsuario"));
rota.put("/pedidos/:id", autenticarJWT, verificargerente, ensureFunction(pedido.update, "pedido.update"));
rota.delete("/pedidos/:id", autenticarJWT, verificargerente, ensureFunction(pedido.remove, "pedido.remove"));

//  ROTA DE PAGAMENTO
rota.post("/pagamentos", autenticarJWT, ensureFunction(pagamento.criarPagamento, "pagamento.criarPagamento"));

// WEBHOOK ASAAS
rota.post("/webhook/asaas", express.json(), ensureFunction(webhook.receberWebhook, "webhook.receberWebhook"));

module.exports = rota;