const jwt = require('jsonwebtoken');
const { createHash } = require('crypto');
const redis = require('redis');

const blocklist = redis.createClient({prefix: 'blocklist-access-token:'});
const manipulaLista = require('./manipula-lista');
const manipulaBlocklist = manipulaLista(blocklist);

/** 
 * Gera uma chave de identificação baseada no token
 * @returns string
 */
function gerarTokenHash(token) {
    return createHash('sha256').update(token).digest('hex');
}

module.exports={
    /**
     * Adiciona o token na blocklist
     * @param {*} token 
     */
    async adiciona(token) {
        /** Pega a data de expiração do payload */
        const dataExpiracao = jwt.decode(token).exp;
        /** Gera uma chave pro token */
        const tokenHash = gerarTokenHash(token);
        /** Armazena a chave do token */
        await manipulaBlocklist.adiciona(tokenHash, '', dataExpiracao);
    },
    /**
     * Consulta se o token está na blocklist 
     * @param {*} token 
     * @returns 
     */
    contemToken(token) {
        /** Gera a chave de busca do token */
        const tokenHash = gerarTokenHash(token); 
        /** Consulta a chave do token */       
        return manipulaBlocklist.contemChave(tokenHash);
    }
}