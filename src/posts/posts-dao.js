const db = require('../../database');
const { InternalServerError } = require('../erros');

/**
 * Promissificando os comandos do DAO
 */
const { promisify } = require('util');
const dbRun = promisify(db.run).bind(db);
const dbAll = promisify(db.all).bind(db);

module.exports = {
  /**
   * @param {*} post 
   */
  async adiciona(post) {
    try {
      await dbRun(
        `INSERT INTO posts (
          titulo, 
          conteudo
        ) VALUES (?, ?)`,
        [post.titulo, post.conteudo]
      );
    } catch (error) {
      throw new InternalServerError('Erro ao adicionar o post!');  
    }
  },

  /**
   * @returns 
   */
  async lista() {
    try {
      return await dbAll(
        `SELECT * FROM posts`
      );
    } catch (error) {
      throw new InternalServerError('Erro ao listar os posts!');  
    }
  }
};
