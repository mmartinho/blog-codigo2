const usuariosControlador = require('./usuarios-controlador');
const middlewaresAutenticacao = require('./middlewares-autenticacao');
const { refresh } = require('./middlewares-autenticacao');

module.exports = app => {
  app.route('/usuario/atualiza_token')
    .post(
      middlewaresAutenticacao.refresh, 
      usuariosControlador.login
    );

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
    /**
     * Alterado de "get" para "post" para permitir inserir dados no corpo
     * .get( */
    .post(
      /** 
       * Colocamos dois middlewares no mesmo argumento:
       * executa primeiro o "refresh", depois o "bearer", 
       * pra depois chamar o controlador 
       **/
      [middlewaresAutenticacao.refresh, middlewaresAutenticacao.bearer],
      usuariosControlador.logout
    );

  app.route('/usuario')
    .post(usuariosControlador.adiciona)
    .get(usuariosControlador.lista);

  app.route('/usuario/verifica_email/:token')
    .get(
      middlewaresAutenticacao.verificacaoEmail,
      usuariosControlador.verificaEmail
    );

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
