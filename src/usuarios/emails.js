const nodemailer = require('nodemailer');

const configuracaoEmailTeste = (contaTeste) => {
    return { 
        host: 'smtp.ethereal.email', 
        auth: contaTeste
    }
};

const configuracaoEmailProducao = () => {
    return {
        host : process.env.EMAIL_HOST,
        auth: {
            user: process.env.EMAIL_USUARIO,
            pass: process.env.EMAIL_SENHA
        },
        secure: true
    }
}

class Email {
    from='';
    to='';
    subject='';
    text='';
    html='';    

    /**
     * 
     */
    async criaConfiguracaoEmail() {
        if(process.env.NODE_ENV === 'production') {
            return configuracaoEmailProducao();
        } else {
            const contaTeste = await nodemailer.createTestAccount();
            return configuracaoEmailTeste(contaTeste);
        }
    }

    /**
     * 
     */
    async enviaEmail() {
        const configuracaoEmail = await this.criaConfiguracaoEmail();
        const transportador = nodemailer.createTransport(configuracaoEmail); 
        const info = await transportador.sendMail(this);   
        if(process.env.NODE_ENV !== 'production')  {
            console.log('URL: '+nodemailer.getTestMessageUrl(info));
        }
    }    
}

class EmailVerificacao extends Email{
    constructor(usuario, endereco) {
        super();
        this.from = '"Blog do Código" <noreply@blogdocodigo.com.br>';
        this.to = usuario.email;
        this.subject = 'Verificação de e-mail';
        this.text = `Olá! Verifique o seu e-mail aqui: ${endereco}`;
        this.html = `<h1>Olá!</h1> <p>Verifique o seu e-mail <a href="${endereco}">clicando aqui</a></p>`;
    }
}

module.exports = { EmailVerificacao };