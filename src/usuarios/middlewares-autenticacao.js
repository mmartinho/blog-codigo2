const passport = require('passport');

const Usuario = require('./usuarios-modelo');
const tokens = require('./tokens');

/**
 * Extendendo as estratégias do passport
 */
module.exports = {
    /**
     * Middleware: Autenticação local de usuário
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    local (req, res, next) {
        passport.authenticate(
            'local', 
            {session: false}, 
            (erro, usuario, info) => {
                /** Senha invalida */
                if(erro && erro.name === 'InvalidArgumentError') {
                    return res.status(401).json({ erro: erro.message });
                }
                /** Erro geral */ 
                if(erro) {
                    return res.status(500).json( {erro: erro.message});
                }
                /** Quando usuario nao é encontrado */
                if(!usuario) {
                    return res.status(401).json();
                }
                /** Insere o usuario na requisicao */
                req.user = usuario;
                /** Próximo middleware */
                return next();
            }
        )(req, res, next);
    },
    /**
     * Middleware: Autenticação de bearer token
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     */
    bearer (req, res, next) {
        passport.authenticate(
            'bearer',
            {session:false},
            (erro, usuario, info) => {
                /** Token invalido */
                if(erro && erro.name === 'JsonWebTokenError') {
                    return res.status(401).json({ erro: erro.message });
                }
                /** Token expirado */
                if(erro && erro.name === 'TokenExpiredError') {
                    return res.status(401).json({ 
                        erro: erro.message, 
                        expiradoEm: erro.expiredAt 
                    });
                }                
                /** Erro geral */
                if(erro) {
                    return res.status(500).json({ erro : erro.message });
                }
                /** Quando usuario nao é encontrado */
                if(!usuario) {
                    return res.status(401).json();
                }
                /** Insere o usuário na requisicao */
                req.user = usuario;
                /** 
                 * Insere o token na requisicao a partir do 
                 * middleware anterior
                 * @see src\usuarios\estrategias-autenticacao.js 
                 */
                req.token = info.token;
                /** Próximo middleware */
                return next();
            }
        )(req, res, next);
    },
    /**
     * Middleaware: Autenticação do refresh token
     * @param {*} req 
     * @param {*} res 
     * @param {*} next 
     * @returns 
     */
    async refresh(req, res, next){
        try {
            const { refreshToken } = req.body; 
            const id = await tokens.refresh.verifica(refreshToken);
            await tokens.refresh.invalida(refreshToken);
            req.user = await Usuario.buscaPorId(id);
            return next();            
        } catch (error) {
            if(error.name === 'InvalidArgumentError') {
                res.status(401).json({erro : error.message});
            }
            return res.status(500).json({erro: error.message});
        }
    }
};