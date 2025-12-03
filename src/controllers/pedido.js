const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

/**
 * Cria um novo pedido e seus itens associados.
 * Espera no body: { sub_total, usuario_id, itens: [{ produto_id, quantidade, preco_unitario }] }
 */
const create = async (req, res) => {
    try {
        // Extrai os dados do corpo da requisição
        const { sub_total, usuario_id, itens } = req.body;

        // 1. Validação básica
        if (!usuario_id) {
            return res.status(400).json({ error: "usuario_id é obrigatório para finalizar o pedido." });
        }
        if (!itens || itens.length === 0) {
            return res.status(400).json({ error: "O pedido deve conter pelo menos um item." });
        }

        // 2. Mapeia os itens para o formato de criação aninhada do Prisma
        const itensParaCriacao = itens.map(item => ({
            quantidade: item.quantidade,
            produto: {
                connect: { id: Number(item.produto_id) }
            }
        }));

        // 3. Cria o pedido e os itens em uma única transação
        const novoPedido = await prisma.pedido.create({
            data: {
                subTotal: Number(sub_total), // Usando subTotal (camelCase) conforme o schema.prisma
                usuario: {
                    connect: { id: Number(usuario_id) }
                },
                itens: {
                    create: itensParaCriacao,
                }
            },
            include: {
                usuario: true,
                itens: true
            }
        });

        console.log(`✅ Pedido criado com sucesso para o usuário ${usuario_id}. ID: ${novoPedido.id}`);
        return res.status(201).json({ 
            message: "Pedido realizado com sucesso!",
            pedido: novoPedido
        });

    } catch (error) {
        console.error("❌ Erro ao criar pedido:", error);
        // Erros comuns do Prisma: P2025 (registro não encontrado), P2003 (chave estrangeira falhou)
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Usuário ou Produto não encontrado." });
        }
        return res.status(500).json({ error: "Erro interno do servidor ao criar pedido.", details: error.message });
    }
};

const read = async (req, res) => {
    // ... (manter a função read, mas ajustar o nome do campo de ID)
    const pedidos = await prisma.pedido.findMany({
        include: {
            usuario: true,
            itens: {
                include: {
                    produto: true
                }
            }
        }
    });
    res.json(pedidos);
};

const update = async (req, res) => {
    try {
        // Usando 'id' (camelCase) conforme o schema.prisma
        const pedido = await prisma.pedido.update({
            where: { id: Number(req.params.id) },
            data: req.body,
        });
        return res.status(202).json(pedido);
    } catch (error) {
        return res.status(400).json({ error: error.message });
    }
};

const remove = async (req, res) => {
    try {
        // Usando 'id' (camelCase) conforme o schema.prisma
        await prisma.pedido.delete({
            where: { id: Number(req.params.id) }
        });
        return res.status(204).send();
    } catch (error) {
        return res.status(404).json({ error: error.message });
    }
};

module.exports = { create, read, update, remove };
