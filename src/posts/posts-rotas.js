const postsControlador = require('./posts-controlador');
const { middlewaresAutenticacao } = require('../usuarios');

module.exports = app => {
  app
    .route('/post')
    .get(postsControlador.lista)
    .post(
      /**
       * Estratégia de autenticação
       * Versao com a autenticacao padrao do passport
       */
      /*passport.authenticate('bearer', { session: false }),*/

      /**
       * Estratégia de autenticação
       * Versao customizada
       */
      middlewaresAutenticacao.bearer,
      postsControlador.adiciona
    );
};