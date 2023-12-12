const nodemailer = require('nodemailer');
  
class MailService {
  sendAcnivationMail(res, to, link) {   
    (async () => {  
    let transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 25,
      secure: false,
      auth: {
        user: 'infoimperial01@yandex.ru',
        pass: '9186120232dfy',
      },
    })

    let result = await transporter.sendMail({
      from: `infoimperial01@yandex.ru`,
      to: `webdev170291@yandex.ru`,
      // to: `infoimperial01@gmail.com`,
      subject:`Активация аккаунта imMemoryForever`,
      html: `Для активации аккаунта пройдите по ссылке ${link.bold()}` 
    })

    transporter.verify(function (error, success) { 
      if (error) {
        console.log(error);
      } else {
        console.log("Server is ready to take our messages");
      }
      });
    })();  
  } 
 
  sendConsultMail(res, byer_consult_initial, byer_consult_tel, coment_consult) {  
    if(byer_consult_tel !== '' && byer_consult_initial !== '') { 
      (async () => {
        let transporter = nodemailer.createTransport({
          host: 'smtp.yandex.ru',
          port: 25,
          secure: false,
          auth: {
            user: 'infoimperial01@yandex.ru',
            pass: '9186120232dfy',
          },
        })

        await transporter.sendMail({
          from: `infoimperial01@yandex.ru`,
          to: byer_consult_initial, 
          subject: `!! Запрос на обратную связь !!`,
          html: `Пользователь ${byer_consult_initial.bold()} запрашивает обратную связь по номеру телефона: ${byer_consult_tel.bold()}. Прислал сообщение с текстом: " ${coment_consult.bold()} "`,
        })

        transporter.verify(function (error, success) {  
          if (error) {
            res.status(200).send({msg: `Произошла ошибка: ${error}`}) 
          } else {
            res.status(200).send({msg: "Ожидайте в ближайшее время с вами свяжутся наши специалисты"}) 
          }
        });
    })();  
  } else {
    res.status(200).send({msg: "Проверьте правильность заполненых данных :("})
  }
  }  
 


}

module.exports = new MailService();
