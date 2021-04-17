const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const BearerStrategy = require('passport-http-bearer').Strategy;
const jwt = require('jsonwebtoken');

const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError } = require('../erros');
const blacklist = require('../../redis/manipula-blaklist');


/**
 * @param {*} usuario 
 */
function verificaUsuario(usuario) {
    if(!usuario) {
        throw new InvalidArgumentError('Não existe usuário com esse nome');
    }
}

/**
 * @param {*} senha 
 * @param {*} senhaHash 
 */
async function verificaSenha(senha, senhaHash) {
    const senhaValida = await bcrypt.compare(senha, senhaHash);
    if(!senhaValida) {
        throw new InvalidArgumentError('E-mail ou senha inválidos');
    }
}

/**
 * Verica se o token já está na lista de descartados
 * @param {*} token 
 */
async function verificaTokenNaBlacklist(token) {
    const tokenNaBlacklist = await blacklist.contemToken(token);
    if(tokenNaBlacklist) {
        throw new jwt.JsonWebTokenError('Token inválido por logout');
    }
}

/** 
 * Middleware: Estrategia de consulta de credenciais de usuário 
 */
passport.use(new LocalStrategy({
        usernameField : 'email',
        passwordField : 'senha',
        session: false
    }, 
    async (email, senha, done) => {
        try {
            const usuario = await Usuario.buscaPorEmail(email); 
            verificaUsuario(usuario);
            await verificaSenha(senha, usuario.senha);
            /** repassa o usuário pro próximo middleware */
            done(null, usuario);   
        } catch (error) {
            done(error);
        }
    }
));

/**
 * Middleware: Estratégia de verificação do token
 */
passport.use(new BearerStrategy(
    async (token, done) => {
        try {
            await verificaTokenNaBlacklist(token);
            const payload = jwt.verify(token, process.env.CHAVE_JWT);
            const usuario = await Usuario.buscaPorId(payload.id);
            /** repassa o usuário e o token pra pro próximo middleware */
            done(null, usuario, { token : token });                 
        } catch (error) {
            done(error);
        }
    }
));