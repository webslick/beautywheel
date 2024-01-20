const TelegramBot = require('node-telegram-bot-api'); 
require('dotenv').config()
const fs = require('fs');
const path = require('path')
const SESSION = require('../db/index');  
var Pages = {};

process.env.NTBA_FIX_319 = "1";

const TGAPI = {
  initialBotListner: botStart
}

function botStart (ADMINSETTINGS) {
  Pages = require('./pages');

  Pages.changePage(ADMINSETTINGS,'main',Pages.main); // Главная 
  
  const bot = new TelegramBot(process.env.TGBOT_API_KEY, { polling: true });
 
  bot.on('message', async (msg, { type }) => {
    try { 

      const { date, message_id, text, chat: { id, username }, from: { is_bot, last_name, first_name, language_code} } = msg;
 
      var uniqm = false;
      
      console.log(msg)
      if(msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            console.log(data)
            // await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
            // await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
            // await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);

            // setTimeout(async () => {
            //     await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
            // }, 3000)

            // await bot.answerWebAppQuery(queryId,{
            //   type: 'article',
            //   id: queryId,
            //   title: 'Выйгран приз',
            //   input_message_content: {
            //     message_text: 'Поздравляем вы выйграли ЛИцо в гавно!'
            //   }
              
            // });


        } catch (e) {
            console.log(e);
        }
      }
  
      if (
        text === `/reboot ${ADMINSETTINGS.password}` 
        || text === '/start'
        || text === `/help`  
      ) {

        // if(SESSION.isFerstSession(id) && uniqm) { // Зашел в первый раз 
          if (text === '/start') {
            console.log('КОМАНДА',text)
            console.log('Pages.inline_main.buttons',Pages)

            await bot.sendPhoto(msg.chat.id, path.resolve('bot_TG_API', './assets/lera.jpg'), { 
              caption: `${Pages.main.text.replace ('*Наш бот поможет Вам:*',`*${first_name}, приглашаю тебя принять участие в нашем розыгрыше призов?*`)}`,
              reply_markup: { 
                inline_keyboard: Pages.main.buttons, 
                resize_keyboard: true
              }, 
              parse_mode: 'Markdown'
            });

           
          // await bot.editMessageCaption('caption', 
          //  {
          //    chat_id: test.chat.id, 
          //    message_id: test.message_id,
          //    caption: `@!${Pages.main.text.replace (/^/,`*\n\n${first_name},* `)}`,
          //    reply_markup: { 
          //      inline_keyboard: Pages.keyboard_offer,
          //      disable_web_page_preview: false,
          //      resize_keyboard: true
          //    },
          //    parse_mode: 'Markdown'
          //  }); 
  
            // await bot.sendMessage(id,` `,{
              // reply_markup: {
              //   keyboard: Pages.main.buttons,
              //   resize_keyboard: true
              // },
              // parse_mode: 'Markdown',
            // });
    
            // SESSION.initionalLocal(msg);
            // SESSION.initionalGlobal(msg);
          }
   
          if (text === '📕 Продать') { 
         
            await bot.sendMessage(id,`${Pages.sale.text}`,{
              reply_markup: {
                keyboard: Pages.sale.buttons,
                resize_keyboard: true
              },
              parse_mode: 'Markdown',
            });

            active_page = 'sales';
            SESSION.putUserSession(id,{ info_user: { active_page } });
          }
   
          if (text === '📥 Добавить лот') { 
    
            await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
              reply_markup: {
                keyboard: Pages.addlot.buttons,
                resize_keyboard: true
              },
              parse_mode: 'Markdown',
            });

            active_page = 'addlot';
            SESSION.putUserSession(id,{ info_user: { active_page } });
          }
   
          if (text === '📃 Описание') {   
            await bot.sendMessage(id,`add_lot: ${add_lot}\n\n
            change_lot: ${change_lot}\n\n
            del_lot: ${del_lot}\n\n
            add_photo: ${add_photo}\n\n 
            edit_photo: ${edit_photo}\n\n 
            tmp_photo_id: ${tmp_photo_id}\n\n 
            tmp_photo_lot: ${tmp_photo_lot}\n\n 
            photo_id: ${photo_id}\n\n 
            photo_lot: ${photo_lot}\n\n 
            add_name: ${add_name}\n\n 
            edit_name: ${edit_name}\n\n 
            tmp_name_lot: ${tmp_name_lot}\n\n 
            name_lot: ${name_lot}\n\n 
            add_list: ${add_list}\n\n 
            edit_list: ${edit_list}\n\n 
            tmp_list_lot: ${tmp_list_lot}\n\n 
            list_lot: ${list_lot}\n\n 
            add_ceil: ${add_ceil}\n\n 
            edit_ceil: ${edit_ceil}\n\n 
            tmp_ceil_lot: ${tmp_ceil_lot}\n\n 
            ceil_lot: ${ceil_lot}
            `,{
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: 'скачать фото', 
                      url: `${photo_lot}`,
                      callback_data: 'info'
                    },
                  ]
                ],
                resize_keyboard: true
              },
              parse_mode: 'html',
            });
          }
   
          if (text === '💵 Цена') {   
                     
            if(ceil_lot == '') {
              add_ceil = true;
              edit_ceil = false;

              await bot.sendMessage(id,`Напишите цену товара.`,{
                reply_markup: {
                  keyboard: [
                    [
                      {
                        text: 'Возвратиться', 
                      },
                      {
                        text: 'Сохранить цену',   
                      } 
                    ], 
                  ],
                  resize_keyboard: true
                },
                parse_mode: 'Markdown',
              });
            } 
            
            if(ceil_lot != '')  {
              add_ceil = false;
              edit_ceil = true;

              await bot.sendMessage(id,`Цена уже была сохранена, хотите её изменить?`,{
                reply_markup: {
                  keyboard: [
                    [
                      {
                        text: 'Не изменять', 
                      },
                      {
                        text: 'Изменить цену',   
                      } 
                    ], 
                  ],
                  resize_keyboard: true
                },
                parse_mode: 'Markdown',
              });
            }
 
          }
    
          if (text === '📃 Название') {  
            
            if(name_lot == '') {
              add_name = true;
              edit_name = false;

              await bot.sendMessage(id,`Напишите название товара.`,{
                reply_markup: {
                  keyboard: [
                    [
                      {
                        text: 'Вернуться', 
                      },
                      {
                        text: 'Сохранить название',   
                      } 
                    ], 
                  ],
                  resize_keyboard: true
                },
                parse_mode: 'Markdown',
              });
            } 
            
            if(name_lot != '')  {
              add_name = false;
              edit_name = true;

              await bot.sendMessage(id,`Название уже было сохранено, хотите его изменить?`,{
                reply_markup: {
                  keyboard: [
                    [
                      {
                        text: 'Нет, не хочу', 
                      },
                      {
                        text: 'Изменить название',   
                      } 
                    ], 
                  ],
                  resize_keyboard: true
                },
                parse_mode: 'Markdown',
              });
            }
 
          }
 
          if (text === '📸 фото') { 
         
            if(photo_lot == '') {
              add_lot = true;
              await bot.sendMessage(id,`Прикрепите/Отправьте фото товара.`,{
                reply_markup: {
                  keyboard: [
                    [
                      {
                        text: 'Вернуться назад', 
                      },
                      {
                        text: 'Сохранить фото',   
                      } 
                    ], 
                  ],
                  resize_keyboard: true
                },
                parse_mode: 'Markdown',
              });
            } else {
              await bot.sendMessage(id,`Фото уже было сохранено, хотите его изменить?`,{
                reply_markup: {
                  keyboard: [
                    [
                      {
                        text: 'Нет, спасибо', 
                      },
                      {
                        text: 'Изменить фото',   
                      } 
                    ], 
                  ],
                  resize_keyboard: true
                },
                parse_mode: 'Markdown',
              });
            }
 
          }
 
          if (text === '📗 Купить') {

            await bot.sendMessage(id,Pages.purchase.text,{
              reply_markup: {
                keyboard: Pages.purchase.buttons,
                resize_keyboard: true
              },
              parse_mode: 'Markdown',
            });

            await bot.sendMessage(id,`__Условия оферты по ссылке ниже__`,{
              reply_markup: { 
                inline_keyboard: Pages.keyboard_offer,
                disable_web_page_preview: false,
                resize_keyboard: true
              },
              parse_mode: 'Markdown',
            });

            active_page = 'purchase';
            SESSION.putUserSession(id,{ info_user: { active_page } });
          }
   
          if (text === '⤴️ Главное меню') {
            await bot.sendMessage(id,Pages.main.text,{
              reply_markup: {
                keyboard: Pages.main.buttons,
                resize_keyboard: true
              },
              parse_mode: 'Markdown',
            });
            active_page = 'main';
            SESSION.putUserSession(id,{ info_user: { active_page } });
          }
  
        // } else {
        //   if (SESSION.getUserSession(id) === null) {
        //     await bot.sendMessage(id,`*Давненько тебя небыло ${first_name}*\n\n          Позволь напомнить что я умею!`,{
        //       reply_markup: {
        //         inline_keyboard: Pages.keyboard_loading,
        //         resize_keyboard: true
        //       },
        //       parse_mode: 'Markdown',
        //     });
        //     setTimeout(async ()=>{
        //       Pages.changePageMainAgain(ADMINSETTINGS,Pages.main); 
        //       await bot.sendMessage(id,`${`*С возвращением ${first_name}!*\n` + Pages.main.text}`,{
        //         reply_markup: {
        //           keyboard: Pages.main.buttons,
        //           resize_keyboard: true
        //         },
        //         parse_mode: 'Markdown',
        //       });
        //       SESSION.initionalLocal(msg);
        //       SESSION.initionalGlobal(msg);
        //     },5000)
        //   } else {
        //     if (text === '/start') {
        //       Pages.changePageMainAgain(ADMINSETTINGS,Pages.main); 
        //       await bot.sendMessage(id,`${`*С возвращением ${first_name}!*\n` + Pages.main.text}`,{
        //         reply_markup: {
        //           keyboard: Pages.main.buttons,
        //           resize_keyboard: true
        //         },
        //         parse_mode: 'Markdown',
        //       });
        //     }
            
        //     if (text === `/reboot ${ADMINSETTINGS.password}` ) {
        //       await bot.sendMessage(id,'Бот будет перезагружен в течении минуты ...',{
        //         parse_mode: 'Markdown',
        //       });
        //     }
        
        //     if (text === `/help` ) {
        //       await bot.sendMessage(id,'По вопросам / предложениям работы бота просим писать @iZykAlex',{
        //         parse_mode: 'Markdown',
        //       });
        //     }
       
   
      } else { // если не команда а просто сообщение
   
        console.log('НЕКОМАНДА')

        switch (type) {
          case 'text': // Простое сообщение и смайлики 
 
            if(add_ceil) { 
            
              console.log('text add_ceil',text)
              console.log('tmp_ceil_lot',tmp_ceil_lot)

              if(!!Number(text)) {
                if(text.length >= 6) { 
                  await bot.sendMessage(id,`Слишком высокая цена товара. Поставьте дешевле`,{
                    reply_markup: {
                      keyboard: [
                        [
                          {
                            text: 'Возвратиться', 
                          },
                          {
                            text: 'Сохранить цену',   
                          } 
                        ], 
                      ],
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
                } else if(text !== "Возвратиться" && text !== "Сохранить цену" && tmp_ceil_lot == '') {
                  tmp_ceil_lot = text;
   
                  await bot.sendMessage(id,`Цена принята, если всё хорошо нажмите Сохранить цену.`,{
                    reply_markup: {
                      keyboard: [
                        [
                          {
                            text: 'Возвратиться', 
                          },
                          {
                            text: 'Сохранить цену',   
                          } 
                        ], 
                      ],
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
                } else if(tmp_ceil_lot != '' && text !== "Возвратиться" && text !== "Сохранить цену") {
                  await bot.sendMessage(id,`Пожалуйста выберайте кнопками)`,{ 
                    parse_mode: 'Markdown',
                  });
                }
              } else if(tmp_ceil_lot != '' && text !== "Возвратиться" && text !== "Сохранить цену") {
                await bot.sendMessage(id,`Пожалуйста выберайте кнопками)`,{ 
                  parse_mode: 'Markdown',
                });
              } else if(text !== "Возвратиться" && text !== "Сохранить цену") {
                await bot.sendMessage(id,`Введите цену только цифрами!`,{
                  reply_markup: {
                    keyboard: [
                      [
                        {
                          text: 'Возвратиться', 
                        },
                        {
                          text: 'Сохранить цену',   
                        } 
                      ], 
                    ],
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
              }
 
              if(text === "Возвратиться") { 

                add_ceil = false; 
                ceil_lot = '';
                tmp_ceil_lot = '';
    
                await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                  reply_markup: {
                    keyboard: Pages.addlot.buttons,
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
 
              }
    
              if(text === "Сохранить цену") {

                if(tmp_ceil_lot == '') {
                  await bot.sendMessage(id,`Напишите цену товара.`,{
                    reply_markup: {
                      keyboard: [
                        [
                          {
                            text: 'Возвратиться', 
                          },
                          {
                            text: 'Сохранить цену',   
                          } 
                        ], 
                      ],
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
                } else {
                  add_ceil = false; 

                  await bot.sendMessage(id,`Цена сохранена, продолжайте заполнение.`,{ 
                    parse_mode: 'Markdown',
                  });
                  
                  ceil_lot = tmp_ceil_lot

                  await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                    reply_markup: {
                      keyboard: Pages.addlot.buttons,
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
                   
                  tmp_ceil_lot = ''; 
                }
               
              }
  

            } else if (edit_ceil) {
              console.log('text edit_ceil',text)
  


              // if(!!Number(text)) {
              //   // if(text.length >= 6) { 
              //   //   await bot.sendMessage(id,`Слишком высокая цена товара. Поставьте дешевле`,{
              //   //     reply_markup: {
              //   //       keyboard: [
              //   //         [
              //   //           {
              //   //             text: 'Возвратиться', 
              //   //           },
              //   //           {
              //   //             text: 'Сохранить цену',   
              //   //           } 
              //   //         ], 
              //   //       ],
              //   //       resize_keyboard: true
              //   //     },
              //   //     parse_mode: 'Markdown',
              //   //   });
              //   // } else if(text !== "Возвратиться" && text !== "Сохранить цену" && tmp_ceil_lot == '') {
              //   //   tmp_ceil_lot = text;
   
              //   //   await bot.sendMessage(id,`Цена принята, если всё хорошо нажмите Сохранить цену.`,{
              //   //     reply_markup: {
              //   //       keyboard: [
              //   //         [
              //   //           {
              //   //             text: 'Возвратиться', 
              //   //           },
              //   //           {
              //   //             text: 'Сохранить цену',   
              //   //           } 
              //   //         ], 
              //   //       ],
              //   //       resize_keyboard: true
              //   //     },
              //   //     parse_mode: 'Markdown',
              //   //   });
              //   // } else if(tmp_ceil_lot != '' && text !== "Возвратиться" && text !== "Сохранить цену") {
              //   //   await bot.sendMessage(id,`Пожалуйста выберайте кнопками)`,{ 
              //   //     parse_mode: 'Markdown',
              //   //   });
              //   // }
              // } else if(tmp_ceil_lot != '' && text !== "Возвратиться" && text !== "Сохранить цену") {
              //   await bot.sendMessage(id,`Пожалуйста выберайте кнопками)`,{ 
              //     parse_mode: 'Markdown',
              //   });
              // } else if(text !== "Возвратиться" && text !== "Сохранить цену") {
              //   await bot.sendMessage(id,`Введите цену только цифрами!`,{
              //     reply_markup: {
              //       keyboard: [
              //         [
              //           {
              //             text: 'Возвратиться', 
              //           },
              //           {
              //             text: 'Сохранить цену',   
              //           } 
              //         ], 
              //       ],
              //       resize_keyboard: true
              //     },
              //     parse_mode: 'Markdown',
              //   });
              // }
 
             
              if(!!Number(text)) {
                if(text !== "Не изменять" && text !== "Изменить цену" && text !== "Оставить такой же" && text !== "Сохранить новую цену") {
                  ceil_lot = text;
                  await bot.sendMessage(id,`Цена принята, если всё хорошо нажмите Сохранить новую цену.`,{ 
                    reply_markup: {
                      keyboard: [
                        [
                          {
                            text: 'Оставить такой же', 
                          },
                          {
                            text: 'Сохранить новую цену',   
                          } 
                        ], 
                      ],
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
                } 
              } else if(text !== "Не изменять" && text !== "Изменить цену" && text !== "Оставить такой же" && text !== "Сохранить новую цену" && tmp_ceil_lot == '') { 
                await bot.sendMessage(id,`Пожалуйста выберайте кнопками)`,{ 
                  parse_mode: 'Markdown',
                });
              } else {
                  await bot.sendMessage(id,`Введите цену только цифрами!`,{
                    reply_markup: {
                      keyboard: [
                        [
                          {
                            text: 'Оставить такой же', 
                          },
                          {
                            text: 'Сохранить новую цену',   
                          } 
                        ], 
                      ],
                      resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
              }
 
              if(text === "Сохранить новую цену") {
                
                if(ceil_lot == '') {
                  await bot.sendMessage(id,`Напишите новую цену товара.`,{
                    reply_markup: {
                      keyboard: [
                        [
                          {
                            text: 'Оставить такой же', 
                          },
                          {
                            text: 'Сохранить новую цену',   
                          } 
                        ], 
                      ],
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
                } else {
                  edit_ceil = false; 

                  await bot.sendMessage(id,`Цена сохранена, продолжайте заполнение.`,{ 
                    parse_mode: 'Markdown',
                  });
                  
                  await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                    reply_markup: {
                      keyboard: Pages.addlot.buttons,
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
         
                  tmp_ceil_lot = ''; 
                }
              
   
              }
 
              if(text === "Оставить такой же") { 

                edit_ceil = false; 

                ceil_lot = tmp_ceil_lot; 

                tmp_ceil_lot = '';
  
                await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                  reply_markup: {
                    keyboard: Pages.addlot.buttons,
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
                active_page = 'addlot';
              }

              if(text === "Не изменять") {   

                add_ceil = false;  
                edit_ceil = false;  

                tmp_ceil_lot = '';

                await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                  reply_markup: {
                    keyboard: Pages.addlot.buttons,
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
                active_page = 'addlot'; 
              }

              if(text === "Изменить цену") {
             
                tmp_ceil_lot = ceil_lot; 
                ceil_lot = ''; 
  
                await bot.sendMessage(id,`Напишите новую цену товара.`,{
                  reply_markup: {
                    keyboard: [
                      [
                        {
                          text: 'Оставить такой же', 
                        },
                        {
                          text: 'Сохранить новую цену', 
                        } 
                      ], 
                    ],
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });   
              }

            }
 
            if(add_name) { 
           
              console.log('text add_name',text)
              console.log('tmp_name_lot',tmp_name_lot)

              if(text.length >= 100) { 
                await bot.sendMessage(id,`Слишком длинное название товара. Попробуйте покороче`,{
                  reply_markup: {
                    keyboard: [
                      [
                        {
                          text: 'Вернуться', 
                        },
                        {
                          text: 'Сохранить название',   
                        } 
                      ], 
                    ],
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
              } else if(text !== "Вернуться" && text !== "Сохранить название" && tmp_name_lot == '') {
                tmp_name_lot = text;
 
                await bot.sendMessage(id,`Название принято, если всё хорошо нажмите Сохранить название.`,{
                  reply_markup: {
                    keyboard: [
                      [
                        {
                          text: 'Вернуться', 
                        },
                        {
                          text: 'Сохранить название',   
                        } 
                      ], 
                    ],
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
              } else if(tmp_name_lot != '' && text !== "Вернуться" && text !== "Сохранить название") {
                await bot.sendMessage(id,`Пожалуйста выберайте кнопками)`,{ 
                  parse_mode: 'Markdown',
                });
              }
   
              if(text === "Вернуться") { 

                add_name = false; 
                name_lot = '';
                tmp_name_lot = '';
    
                await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                  reply_markup: {
                    keyboard: Pages.addlot.buttons,
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
 
              }
    
              if(text === "Сохранить название") {

                if(tmp_name_lot == '') {
                  await bot.sendMessage(id,`Напишите название товара.`,{
                    reply_markup: {
                      keyboard: [
                        [
                          {
                            text: 'Вернуться', 
                          },
                          {
                            text: 'Сохранить название',   
                          } 
                        ], 
                      ],
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
                } else {
                  add_name = false; 

                  await bot.sendMessage(id,`Название сохранено, продолжайте заполнение.`,{ 
                    parse_mode: 'Markdown',
                  });
                  
                  name_lot = tmp_name_lot

                  await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                    reply_markup: {
                      keyboard: Pages.addlot.buttons,
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
                   
                  tmp_name_lot = ''; 
                }
               
              }
  

            } else if (edit_name) {
              console.log('text edit_name',text)
  
              if(text !== "Нет, не хочу" && text !== "Изменить название" && text !== "Оставить таким же" && text !== "Сохранить новое название" && tmp_name_lot == '') { 
                await bot.sendMessage(id,`Пожалуйста выберайте кнопками)`,{ 
                  parse_mode: 'Markdown',
                });
              } else if(text !== "Изменить название" && text !== "Сохранить новое название" && text !== "Нет, не хочу" && text !== "Оставить таким же") {
                name_lot = text;
                await bot.sendMessage(id,`Название принято, если всё хорошо нажмите Сохранить новое название.`,{ 
                  reply_markup: {
                    keyboard: [
                      [
                        {
                          text: 'Оставить таким же', 
                        },
                        {
                          text: 'Сохранить новое название',   
                        } 
                      ], 
                    ],
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
              }
  
 
              if(text === "Сохранить новое название") {
                
                if(name_lot == '') {
                  await bot.sendMessage(id,`Напишите новое название товара.`,{
                    reply_markup: {
                      keyboard: [
                        [
                          {
                            text: 'Оставить таким же', 
                          },
                          {
                            text: 'Сохранить новое название',   
                          } 
                        ], 
                      ],
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
                } else {
                  edit_name = false; 

                  await bot.sendMessage(id,`Название сохранено, продолжайте заполнение.`,{ 
                    parse_mode: 'Markdown',
                  });
                  
                  await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                    reply_markup: {
                      keyboard: Pages.addlot.buttons,
                      resize_keyboard: true
                    },
                    parse_mode: 'Markdown',
                  });
         
                  tmp_name_lot = ''; 
                }
              
   
              }
 
              if(text === "Оставить таким же") { 

                edit_name = false; 

                name_lot = tmp_name_lot; 

                tmp_name_lot = '';
  
                await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                  reply_markup: {
                    keyboard: Pages.addlot.buttons,
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
                active_page = 'addlot';
              }

              if(text === "Нет, не хочу") {   

                add_name = false;  
                edit_name = false;  

                tmp_name_lot = '';

                await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
                  reply_markup: {
                    keyboard: Pages.addlot.buttons,
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });
                active_page = 'addlot'; 
              }

              if(text === "Изменить название") {
             
                tmp_name_lot = name_lot; 
                name_lot = ''; 
  
                await bot.sendMessage(id,`Напишите новое название товара.`,{
                  reply_markup: {
                    keyboard: [
                      [
                        {
                          text: 'Оставить таким же', 
                        },
                        {
                          text: 'Сохранить новое название', 
                        } 
                      ], 
                    ],
                    resize_keyboard: true
                  },
                  parse_mode: 'Markdown',
                });   
              }

            }
    
            if(add_photo) {}
            if(add_list) {} 










       

            // if(text === "Сохранить фото") {
  
            //   tmp_photo_lot = '';
            //   tmp_photo_id = ''; 

            //   if(photo_lot == '' && photo_id !== '') { 
            //     add_lot = false;
            //     photo_lot = await bot.getFileLink(photo_id);
            //     await bot.sendMessage(id,`Фото сохранено, продолжайте заполнение.`,{ 
            //       parse_mode: 'Markdown',
            //     });
            //     await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
            //       reply_markup: {
            //         keyboard: Pages.addlot.buttons,
            //         resize_keyboard: true
            //       },
            //       parse_mode: 'Markdown',
            //     });
            //     active_page = 'addlot';
            //   }

            //   if(photo_lot == '' && photo_id == '') {
            //     await bot.sendMessage(id,`Прикрепите/Отправьте фото товара.`,{
            //       reply_markup: {
            //         keyboard: [
            //           [
            //             {
            //               text: 'Вернуться назад', 
            //             },
            //             {
            //               text: 'Сохранить фото',  
            //             } 
            //           ], 
            //         ],
            //         resize_keyboard: true
            //       },
            //       parse_mode: 'Markdown',
            //     });
            //   } 
 
            // }

            // if(text === "Сохранить новое фото") {
           
            //   tmp_photo_lot = '';
            //   tmp_photo_id = '';
               
            //   if(photo_lot == '' && photo_id !== '') { 
            //     add_lot = false;
            //     photo_lot = await bot.getFileLink(photo_id);
            //     await bot.sendMessage(id,`Фото сохранено, продолжайте заполнение.`,{ 
            //       parse_mode: 'Markdown',
            //     });
            //     await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
            //       reply_markup: {
            //         keyboard: Pages.addlot.buttons,
            //         resize_keyboard: true
            //       },
            //       parse_mode: 'Markdown',
            //     });
            //     active_page = 'addlot';
            //   }

            //   if(photo_lot == '' && photo_id == '') {
            //     await bot.sendMessage(id,`Прикрепите/Отправьте фото товара.`,{
            //       reply_markup: {
            //         keyboard: [
            //           [
            //             {
            //               text: 'Нет, спасибо', 
            //             },
            //             {
            //               text: 'Сохранить новое фото',   
            //             } 
            //           ], 
            //         ],
            //         resize_keyboard: true
            //       },
            //       parse_mode: 'Markdown',
            //     });
            //   } 
 
            // }

            // if(text === "Изменить фото") {  

            //   add_lot = true; 
            //   tmp_photo_lot = photo_lot;
            //   tmp_photo_id = photo_id;

            //   photo_lot = '';
            //   photo_id = '';

            //     await bot.sendMessage(id,`Прикрепите/Отправьте новое фото товара.`,{
            //       reply_markup: {
            //         keyboard: [
            //           [
            //             {
            //               text: 'Нет, спасибо', 
            //             },
            //             {
            //               text: 'Сохранить новое фото',   
            //             } 
            //           ], 
            //         ],
            //         resize_keyboard: true
            //       },
            //       parse_mode: 'Markdown',
            //     });  
            // }
 
            // if(text === "Вернуться назад") { 

            //   add_lot = false; 
            //   photo_id = '';
 

            //   await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
            //     reply_markup: {
            //       keyboard: Pages.addlot.buttons,
            //       resize_keyboard: true
            //     },
            //     parse_mode: 'Markdown',
            //   });
            //   active_page = 'addlot'; 
            // }

            // if(text === "Нет, спасибо") { 

            //   if(add_lot) {
            //     add_lot = false;  

            //     tmp_photo_lot = '';
            //     tmp_photo_id = '';
  
            //     await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
            //       reply_markup: {
            //         keyboard: Pages.addlot.buttons,
            //         resize_keyboard: true
            //       },
            //       parse_mode: 'Markdown',
            //     });
            //     active_page = 'addlot';
            //   } 
            // }


            // if(text === "Отменить") { 
            //   add_lot = false; 
            //   photo_id = tmp_photo_id;
            //   photo_lot = tmp_photo_lot;
            //   tmp_photo_lot = '';
            //   tmp_photo_id = '';

            //   await bot.sendMessage(id,`${Pages.addlot.text.replace ('*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить.',`*Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото ${photo_lot != '' ? '✅' : ''}\n2⃣ Название товара ${name_lot != '' ? '✅' : ''}\n3⃣ Описание товара ${list_lot != '' ? '✅' : ''}\n4⃣ Цена товара ${ceil_lot != '' ? '✅' : ''}\n\nЧтобы добавить лот нажмите ✅ Сохранить.`)}`,{
            //     reply_markup: {
            //       keyboard: Pages.addlot.buttons,
            //       resize_keyboard: true
            //     },
            //     parse_mode: 'Markdown',
            //   });
            //   active_page = 'addlot';
            // }
 
            break;
          case 'voice': // Голосовое сообщение 
          var { voice } = msg;
            break;

          case 'photo': // Фотка с сообщением 
          var { photo } = msg;

            if(add_lot) {
              console.log('СОХРАНЯЕМ')
  
              // fs.mkdir(path.join(__dirname,'..','photos_lot',`${username}`), { recursive: true }, (error) => {
              //   if (!error) {
              //     console.log('Directory successfully created, or it already exists.');
              //     return;
              //   }
              //   switch (error.code) {
              //     case 'EEXIST':
              //       console.log('EEXIST');
              //       // Error:
              //       // Requested location already exists, but it's not a directory.
              //       break;
              //     case 'ENOTDIR':
              //       console.log('ENOTDIR');
              //       // Error:
              //       // The parent hierarchy contains a file with the same name as the dir
              //       // you're trying to create.
              //       break;
              //     default:
              //       // Some other error like permission denied.
              //       console.error(error);
              //       break;
              //   }
              // });
  
              photo_id = photo[photo.length - 1].file_id; 
               
            } else {
              console.log('НЕСОХРАНЯЕМ')
            }
            break;
          case 'video': // Видео прикрепленное
          var { video } = msg;
            
            break;
          case 'video_note': // Кружочек
          var { video_note } = msg;
            
            break;
          case 'location': // Геопозиция
          var { location } = msg;
            
            break;
          case 'animation': // Гифка
          var { animation, document } = msg;
            
            break;
          case 'sticker': // Стикер
          var { sticker } = msg;
            
            break;
          case 'contact': // Контакт
          var { contact } = msg;
            
            break;
          case 'poll': // Опрос
          var { poll } = msg;
            
            break;
        
          default:
            break;
        }






        // let message_text_split = text.split(' ')
        // if(message_text_split.length == 2 && message_text_split[0] == '/start') {
        //   console.log(`Лезем в базу ищем ${message_text_split[1]}`)
        // }
        // if (SESSION.getUserSession(id) === null) {
  
        //   console.log(text)
          
        //   await bot.sendMessage('shandalshop',`*Давненько тебя небыло ${first_name}*\n\n          Позволь напомнить что я умею!`,{
        //     reply_markup: {
        //       inline_keyboard: Pages.keyboard_loading,
        //       resize_keyboard: true
        //     },
        //     parse_mode: 'Markdown',
        //   });

        //   await bot.sendMessage(id,`*Давненько тебя небыло ${first_name}*\n\n          Позволь напомнить что я умею!`,{
        //     reply_markup: {
        //       inline_keyboard: Pages.keyboard_loading,
        //       resize_keyboard: true
        //     },
        //     parse_mode: 'Markdown',
        //   });
        //   setTimeout(async ()=>{
        //     Pages.changePageMainAgain(ADMINSETTINGS,Pages.main); 
        //     await bot.sendMessage(id,`${`*С возвращением ${first_name}!*\n` + Pages.main.text}`,{
        //       reply_markup: {
        //         keyboard: Pages.main.buttons,
        //         resize_keyboard: true
        //       },
        //       parse_mode: 'Markdown',
        //     });
        //     SESSION.initionalLocal(msg);
        //     SESSION.initionalGlobal(msg);
        //   },3000);
        // } else {

        //   await bot.sendMessage(id,username + ': ' + text,{
        //     parse_mode: 'Markdown',
        //   }); 
        // }


        // console.log(active_page);
    
        // switch (active_page) {
        //   case 'verification':
        //     console.log('TEST VERIFICATION')
        //       // var RegExp = /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\/])*)?/;
    
        //       // if(RegExp.test(vali)){ stav = true; }
    
        //     break;
    
        //   default:
        //     break;
        // }

      }
    }
    catch(error) { 
      console.log(error); 
    } 
  });
 
  console.log('TELEGRAMM BOT CONNECTING...READY!');
}

module.exports = TGAPI;


            


