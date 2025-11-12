const prisma = require('../connect');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail'); // ✅ SendGrid para envio de email
const bcrypt = require('bcrypt');

const SECRET = process.env.JWT_SECRET || 'secreta';
const SECRET_RECUPERACAO = process.env.JWT_SECRET_RECUPERACAO || 'recuperar_senha';

// Configuração do SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Listar todos os usuários (somente ADMIN)
const listar = async (req, res) => {
  try {
    if (req.usuario.tipo !== "ADMIN") {
      return res.status(403).json({ erro: "Acesso negado. Apenas ADMIN pode listar usuários." });
    }

    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nome: true, cpf: true, email: true, telefone: true, tipo: true }
    });
    res.json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar usuários." });
  }
};

// Criar usuário com hash de senha
const create = async (req, res) => {
  const { nome, email, telefone, senha, tipo, cpf } = req.body; // ✅ Desestruturação corrigida
  try {
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    const usuario = await prisma.usuario.create({
      data: { 
        nome, 
        cpf, // ✅ Incluindo cpf
        email, 
        telefone, 
        senha: senhaHash,
        tipo: tipo || "CLIENTE"
      },
    });
    res.status(201).json({ message: "Usuário criado com sucesso!", usuario: { id: usuario.id, nome, email, tipo } });
  } catch (err) {
    console.error("Erro ao criar usuário:", err);
    if (err.code === 'P2002') { // Erro de duplicata (email ou cpf único)
      const mensagem = err.meta?.target?.includes('email') ? "E-mail já cadastrado." : "CPF já cadastrado.";
      return res.status(409).json({ message: mensagem });
    }
    res.status(400).json({ message: "Erro ao criar usuário." });
  }
};

// Login com comparação de hash
const login = async (req, res) => {
  const { email, senha } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'Email ou senha inválidos.' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo }, 
      SECRET, 
      { expiresIn: '2h' }
    );
    res.status(200).json({ message: 'Login bem-sucedido', token, tipo: usuario.tipo });
  } catch (err) {
    console.error("Erro no login:", err);
    res.status(400).json({ message: "Erro interno no login." });
  }
};

// Solicitar recuperação de senha
const solicitarRecuperacao = async (req, res) => {
  const { email } = req.body;
  try {
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return res.status(200).json({ message: 'Se o email estiver cadastrado, você receberá instruções.' });
    }

    const tokenRecuperacao = jwt.sign({ id: usuario.id }, SECRET_RECUPERACAO, { expiresIn: '15m' });
    const link = `https://erickaguiar06.github.io/front-TCC/resetar-senha.html?token=${tokenRecuperacao}`;

    const msg = {
      to: email,
      from: 'petshop4patas.oficial01@gmail.com', // ✅ Email verificado no SendGrid
      subject: 'Recuperação de Senha - 4 Patas PetShop',
      html: `<p>Você solicitou a recuperação de senha.</p>
             <p><a href="${link}">Clique aqui para redefinir sua senha</a></p>
             <p>Este link expira em 15 minutos.</p>`
    };

    await sgMail.send(msg);
    res.status(200).json({ message: 'Se o email estiver cadastrado, você receberá instruções.' });
  } catch (err) {
    console.error("Erro ao enviar email:", err);
    res.status(500).json({ message: 'Erro ao enviar email de recuperação.' });
  }
};

// Resetar senha com hash
const resetarSenha = async (req, res) => {
  const { token, novaSenha } = req.body;
  try {
    const decoded = jwt.verify(token, SECRET_RECUPERACAO);

    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(novaSenha, saltRounds);

    await prisma.usuario.update({
      where: { id: decoded.id },
      data: { senha: senhaHash }
    });

    res.status(200).json({ message: 'Senha redefinida com sucesso!' });
  } catch (err) {
    console.error("Erro no reset:", err);
    res.status(400).json({ message: 'Token inválido ou expirado.' });
  }
};

module.exports = {
  listar,
  create,
  login,
  solicitarRecuperacao,
  resetarSenha
};