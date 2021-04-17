const blacklist = require('./blacklist');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');

/** Transforma o "exists" do redis em uma Promise JS */
const existsAsync = promisify(blacklist.exists).bind(blacklist);
/** Transforma o "set" do redis em uma Promise JS */
const setAsync = promisify(blacklist.set).bind(blacklist);

/** 
 * "Encurta" o token para otimizar a busca 
 */
function gerarTokenHash(token) {
    return createHash('sha256').update(token).digest('hex');
}

module.exports={
    /**
     * Adiciona o token na blacklist
     * @param {*} token 
     */
    adiciona: async token => {
        /** Pega a data de expiração do payload */
        const dataExpiracao = jwt.decode(token).exp;
        /** Otimiza o token */
        const tokenHash = gerarTokenHash(token);
        /** Armazena o token otimizado */
        await setAsync(tokenHash, '');
        blacklist.expireat(tokenHash, dataExpiracao);
    },
    /**
     * Consulta se o token está na blacklist 
     * @param {*} token 
     * @returns 
     */
    contemToken: async token => {
        /** Otimiza o token */
        const tokenHash = gerarTokenHash(token); 
        /** Contulta o token otimizado */       
        const resultado = await existsAsync(tokenHash);
        return resultado === 1;
    }
}