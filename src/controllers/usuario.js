const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';

/**
 * Função de Cadastro de Usuário
 * Endpoint: POST /usuarios
 */
const create = async (req, res) => {
    try {
        const { nome, email, telefone, senha, cpf } = req.body;

        // 1. Validação básica
        if (!nome || !email || !telefone || !senha || !cpf) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios." });
        }

        // 2. Validação de formato de e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: "Formato de e-mail inválido." });
        }

        // 3. Limpeza e validação de CPF
        const cpfLimpo = cpf.replace(/\D/g, '');
        if (cpfLimpo.length !== 11) {
            return res.status(400).json({ error: "CPF deve conter 11 dígitos." });
        }

        // 4. Verifica se o usuário já existe (por e-mail ou CPF)
        const existingUser = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { email },
                    { cpf: cpfLimpo }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(409).json({ error: "E-mail já cadastrado." });
            }
            if (existingUser.cpf === cpfLimpo) {
                return res.status(409).json({ error: "CPF já cadastrado." });
            }
        }

        // 5. Hash da senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // 6. Cria o usuário no banco de dados
        const newUser = await prisma.usuario.create({
            data: {
                nome,
                email,
                telefone,
                senha: hashedPassword,
                tipo: 'CLIENTE',
                cpf: cpfLimpo,
            },
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                tipo: true,
                cpf: true,
            }
        });

        // 7. Gera o token de autenticação
        const token = jwt.sign(
            { userId: newUser.id, tipo: newUser.tipo }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        console.log(`✅ Usuário cadastrado com sucesso: ${newUser.email} (ID: ${newUser.id})`);

        return res.status(201).json({ 
            message: "Usuário cadastrado com sucesso!",
            token, 
            user: newUser 
        });

    } catch (error) {
        console.error("❌ Erro no cadastro:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor ao cadastrar."
        });
    }
};

/**
 * Função de Login
 * Endpoint: POST /usuarios/login
 */
const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Validação básica
        if (!email || !senha) {
            return res.status(400).json({ error: "E-mail e senha são obrigatórios." });
        }

        // 2. Busca o usuário pelo e-mail
        const user = await prisma.usuario.findUnique({ 
            where: { email } 
        });

        if (!user) {
            // Mensagem genérica por segurança
            return res.status(401).json({ error: "E-mail ou senha inválidos." });
        }

        // 3. Compara a senha
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            // Mensagem genérica por segurança
            return res.status(401).json({ error: "E-mail ou senha inválidos." });
        }

        // 4. Gera o token de autenticação
        const token = jwt.sign(
            { userId: user.id, tipo: user.tipo }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        // 5. Retorna o token e os dados do usuário (sem a senha)
        const { senha: _, ...userWithoutPassword } = user;

        console.log(`✅ Login realizado: ${user.email} (ID: ${user.id})`);

        return res.status(200).json({ 
            message: "Login realizado com sucesso!",
            token, 
            user: userWithoutPassword 
        });

    } catch (error) {
        console.error("❌ Erro no login:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor ao fazer login."
        });
    }
};

/**
 * Função para Listar Usuários (apenas para gerentes)
 * Endpoint: GET /usuarios
 */
const listar = async (req, res) => {
    try {
        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                nome: true,
                email: true,
                telefone: true,
                tipo: true,
                cpf: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({ usuarios });

    } catch (error) {
        console.error("❌ Erro ao listar usuários:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor ao listar usuários." 
        });
    }
};

/**
 * Função para Resetar Senha
 * Endpoint: POST /usuarios/resetar-senha
 */
const resetarSenha = async (req, res) => {
    try {
        const { email, novaSenha } = req.body;

        if (!email || !novaSenha) {
            return res.status(400).json({ error: "E-mail e nova senha são obrigatórios." });
        }

        // Busca o usuário
        const user = await prisma.usuario.findUnique({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado." });
        }

        // Hash da nova senha
        const hashedPassword = await bcrypt.hash(novaSenha, 10);

        // Atualiza a senha
        await prisma.usuario.update({
            where: { email },
            data: { senha: hashedPassword }
        });

        console.log(`✅ Senha resetada para: ${email}`);

        return res.status(200).json({ message: "Senha resetada com sucesso!" });

    } catch (error) {
        console.error("❌ Erro ao resetar senha:", error);
        return res.status(500).json({ 
            error: "Erro interno do servidor ao resetar senha." 
        });
    }
};

module.exports = { create, login, listar, resetarSenha };
