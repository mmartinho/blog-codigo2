const Usuario = require('./usuarios-modelo');
const { InvalidArgumentError, InternalServerError } = require('../erros');

const tokens = require('./tokens');
const { EmailVerificacao } = require('./emails');

/**
 * @param {*} rota 
 * @param {*} token 
 * @returns 
 */
function geraEndereco(rota, token) {
  const baseUrl = process.env.BASE_URL;
  return `${baseUrl}${rota}/${token}`;
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
        email,
        emailVerificado : false
      });
      await usuario.adicionaSenha(senha);
      await usuario.adiciona();

      /**
       * Endereço de verificação
       */
      const token = tokens.verificacaoEmail.cria(usuario.id);
      const endereco = geraEndereco('/usuario/verifica_email', token);
      const emailVerificacao = new EmailVerificacao(usuario, endereco); 

      /** 
       * Enviando assíncronamente a mensagem 
       * de email (sem o await) 
       */
      emailVerificacao.enviaEmail(usuario).catch(console.log);
      
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
  },
  
  /**
   * @param {*} req 
   * @param {*} res 
   */
   async login(req, res) {
    try {
      const accessToken = tokens.access.cria(req.user.id);
      const refreshToken = await tokens.refresh.cria(req.user.id);
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
      await tokens.access.invalida(token);
      res.status(204).send();      
    } catch (erro) {
      res.status(500).send({erro : erro.message});
    }
  },

  /**
   * @param {*} req 
   * @param {*} res 
   */
  async verificaEmail(req, res) {
    try {
      const usuario = await req.user;
      await usuario.verificaEmail();
      res.status(200).json();
    } catch (error) {
      res.status(500).json({erro : error.message});
    }
  }
};
