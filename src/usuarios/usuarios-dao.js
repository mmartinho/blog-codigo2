const db = require('../../database');
const { InternalServerError } = require('../erros');

/**
 * Primissificando os comandos do DAO
 */
const { promisify } = require('util');
const dbRun = promisify(db.run).bind(db);
const dbGet = promisify(db.get).bind(db);
const dbAll = promisify(db.all).bind(db);

module.exports = {
  /**
   * @param {*} usuario 
   */
  async adiciona(usuario) {
    try {
      await dbRun(
        `
          INSERT INTO usuarios (
            nome,
            email,
            senhaHash,
            emailVerificado
          ) VALUES (?, ?, ?, ?)
        `,
        [usuario.nome, usuario.email, usuario.senhaHash, usuario.emailVerificado]        
      );
    } catch (error) {
      throw new InternalServerError('Erro ao adicionar o usuário!');
    }
  },

  /**
   * @param {*} id 
   * @returns 
   */
  async buscaPorId(id) {
    try {
      /** Promisse */
      return await dbGet(
        `
          SELECT *
          FROM usuarios
          WHERE id = ?
        `,
        [id]        
      );
    } catch (error) {
      throw new InternalServerError('Não foi possível encontrar o usuário!');
    }
  },

  /**
   * @param {*} email 
   * @returns 
   */
  async buscaPorEmail(email) {
    try {
      /** Promisse */
      return await dbGet(
        `
          SELECT *
          FROM usuarios
          WHERE email = ?
        `,
        [email]        
      );
    } catch (error) {
      throw new InternalServerError('Não foi possível encontrar o usuário!');
    }
  },

  /**
   * @returns 
   */
  async lista() {
    try {
      /** Promisse */
      return await dbAll(
        `
          SELECT * FROM usuarios
        `        
      );
    } catch (error) {
      throw new InternalServerError('Erro ao listar usuários');
    }
  },

  /**
   * @param {*} usuario 
   * @param {*} emailVerificado 
   */
  async modificaEmailVerificado(usuario, emailVerificado) {
    try {
      await dbRun(`UPDATE usuarios SET emailVerificado = ? WHERE id = ?`, [
        emailVerificado,
        usuario.id
      ]);
    } catch (error) {
      throw new InternalServerError('Erro ao modificar a verificação de e-mail!');
    }
  },

  /**
   * @param {*} usuario 
   */
  async deleta(usuario) {
    try {
      /** Promisse */
      await dbRun(
        `
          DELETE FROM usuarios
          WHERE id = ?
        `,
        [usuario.id]        
      );
    } catch (error) {
      throw new InternalServerError('Erro ao deletar o usuário');
    }
  }
};
