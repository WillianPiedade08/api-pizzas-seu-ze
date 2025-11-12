// src/controllers/pagamento.js
const axios = require("axios");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const ASAAS_API_KEY = process.env.ASAAS_API_KEY?.trim();
const ASAAS_API_URL = process.env.ASAAS_BASE_URL?.trim() || "https://sandbox.asaas.com/api/v3";

exports.criarPagamento = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.usuario?.id;
    if (!usuarioId) return res.status(401).json({ message: "Usuário não autenticado." });

    const { pedidoId, metodoPagamento, cartao } = req.body;
    if (!pedidoId || !metodoPagamento) return res.status(400).json({ message: "pedidoId e metodoPagamento são obrigatórios." });

    const pedido = await prisma.pedido.findUnique({
      where: { id: Number(pedidoId) },
      include: { itens: { include: { produto: true } } },
    });
    if (!pedido) return res.status(404).json({ message: "Pedido não encontrado." });
    if (pedido.usuarioId !== usuarioId) return res.status(403).json({ message: "Você não tem permissão para pagar este pedido." });
    if (pedido.status !== "PENDENTE") return res.status(400).json({ message: "Pedido já processado." });

    const total = pedido.itens.reduce((acc, item) => acc + item.quantidade * Number(item.produto.preco), 0);
    if (total <= 0) return res.status(400).json({ message: "Valor total inválido para pagamento." });

    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioId } });
    if (!usuario) return res.status(404).json({ message: "Usuário não encontrado." });
    if (!usuario.cpf) return res.status(400).json({ message: "CPF não cadastrado. Adicione no perfil." });

    // Cliente Asaas
    let clienteId;
    try {
      const clienteBusca = await axios.get(`${ASAAS_API_URL}/customers?externalReference=${usuarioId}`, {
        headers: { access_token: ASAAS_API_KEY },
      });
      if (clienteBusca.data?.data?.length > 0) clienteId = clienteBusca.data.data[0].id;
    } catch { }

    if (!clienteId) {
      const clienteResponse = await axios.post(
        `${ASAAS_API_URL}/customers`,
        { name: usuario.nome, email: usuario.email, cpfCnpj: usuario.cpf, phone: usuario.telefone || "", externalReference: String(usuarioId) },
        { headers: { access_token: ASAAS_API_KEY } }
      );
      clienteId = clienteResponse.data.id;
    }

    // Criar cobrança
    const cobrancaRequest = {
      customer: clienteId,
      billingType: metodoPagamento,
      dueDate: new Date(Date.now() + 3*24*60*60*1000).toISOString().split("T")[0],
      value: total.toFixed(2),
      description: `Pedido #${pedidoId} - PetShop`,
      externalReference: `pedido_${pedidoId}`,
    };

    // Se for cartão de crédito, adiciona os dados recebidos
    if (metodoPagamento === "CREDIT_CARD") {
      if (!cartao || !cartao.holderName || !cartao.number || !cartao.expiryMonth || !cartao.expiryYear || !cartao.cvv)
        return res.status(400).json({ message: "Dados do cartão incompletos." });

      cobrancaRequest.creditCard = {
        holderName: cartao.holderName,
        number: cartao.number,
        expiryMonth: cartao.expiryMonth,
        expiryYear: cartao.expiryYear,
        cvv: cartao.cvv
      };
    }

    const cobrancaResponse = await axios.post(`${ASAAS_API_URL}/payments`, cobrancaRequest, {
      headers: { access_token: ASAAS_API_KEY },
    });

    const cobranca = cobrancaResponse.data;

    return res.status(201).json({
      pixQrCode: cobranca.pixQrCode,
      pixCopiaCola: cobranca.pixCopiaCola,
      linkPagamento: cobranca.invoiceUrl,
      paymentId: cobranca.id
    });

  } catch (error) {
    console.error("❌ Erro ao criar pagamento Asaas:", error.response?.data || error.message);
    if (error.response) return res.status(error.response.status).json({ message: "Erro na API do Asaas.", detalhe: error.response.data });
    return res.status(500).json({ message: "Erro interno ao processar pagamento.", detalhe: error.message });
  }
};