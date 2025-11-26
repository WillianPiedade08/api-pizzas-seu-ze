const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_padrao';

/**
 * Middleware para autenticar requisições usando JWT
 * Verifica se o token é válido e adiciona os dados do usuário em req.user
 */
const autenticarJWT = (req, res, next) => {
    try {
        // Pega o token do header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ 
                error: "Token de autenticação não fornecido.",
                message: "Envie o token no header Authorization: Bearer <token>"
            });
        }

        // Formato esperado: "Bearer TOKEN"
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({ 
                error: "Formato de token inválido.",
                message: "Use o formato: Bearer <token>"
            });
        }

        const token = parts[1];

        // Verifica e decodifica o token
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ 
                        error: "Token expirado.",
                        message: "Faça login novamente."
                    });
                }
                
                return res.status(401).json({ 
                    error: "Token inválido.",
                    message: "O token fornecido não é válido."
                });
            }

            // Adiciona os dados do usuário na requisição
            req.user = {
                userId: decoded.userId,
                tipo: decoded.tipo
            };

            next();
        });

    } catch (error) {
        console.error("❌ Erro na autenticação:", error);
        return res.status(500).json({ 
            error: "Erro interno ao autenticar." 
        });
    }
};

/**
 * Middleware para verificar se o usuário é gerente
 * Deve ser usado após o middleware autenticarJWT
 */
const verificargerente = (req, res, next) => {
    try {
        // O req.user é adicionado pelo autenticarJWT
        if (!req.user || req.user.tipo !== 'GERENTE') {
            return res.status(403).json({ 
                error: "Acesso negado.",
                message: "Apenas gerentes podem acessar este recurso."
            });
        }

        next();

    } catch (error) {
        console.error("❌ Erro na verificação de permissão:", error);
        return res.status(500).json({ 
            error: "Erro interno ao verificar permissões." 
        });
    }
};

module.exports = { 
    autenticarJWT, 
    verificargerente
};
