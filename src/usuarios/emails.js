const nodemailer = require('nodemailer');

class Email {
    from='';
    to='';
    subject='';
    text='';
    html='';    

    async enviaEmail() {
        const contaTeste = await nodemailer.createTestAccount();
        const transportador = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            auth: contaTeste
        }); 
        const info = await transportador.sendMail(this);   
        console.log('URL: '+nodemailer.getTestMessageUrl(info));
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