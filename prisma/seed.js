const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');

const encripta = async (senha) => {
    if (!senha) return null;
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(senha, salt);
        return hash;
    } catch (error) {
        console.error('Erro ao criar hash:', error);
        throw new Error('Erro ao criar hash');
    }
}

async function main() {
    await prisma.usuario.createMany({
        data: [
            {
                "nome": "Willian Piedadee",
                "cpf": "000.000.000.00",
                "email": "wiill12@gmail.com",
                "telefone": "19999999999",
                "senha": await encripta("senha123"),
                "tipo": "GERENTE"
            },
            {
                "nome": "Maria Luiza ",
                "cpf": "111.000.000.00",
                "email": "maria@gmail.com",
                "telefone": "190000000",
                "senha": await encripta("senha123"),
                "tipo": "GERENTE"
            }
        ],
    })

    await prisma.produto.createMany({
        data: {
            "nome": "frango com catupiry",
            "descricao": "molho de tomate, frango e catupiry",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "created_at": "2025-11-19T13:47:04.460Z"
        },
    })

}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })