// controllers/pedido.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Criar novo pedido
exports.criarPedido = async (req, res) => {
  try {
    const { itens } = req.body;

    const usuarioId = req.user?.id || req.usuario?.id;
    if (!usuarioId) {
      return res.status(401).json({ erro: "Usuário não autenticado." });
    }

    if (!Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: "Carrinho vazio ou inválido." });
    }

    // Validação dos itens
    const itensValidados = itens.map(it => ({
      produtoId: Number(it.produtoId ?? it.id),
      quantidade: Number(it.quantidade ?? it.qtd ?? 0),
    }));

    for (const it of itensValidados) {
      if (!it.produtoId || it.quantidade <= 0) {
        return res.status(400).json({ erro: "Cada item precisa de produtoId e quantidade > 0." });
      }
    }

    // Verifica se os produtos existem
    const ids = itensValidados.map(i => i.produtoId);
    const produtosExistentes = await prisma.produto.findMany({
      where: { id: { in: ids } },
      select: { id: true }
    });

    const idsEncontrados = produtosExistentes.map(p => p.id);
    const faltantes = ids.filter(id => !idsEncontrados.includes(id));
    if (faltantes.length > 0) {
      return res.status(400).json({ erro: `Produtos não encontrados: ${faltantes.join(", ")}` });
    }

    // Criar pedido com itens
    const pedido = await prisma.pedido.create({
      data: {
        usuarioId,
        status: "PENDENTE",
        itens: {
          create: itensValidados
        }
      },
      include: {
        usuario: true,
        itens: {
          include: { produto: true } // ✅ Agora isso vai funcionar
        }
      }
    });

    return res.status(201).json(pedido);
  } catch (error) {
    console.error("❌ Erro ao criar pedido:", error);
    return res.status(500).json({
      erro: "Erro ao criar pedido",
      detalhes: error.message ?? String(error),
    });
  }
};

// Listar todos os pedidos (ADMIN)
exports.listarTodos = async (req, res) => {
  try {
    const pedidos = await prisma.pedido.findMany({
      include: {
        usuario: true,
        itens: { include: { produto: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(pedidos);
  } catch (error) {
    console.error("Erro ao listar pedidos:", error);
    return res.status(500).json({ erro: "Erro ao listar pedidos" });
  }
};

// Listar pedidos do usuário logado
exports.listarPorUsuario = async (req, res) => {
  try {
    const usuarioId = req.user?.id;
    if (!usuarioId) return res.status(401).json({ erro: "Usuário não autenticado." });

    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId },
      include: {
        itens: { include: { produto: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.json(pedidos);
  } catch (error) {
    console.error("Erro ao listar meus pedidos:", error);
    return res.status(500).json({ erro: "Erro ao listar meus pedidos" });
  }
};

// Atualizar status do pedido (ADMIN)
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const pedido = await prisma.pedido.update({
      where: { id: Number(id) },
      data: { status },
    });

    return res.json(pedido);
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return res.status(500).json({ erro: "Erro ao atualizar pedido" });
  }
};

// Remover pedido (ADMIN)
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.pedido.delete({ where: { id: Number(id) } });
    return res.json({ mensagem: "Pedido removido com sucesso!" });
  } catch (error) {
    console.error("Erro ao remover pedido:", error);
    return res.status(500).json({ erro: "Erro ao remover pedido" });
  }
};