const cripto = require('crypto');
const moment = require('moment');
const jwt = require('jsonwebtoken');

const { InvalidArgumentError } = require('../erros');
const allowlistRefreshToken = require('../../redis/allowlist-refresh-token');
const blocklistAccessToken = require('../../redis/blocklist-access-token');

/**
 * @param {*} id 
 * @param [] param1 
 * @returns 
 */
function criaTokenJWT(id,[tempoQuantidade, tempoUnidade]) {
    const payload = { id };
    const token = jwt.sign(
        payload, 
        process.env.CHAVE_JWT, 
        { expiresIn: tempoQuantidade+tempoUnidade }
    );
    return token;
}

/**
 * @param {*} id 
 * @param [] param1 
 * @param {*} allowlist 
 * @returns 
 */
async function criaTokenOpaco(id, [tempoQuantidade, tempoUnidade], allowlist) {
    const tokenOpaco = cripto.randomBytes(24).toString('hex');
    const dataExpiracao = moment().add(tempoQuantidade, tempoUnidade).unix(); // 5 dias
    await allowlist.adiciona(tokenOpaco, id, dataExpiracao);
    return tokenOpaco;
}

/**
 * @param {*} token 
 * @param {*} nome 
 * @param {*} allowlist 
 * @returns 
 */
 async function verificaTokenOpaco(token, nome, allowlist) {
    verificaTokenEnviado(token, nome);
    const id = await allowlist.buscaValor(token);
    verificaTokenValido(id, nome);
    return id;
}

/**
 * @param {*} id 
 * @param {*} nome 
 */
function verificaTokenValido(id, nome) {
    if (!id) {
        throw new InvalidArgumentError(`${nome} inválido`);
    }
}

/**
 * @param {*} token 
 * @param {*} nome 
 */
function verificaTokenEnviado(token, nome) {
    if (!token) {
        throw new InvalidArgumentError(`${nome} não enviado`);
    }
}

/**
 * @param {*} token 
 * @param {*} allowlist 
 */
 async function invalidaTokenOpaco(token, allowlist) {
    await allowlist.deleta(token);        
}

/**
 * @param {*} token 
 * @param {*} nome 
 * @param {*} blocklist 
 * @returns 
 */
async function verificaTokenJWT(token, nome, blocklist) {
    await verificaTokenNablocklist(token, nome, blocklist);
    const {id} = jwt.verify(token, process.env.CHAVE_JWT);
    return id;    
}

/**
 * @param {*} token 
 * @param {*} nome 
 * @param {*} blocklist 
 */
async function verificaTokenNablocklist(token, nome, blocklist) {
    const tokenNablocklist = await blocklist.contemToken(token);
    if(tokenNablocklist) {
        throw new jwt.JsonWebTokenError(`${nome} inválido por logout`);
    }
}

/**
 * @param {*} token 
 * @param {*} blocklist 
 * @returns 
 */
function invalidaTokenJWT(token, blocklist) {
    return blocklist.adiciona(token);
}

module.exports = {
    access: {
        nome: 'Access token',
        lista: blocklistAccessToken,
        expiracao: [15, 'm'],
        cria(id) {
            return criaTokenJWT(id, this.expiracao);
        },
        verifica(token) {
            return verificaTokenJWT(token, this.nome, this.lista);
        },
        invalida(token){
            return invalidaTokenJWT(token, this.lista);
        }
    },
    refresh: {
        nome: 'Refresh token',
        lista: allowlistRefreshToken,
        expiracao: [5,'d'],
        cria(id) {
            return criaTokenOpaco(id, this.expiracao, this.lista);
        },
        verifica(token) {
            return verificaTokenOpaco(token, this.nome, this.lista);
        },
        invalida(token) {
            return invalidaTokenOpaco(token, this.lista);
        }        
    }
}