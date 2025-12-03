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
        data: [
            {
                "id": 1,
                "nome": "frango com catupiry",
                "descricao": "molho de tomate, frango e catupiry",
                "preco": 70.99,
                "quantidade": 1,
                "imagem": "",
                "createdAt": "2025-12-03T18:19:53.075Z"
            },
            {
            "id": 2,
            "nome": "marguerita",
            "descricao": "molho de tomate, mussarela de bufalo e manjericao",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:30:56.545Z"
        },
        {
            "id": 3,
            "nome": "pepperoni",
            "descricao": "molho de tomate, mussarela e fatias de pepperoni",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:32:25.934Z"
        },
        {
            "id": 4,
            "nome": "palmito",
            "descricao": "molho de tomate, palmito em rodelas, queijo e azeitonas",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:34:26.374Z"
        },
        {
            "id": 5,
            "nome": "carne seca",
            "descricao": "molho de tomate, mussarela, carne seca, cebola, orégano e azeitonas",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:35:42.746Z"
        },
        {
            "id": 6,
            "nome": "bacon",
            "descricao": "molho de tomate, mussarela, bacon, orégano e azeitonas",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:37:05.529Z"
        },
        {
            "id": 7,
            "nome": "calabresa",
            "descricao": "molho de tomate, queijo, calabresa fatiada e cebola",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:37:54.499Z"
        },
        {
            "id": 8,
            "nome": "quatro queijos",
            "descricao": "molho de tomate, mussarela, gorgonzola, parmesão e provolone",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:39:11.060Z"
        },
        {
            "id": 9,
            "nome": "vegetariana",
            "descricao": "molho de tomate, queijo, pimentão, cebola, azeitona e cogumelos",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:40:23.087Z"
        },
        {
            "id": 10,
            "nome": "strogonoff de carne",
            "descricao": "molho de tomate, mussarela, strogonoff de carne, catupiry, batata palha, orégano e azeitonas",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:41:40.951Z"
        },
        {
            "id": 11,
            "nome": "lombo",
            "descricao": "molho de tomate, queijo, presunto, ovo, cebola, azeitona e pimentão",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:42:58.726Z"
        },
        {
            "id": 12,
            "nome": "brócolis com catupiry",
            "descricao": "molho de tomate, mussarela, brócolis e catupiry",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:45:29.930Z"
        },
        {
            "id": 13,
            "nome": "picanha",
            "descricao": "molho de tomate, mussarela, picanha e orégano",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:47:07.550Z"
        },
        {
            "id": 14,
            "nome": "camarão com catupiry",
            "descricao": "molho de tomate, mussarela, camarão, catupiry e orégano",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:48:28.477Z"
        },
        {
            "id": 15,
            "nome": "portuguesa",
            "descricao": "molho de tomate, mussarela, presunto, ovos cozidos, cebola, azeitonas e orégano",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:50:02.345Z"
        },
        {
            "id": 16,
            "nome": "romana",
            "descricao": "molho de tomate, mussarela, fíles de anchova, tomates, orégano e azeite de oliva",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:52:53.885Z"
        },
        {
            "id": 17,
            "nome": "caprese",
            "descricao": "molho de tomate, tomates, mussarela de búfala, manjericão fresco e azeite de oliva extra virgem",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T18:56:38.873Z"
        },
        {
            "id": 18,
            "nome": "toscana",
            "descricao": "molho de tomate, requeijão cremoso, azeitonas, orégano, cebola e azeite",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T19:08:00.677Z"
        },
        {
            "id": 19,
            "nome": "brigadeiro com morango",
            "descricao": "leite condensado, chocolate em pó, manteiga e creme de leite",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T19:13:44.892Z"
        },
        {
            "id": 20,
            "nome": "nutella com ninho",
            "descricao": "nutella, cobertura de leite ninho, leite moça, frutas e chocolate",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T19:16:45.532Z"
        },
        {
            "id": 21,
            "nome": "ninho com óreo",
            "descricao": "leite ninho, leite condensado, manteiga e biscoito óreo",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T19:19:03.414Z"
        },
        {
            "id": 22,
            "nome": "M&M",
            "descricao": "ganache de chocolate, brigadeiro mole, creme de avelã e M&M",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T19:22:12.272Z"
        },
        {
            "id": 23,
            "nome": "banoffe",
            "descricao": "doce de leite, banana, canela em pó, chantilly, chocolate e mussarela",
            "preco": 70.99,
            "quantidade": 1,
            "imagem": "",
            "createdAt": "2025-12-03T19:24:43.302Z"
            }
        ]
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