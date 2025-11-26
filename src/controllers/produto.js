// controllers/produto.js
const prisma = require("../config/prisma");

/**
 * Criar produto (GERENTE)
 * Body esperado: { nome, descricao, preco, quantidade, imagem }
 */
exports.create = async (req, res) => {
  try {
    const { nome, descricao = '', preco, quantidade = 0, imagem = '' } = req.body;

    if (!nome || preco === undefined) {
      return res.status(400).json({ erro: 'Campos obrigatórios: nome e preco' });
    }

    const precoNum = Number(preco);
    const quantidadeNum = Number(quantidade) || 0;

    if (Number.isNaN(precoNum)) {
      return res.status(400).json({ erro: 'Preço inválido' });
    }

    const novoProduto = await prisma.produto.create({
      data: {
        nome,
        descricao,
        preco: precoNum,
        quantidade: quantidadeNum,
        imagem
      },
    });

    // ✅ Converte preco para Number antes de enviar
    return res.status(201).json({
      ...novoProduto,
      preco: Number(novoProduto.preco)
    });
  } catch (error) {
    console.error('❌ Erro ao cadastrar produto:', error);
    return res.status(500).json({ erro: 'Erro ao cadastrar produto.', detalhes: error.message });
  }
};

exports.listar = async (req, res) => {
  try {
    const produtos = await prisma.produto.findMany();

    // Converte preco para Number antes de retornar
    const produtosConvertidos = produtos.map(p => ({
      ...p,
      preco: Number(p.preco)
    }));

    return res.status(200).json(produtosConvertidos);
  } catch (error) {
    console.error('❌ Erro ao buscar produtos:', error);
    return res.status(500).json({
      erro: 'Erro ao buscar produtos.',
      detalhes: error.message
    });
  }
};


/**
 * Atualizar produto (GERENTE)
 * Params: id
 * Body: campos a atualizar { nome, descricao, preco, quantidade, imagem }
 */
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, quantidade, imagem } = req.body;

    const dadosAtualizar = {};

    if (nome !== undefined) dadosAtualizar.nome = nome;
    if (descricao !== undefined) dadosAtualizar.descricao = descricao;
    if (preco !== undefined) {
      const precoNum = Number(preco);
      if (Number.isNaN(precoNum)) return res.status(400).json({ erro: 'Preço inválido' });
      dadosAtualizar.preco = precoNum;
    }
    if (quantidade !== undefined) {
      const quantidadeNum = Number(quantidade);
      if (Number.isNaN(quantidadeNum)) return res.status(400).json({ erro: 'Quantidade inválida' });
      dadosAtualizar.quantidade = quantidadeNum;
    }
    if (imagem !== undefined) dadosAtualizar.imagem = imagem;

    const produtoAtualizado = await prisma.produto.update({
      where: { id: Number(id) },
      data: dadosAtualizar,
    });

    return res.json({
      ...produtoAtualizado,
      preco: Number(produtoAtualizado.preco)
    });
  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    return res.status(500).json({ erro: 'Erro ao atualizar produto.', detalhes: error.message });
  }
};

/**
 * Remover produto (GERENTE)
 * Params: id
 */
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.produto.delete({ where: { id: Number(id) } });
    return res.json({ mensagem: 'Produto removido com sucesso.' });
  } catch (error) {
    console.error('❌ Erro ao remover produto:', error);
    return res.status(500).json({ erro: 'Erro ao remover produto.', detalhes: error.message });
  }
};