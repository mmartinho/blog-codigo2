const usuariosDao = require('./usuarios-dao');
const { InvalidArgumentError } = require('../erros');
const validacoes = require('../validacoes-comuns');
const bcrypt = require('bcrypt');

class Usuario {
  /**
   * @param {*} usuario 
   */
  constructor(usuario) {
    this.id = usuario.id;
    this.nome = usuario.nome;
    this.email = usuario.email;
    this.senha = usuario.senhaHash;
    this.emailVerificado = usuario.emailVerificado;
    this.valida();
  }

  /**
   * @returns 
   * @throws Exception
   */
  async adiciona() {
    if (await Usuario.buscaPorEmail(this.email)) {
      throw new InvalidArgumentError('O usuário já existe!');
    }
    await usuariosDao.adiciona(this);
    const { id } = await usuariosDao.buscaPorEmail(this.email);
    this.id = id;
    return this;
  }

  /**
   * Novo método para validar e "hashear" a senha
   * @param {*} senha 
   */
  async adicionaSenha(senha) {
    validacoes.campoStringNaoNulo(senha, 'senha');
    validacoes.campoTamanhoMinimo(senha, 'senha', 8);
    validacoes.campoTamanhoMaximo(senha, 'senha', 64);    
    this.senhaHash = await Usuario.gerarSenhaHash(senha);
  }

  /**
   * 
   */
  valida() {
    validacoes.campoStringNaoNulo(this.nome, 'nome');
    validacoes.campoStringNaoNulo(this.email, 'email');
  }

  /**
   * Altera o estado de verificação do e-mail
   * do usuário
   */
  async verificaEmail() {
    this.emailVerificado = true;
    await usuariosDao.modificaEmailVerificado(this, this.emailVerificado);
  }

  /**
   * @returns 
   */
  async deleta() {
    return usuariosDao.deleta(this);
  }
  
  /**
   * @param {*} id 
   * @returns 
   */
  static async buscaPorId(id) {
    const usuario = await usuariosDao.buscaPorId(id);
    if (!usuario) {
      return null;
    }
    
    return new Usuario(usuario);
  }
  
  /**
   * @param {*} email 
   * @returns 
   */
  static async buscaPorEmail(email) {
    const usuario = await usuariosDao.buscaPorEmail(email);
    if (!usuario) {
      return null;
    }
    
    return new Usuario(usuario);
  }

  /**
   * @returns 
   */
  static lista() {
    return usuariosDao.lista();
  }

  /**
   * Criptografa a senha original
   * @param {*} senha 
   * @returns 
   */
  static gerarSenhaHash(senha) {
    const custoHash = 12;
    return bcrypt.hash(senha, custoHash);
  }
}

module.exports = Usuario;
