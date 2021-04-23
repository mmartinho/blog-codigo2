const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const BearerStrategy = require('passport-http-bearer').Strategy;

const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError } = require('../erros');
const tokens = require('./tokens');

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
            const id = await tokens.access.verifica(token);
            const usuario = await Usuario.buscaPorId(id);
            /** repassa o usuário e o token pra pro próximo middleware */
            done(null, usuario, { token : token });                 
        } catch (error) {
            done(error);
        }
    }
));