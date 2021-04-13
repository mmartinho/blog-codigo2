const passport = require('passport');
const LocalStrategy = require('passport-local');
const bcrypt = require('bcrypt');

const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError } = require('../erros');


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
passport.use(
    new LocalStrategy({
        usernameField : 'email',
        passwordField : 'senha',
        session: false
    }, async (email, senha, done) => {
        try {
            const usuario = await Usuario.buscaPorEmail(email); 
            verificaUsuario(usuario);
            console.log(usuario);
            await verificaSenha(senha, usuario.senha);
            done(null, usuario);   
        } catch (error) {
            done(error);
        }
    })
);