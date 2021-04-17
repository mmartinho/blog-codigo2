const usuariosControlador = require('./usuarios-controlador');
const middlewaresAutenticacao = require('./middlewares-autenticacao');

module.exports = app => {
  app.route('/usuario/login')
    .post(
        /**
         * Estratégia de login local sem sessao.
         * Versao com a autenticacao padrao do passport
         */
        /* passport.authenticate('local', {session:false} ), */
        
        /**
         * Estratégia de login local sem sessao.
         * Versao customizada
         */
        middlewaresAutenticacao.local, 
        usuariosControlador.login
    );
    
  app.route('/usuario/logout')
    .get(
      middlewaresAutenticacao.bearer,
      usuariosControlador.logout
    );

  app.route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app.route('/usuario/:id').delete(
      /**
      * Estratégia de autenticação
      * Versao com a autenticacao padrao do passport
      */
      /*passport.authenticate('bearer', {session: false}),*/

      /**
       * Estratégia de autenticação
       * Versao com autenticacao customizada
       */
      middlewaresAutenticacao.bearer,
      usuariosControlador.deleta
    );

};
