const jwt = require('jsonwebtoken');
const cripto = require('crypto');
const moment = require('moment');

const blacklist = require('../../redis/manipula-blaklist');
const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');

/**
 * @param {*} usuario 
 * @returns 
 */
function criaTokenJWT(usuario) {
  const payload = {
    id: usuario.id
  };
  const token = jwt.sign(payload, process.env.CHAVE_JWT, { expiresIn: '15m' });
  return token;
}

/**
 * @param {*} usuario
 * @returns 
 */
function criaTokenOpaco(usuario) {
  const tokenOpaco = cripto.randomBytes(24).toString('hex');
  const dataExpiracao = moment().add(5, 'd').unix(); // 5 dias
  return tokenOpaco;
}

module.exports = {
  /**
   * @param {*} req 
   * @param {*} res 
   */
  async adiciona (req, res) {
    const { nome, email, senha } = req.body;

    try {
      const usuario = new Usuario({
        nome,
        email
      });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();
      res.status(201).json();
    } catch (erro) {
      if (erro instanceof InvalidArgumentError) {
        res.status(422).json({ erro: erro.message });
      } else if (erro instanceof InternalServerError) {
        res.status(500).json({ erro: erro.message });
      } else {
        res.status(500).json({ erro: erro.message });
      }
    }
  },

  /**
   * @param {*} req 
   * @param {*} res 
   */
  login(req, res) {
    try {
      const accessToken = criaTokenJWT(req.user);
      const refreshToken = criaTokenOpaco(req.user);
      res.set('Authorization', accessToken);
      res.status(200).json({ refreshToken });        
    } catch (erro) {
      res.status(500).json({ erro : erro.message});
    }
  },

  /**
   * @param {*} req 
   * @param {*} res 
   */
  async logout(req, res) {
    try {
      const token = req.token;
      await blacklist.adiciona(token);
      res.status(204).send();      
    } catch (erro) {
      res.status(500).send({erro : erro.message});
    }
  },

  /**
   * @param {*} req 
   * @param {*} res 
   */
  async lista(req, res) {
    const usuarios = await Usuario.lista();
    res.json(usuarios);
  },

  /**
   * @param {*} req 
   * @param {*} res 
   */
  async deleta(req, res) {
    const usuario = await Usuario.buscaPorId(req.params.id);
    try {
      await usuario.deleta();
      res.status(200).send();
    } catch (erro) {
      res.status(500).json({ erro: erro });
    }
  }
};
