var config = require('./config');
var fs = require('fs');
var nodemailer = require("nodemailer");
var transport = require('nodemailer-smtp-transport');

var smtpTransport = nodemailer.createTransport(transport(config.mail));

var sendMail = function(toAddress, content, next) {
  var mailOptions = {
    from: "Web amigo secreto",
    to: toAddress,
    subject: "Seu amigo secreto 2021",
    html: content,
    async: false,
  };

  smtpTransport.sendMail(mailOptions, next);
}; 

function leftPad(number, targetLength) {
    var output = number + '';
    while (output.length < targetLength) {
        output = '0' + output;
    }
    return output;
}

function obterData() {
    var dataAtual = new Date();
    var dia = leftPad(dataAtual.getDate(), 2);
    var mes = leftPad((dataAtual.getMonth() + 1), 2);
    var ano = leftPad(dataAtual.getFullYear(), 4);
    var horas = leftPad(dataAtual.getHours(), 2);
    var minutos = leftPad(dataAtual.getMinutes(), 2);
    return `${horas}h${minutos} ${dia}/${mes}/${ano}`;
}

const DATA_HORA = obterData();

var enviarMensagem = function(destinatario) {
    var template = './resultado.html';

    var content = fs.readFileSync(template)
                    .toString()
                    .replace('{{destinatario}}', destinatario.nome)
                    .replace('{{resultado}}', destinatario.amigo.nome)
                    .replace('{{dataHora}}', DATA_HORA);
    
    return new Promise(function (resolve, reject){
        sendMail(destinatario.email, content, function (err, response) {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                console.log(`Email enviado!`);
                resolve(response);
            }
        });
    });
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle...
    while (currentIndex != 0) {
  
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

async function main() {

    var participantes = config.people;
    
    shuffle(participantes);

    for(var i = 0; i < participantes.length; i++) {
        participantes[i].amigo = participantes[(i+1) % participantes.length];
    }

    shuffle(participantes);

    for(var i = 0; i < participantes.length; i++) {
        await enviarMensagem(participantes[i]);
    };
}

main();