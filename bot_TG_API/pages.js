// 📗📕 📃 📸 💵 ➖ ➕ ⚠️ 1⃣ 2⃣ 3⃣ 4⃣

const keyboard_main = [
  [
    {
      text: '📗 Купить',
      web_app: {url: 'https://master--fancy-sorbet-314ca5.netlify.app/'},
      callback_data: 'purchase'
    },
    {
      text: '📕 Продать', 
      callback_data: 'sales' 
    } 
  ], 
];

const main = {
  text :``,
  buttons: keyboard_main
};

const keyboard_sales = [
  [
    {
      text: '👤 Мой аккаунт', 
      callback_data: 'acc' 
    },
    {
      text: '📮 Поддержка',
      callback_data: 'support'
    }
  ],
  [
    {
      text: '📥 Добавить лот',
      callback_data: 'addlot'
    },
    {
      text: '🔁 Изменить лот', 
      callback_data: 'replace'  
    },
    {
      text: '📤 Удалить лот', 
      callback_data: 'dellot'  
    }
  
  ],
  [  
    {
      text: '⤴️ Главное меню',
      callback_data: 'main_menu'
    },
  ],
];

const sale = {
  text :`
  *Вы находитесь в меню:*  _Продажа_ 
  `,
  buttons: keyboard_sales
};

const keyboard_purchase = [
  [
    {
      text: 'К лотам',  
      url: 'https://t.me/shandalshop',  
      callback_data: 'on_notification_purchase'  
    },
    {
      text: '⤴️ Главное меню',
      callback_data: 'main_menu'
    },
  ],
];
  
const purchase = {
  text :``,
  buttons: keyboard_purchase
}; 
 
const keyboard_addlot = [
  [
    {
      text: '📸 фото', 
      callback_data: 'foto' 
    },
    {
      text: '📃 Название',
      callback_data: 'name'
    },
  ],
  [
    {
      text: '📃 Описание',
      callback_data: 'list'
    },
    {
      text: '💵 Цена', 
      callback_data: 'cent'  
    }, 
  ],
  [ 
    {
      text: '✅ Сохранить лот', 
      callback_data: 'save'  
    }, 
    {
      text: '⤴️ Главное меню',
      callback_data: 'main_menu'
    },
  ],
];
  
const addlot = {
  text :``,
  buttons: keyboard_addlot
}; 
  
const keyboard_dellot = [
  [
    {
      text: '🔢 Номер лота', 
      callback_data: 'delnumber' 
    },
    {
      text: '📤 Подтвердить удаление', 
      callback_data: 'dellot'  
    }, 
  ],
  [ 
    {
      text: '⤴️ Главное меню',
      callback_data: 'main_menu'
    },
  ],
];
  
const replace = {
  text :``,
  buttons: keyboard_addlot
}; 
  
const keyboard_replace = [
  [
    {
      text: '🔢 Номер лота', 
      callback_data: 'delnumber' 
    },
    {
      text: '📤 Подтвердить изменения', 
      callback_data: 'dellot'  
    }, 
  ],
  [ 
    {
      text: '⤴️ Главное меню',
      callback_data: 'main_menu'
    },
  ],
];

const dellot = {
  text :``,
  buttons: keyboard_dellot
}; 
 
const keyboard_support = [
  [
    {
      text: '📞 Связаться',  
      callback_data: 'callsupport'  
    },
    {
      text: '⤴️ Главное меню',
      callback_data: 'main_menu'
    },
  ],
];

const support = {
  text :``,
  buttons: keyboard_support
}; 
 
const keyboard_loading = [
  [
    {
      text: 'Ожидай ⌛',
      callback_data: 'loading...'
    },
  ]
];

const keyboard_offer = [
  [
    {
      text: 'Правовая информация', 
      // url: 'https://telegra.ph/Dogovor-Oferta-10-09-2',
      callback_data: 'info'
    },
  ]
];
 
function changePage(settings, type, pages) {  

  const info = JSON.parse(settings.info_project);

  let arr = '';

  switch (type) {
    case 'main':
      info.possibility_main.map(element => {arr += "\n ✅ " + element +'\n'})
      pages.text = `*${info.welcome_main}*
    
      *Наш бот поможет Вам:*\n${arr}\n ✅ База товаров обновляется *каждые ${info.minutes} минут.* \n
      *Вы находитесь в главном меню*\n\n
      `
      break;
    case 'mainagain':
      info.possibility_main.map(element => {arr += "\n ✅ " + element +'\n'})
      pages.text = `
      *Наш бот поможет Вам:*\n${arr}\n ✅ База товаров обновляется *каждые ${info.minutes} минут.*\n 
      *Вы находитесь в главном меню*\n\n
      `
      break;
    case 'sale': 
    
      info.possibility_sale.map(element => {arr += "\n " + element +'\n'}) 
      pages.text = `
      *Вы находитесь в меню:*  _Продажа_\n${arr}\n  
      ` 
      break;
    case 'purchase': 
    
      info.possibility_sale.map(element => {arr += "\n ✅ " + element +'\n'}) 
      pages.text = `
      *Вы находитесь в меню:*  _Покупок_\n\n${info.welcome_purchase} 
      ` 
      break;
    case 'addlot':
      pages.text = `
      *Вы находитесь в меню:*  _Добавления лота_\n\nПоочередно заполните все поля на кнопках:\n\n1⃣ Фото\n2⃣ Название товара\n3⃣ Описание товара\n4⃣ Цена товара\n\nЧтобы добавить лот нажмите ✅ Сохранить. 
      `
      break;
    case 'replace':
      pages.text = `
      *Вы находитесь в меню:*  _Покупок_\n\n 
      `
      break;
    case 'dellot':
      pages.text = `
      *Вы находитесь в меню:*  _Покупок_\n\n 
      `
      break;
    case 'support':
      support.text = `
      *Вы находитесь в меню:*  _Покупок_\n\n 
      `
      break; 
  
    default:
      break;
  }
 
}
 
 
module.exports = {
  main,
  sale,
  purchase,
  addlot,
  replace,
  dellot,
  support, 
  keyboard_loading,
  keyboard_offer,
  changePage, 
}





