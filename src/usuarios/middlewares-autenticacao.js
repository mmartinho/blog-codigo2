const passport = require('passport');

/**
 * Extendendo as estratégias do passport
 */
module.exports = {
    local : (req, res, next) => {
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
                req.user = usuario;
                return next();
            }
        )(req, res, next);
    },
    bearer : (req, res, next) => {
        passport.authenticate(
            'bearer',
            {session:false},
            (erro, usuario, info) => {
                /** Token invalido */
                if(erro && erro.name === 'JsonWebTokenError') {
                    return res.status(401).json({ erro: erro.message });
                }
                /** Erro geral */
                if(erro) {
                    return res.status(500).json({ erro : erro.message });
                }
                /** Quando usuario nao é encontrado */
                if(!usuario) {
                    return res.status(401).json();
                }
                require.use = usuario;
                return next();
            }
        )(req, res, next);
    }
};