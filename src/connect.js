const { PrismaClient } = require('@prisma/client');

// Garante que a instância do PrismaClient seja única (singleton)
// Isso é importante para evitar problemas de conexão em ambientes como o Vercel
const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV === 'development') {
    global.prisma = prisma;
}

module.exports = prisma;
