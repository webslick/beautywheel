const { 
  Admin_users, 
  Users,  
 } = require('../db/models'); 
const serviceFunction = require('../service_functions/index'); 
const ApiErr = require('../exeptions/api-error'); 
const moment = require('moment');
const db = require('./models/index');

const GLOBAL_UNIQUE_SESSIONS = [];
const LOCAL_USER_SESSIONS = [];
 
function initionalUserLocalSession(info) { // инициализация локальной сессии
  const { date, from: { id, first_name, last_name, username } } = info;
  const user = {
    id,
    user_name: username,
    first_name,
    last_name,
    date_connection: date,
    info_user: { 
      active_page:'main',
      text_request: '/star',
      date_last_request: date,
      notification_request: [{}]
    },
  }
  isNotMatch(LOCAL_USER_SESSIONS,id) ? LOCAL_USER_SESSIONS.push(user) : false;
}

function initionalUserGlobalSession(info) { // Инициализация глобальной сессии
  const { date, from: { id, first_name, last_name, username} } = info;
  const user = {
    id,
    user_name: username,
    first_name,
    last_name,
    date_connection: date,
    info_user: { 
      active_page:'main',
      text_request: '/start',
      date_last_request: date,
      notification_request: [{}]
    },
  }
  isNotMatch(GLOBAL_UNIQUE_SESSIONS,id) ? GLOBAL_UNIQUE_SESSIONS.push(user) : false;
}

function identificationSessionUser (userId) { // Проверяет уникальность пользователя в сесиях
  for (let count = 0; count < LOCAL_USER_SESSIONS.length; count++) {
    if(LOCAL_USER_SESSIONS[count].id === userId) return false; 
  }
  for (let count = 0; count < GLOBAL_UNIQUE_SESSIONS.length; count++) {
    if(GLOBAL_UNIQUE_SESSIONS[count].id === userId) return false; 
  }
  return true;
}

function getUserSession (userId) { // Возвращает юзера в локальной сессии
  for (let count = 0; count < LOCAL_USER_SESSIONS.length; count++) {
    if(LOCAL_USER_SESSIONS[count].id === userId) return LOCAL_USER_SESSIONS[count]; 
  }
  return null;
}

function putUserSession (userId,dody) { // Меняет данные юзера в локальной сессии
  for (let count = 0; count < LOCAL_USER_SESSIONS.length; count++) {
    if(LOCAL_USER_SESSIONS[count].id === userId) {
      for (var item in dody) {
        for (var key in LOCAL_USER_SESSIONS[count]) {
          if(key === item) {
            if(typeof(LOCAL_USER_SESSIONS[count][key]) === 'object') {
              for(var subkey in LOCAL_USER_SESSIONS[count][key]) {
                if(typeof(dody[key][subkey]) == 'object') {
                  LOCAL_USER_SESSIONS[count][item][subkey] = dody[key][subkey]
                } else {
                  LOCAL_USER_SESSIONS[count][item][subkey] = (dody[key][subkey] === undefined )? LOCAL_USER_SESSIONS[count][item][subkey] : dody[key][subkey]
                }
              }
            } else {
              LOCAL_USER_SESSIONS[count][key] = dody[key];
            }
          } 
        }
      }
      console.log(LOCAL_USER_SESSIONS[count])
    } 
  }
}

function garbageSessionsUser () { // Удаляет муорные сессии больше часа
  LOCAL_USER_SESSIONS.map((user,position) => {
    if((convertSeconds(moment().diff(moment(user.info_user.date_last_request * 1000))).hours) > 0) {
      LOCAL_USER_SESSIONS.splice(position, 1);
    }
  });
}

function isNotMatch(arr,id) { //
  let push = true;
  arr.forEach(element => {
    if(element.id === id) { push = false; }
  });
  return push;
}

const getAdminItems = async () => { //
  let array_error = [];
  let object_result = {
  };

  let error_item = ['Admin_users'];

  try {
 
    let results = await Promise.all([
      Admin_users.findOne({where: { id: 1 }}),
    ]);
  // console.log( serviceFunction.removeEmpty(results[0], 'Admin_user'),'!@' )
    results.map((element_promise,count) => {
      if (!element_promise || element_promise === null || element_promise === "" || element_promise.length === 0) {
        array_error.push(`Not elem in table for: ${error_item[count]}`);
      }
    
      if (element_promise !== null && element_promise.dataValues !== undefined && element_promise.dataValues.id !== undefined) {
        object_result.login = element_promise.dataValues.login,
        object_result.password = element_promise.dataValues.password,
        object_result.email = element_promise.dataValues.email,
        object_result.tokens = element_promise.dataValues.tokens,
        object_result.accaunts = element_promise.dataValues.accaunts,
        object_result.toogle_status_bot = element_promise.dataValues.toogle_status_bot,
        object_result.admin_chat_tg_id = element_promise.dataValues.admin_chat_tg_id,
        object_result.albums = element_promise.dataValues.albums,
        object_result.command_topics = element_promise.dataValues.command_topics,
        object_result.topics = element_promise.dataValues.topics,
        object_result.scammers = element_promise.dataValues.scammers,
        object_result.id_groups = element_promise.dataValues.id_groups,
        object_result.info_groups = element_promise.dataValues.info_groups,
        object_result.info_project = element_promise.dataValues.info_project
      }
    });

    object_result.errors = array_error;
    return object_result;

  } catch(error) {
    console.log(error)
    // if(error.original !== undefined && error.original.code === 'ER_ACCESS_DENIED_ERROR') {
    //   array_error.push(`Произошла ошибка: ${error.original.sqlMessage}`);
    //   object_result.errors = array_error;
    //   return object_result;
    // }
    // array_error.push(`Произошла ошибка: ${error.msg}`);
    // object_result.errors = array_error;
    // return object_result;
  }
}

const getUsers = async () => { //
  let array_error = [];
  let object_result = {
    users: [],
    errors: null
  };
  let error_item = ['Users'];

  // const NowBDformat = moment(moment().add(7, 'hours').format("YYYY-MM-DD HH:mm"));

  try {
    let results = await Promise.all([
      Users.findAll(),
    ]);

    results.map((element_promise,count) => {

      if (!element_promise || element_promise === null || element_promise === "" || element_promise.length === 0) {
        array_error.push(`Not elem in table for: ${error_item[count]}`);
      }

      if (Array.isArray(element_promise)) {  
        element_promise.map((elem) => {
          object_result.users.push({
            id: elem.dataValues.user_id,
            first_name: elem.dataValues.first_name,
            user_name: elem.dataValues.user_name,
            last_name: elem.dataValues.last_name,
            date_conection: elem.dataValues.date_conection,
            notification_request: elem.dataValues.notification_request,
          })
        })
      } else {
        // if (item !== null && item.dataValues !== undefined && item.dataValues.login !== undefined) {
        //   objResult.login = item.dataValues.login,
        //   objResult.password = item.dataValues.password,
        //   objResult.email_admin = item.dataValues.email
        // }
  
        // if (item !== null && item.dataValues !== undefined && item.dataValues.toogle_total_temp !== undefined) {
        //   objResult.toogle_total_temp = item.dataValues.toogle_total_temp,
        //   objResult.total_temp_min = item.dataValues.total_temp_min,
        //   objResult.total_temp_max = item.dataValues.total_temp_max,
        //   objResult.site_status_has_block = item.dataValues.site_status_has_block,
        //   objResult.mode_auto = item.dataValues.mode_auto,
        //   objResult.status_mode = item.dataValues.status_mode
        // }
      }
    });

    object_result.errors = array_error;

    return object_result;

  } catch(error) {
    if(error.original !== undefined && error.original.code === 'ER_ACCESS_DENIED_ERROR') {
      array_error.push(`Произошла ошибка: ${error.original.sqlMessage}`);
      object_result.errors = array_error;
      return object_result;
    }
    array_error.push(`Произошла ошибка: ${error.msg}`);
    object_result.errors = array_error;
    return object_result;
  }
}

const getUser = async (user_id) => { //
  let array_error = [];
  let object_result = {
    user: {},
    errors: null
  };

  let error_item = ['Users'];

  try {
    let results = await Promise.all([
      Users.findOne({where: { user_id }}),
    ]);

    results.map((element_promise,count) => {
      if (!element_promise || element_promise === null || element_promise === "" || element_promise.length === 0 || element_promise === undefined) {
        array_error.push(`Not elem in table for: ${error_item[count]}`);
      }
      
      if (element_promise !== null && element_promise.dataValues !== undefined && element_promise.dataValues.id !== undefined) {
        object_result.user = {
          id: element_promise.dataValues.user_id,
          first_name: element_promise.dataValues.first_name,
          user_name: element_promise.dataValues.user_name,
          last_name: element_promise.dataValues.last_name,
          date_conection: element_promise.dataValues.date_conection,
          info_user: element_promise.dataValues.info_user
        }
      }
    });

    object_result.errors = array_error;
    return object_result;

  } catch(error) {
    if(error.original !== undefined && error.original.code === 'ER_ACCESS_DENIED_ERROR') {
      array_error.push(`Произошла ошибка: ${error.original.sqlMessage}`);
      object_result.errors = array_error;
      return object_result;
    }
    error.msg ? array_error.push(`Произошла ошибка: ${error.msg}`) : array_error.push(`Произошла ошибка: ${error}`);
    object_result.errors = array_error;
    return object_result;
  }
}

const putUser = async (user_id,body) => { //
  Users.update(body, {
    where: {
      id:user_id,
    }
  })
  .then(result => {
    if (!result || result === null || result === "" || result[0] === 0) return console.log({msg: "Not user in table"})
     console.log("Update base succes")
  })
  .catch(error => {
    console.log(error)
  }) 
}

const putAdmin = async (body) => {
  Admin_users.update(body, {
    where: {
      id: 1,
    }
  })
  .then(result => {
    if (!result || result === null || result === "" || result[0] === 0) return console.log({msg: "Not RESULT"})
     console.log("Update base succes")
  })
  .catch(error => {
    console.log(error.original)
  }) 
}

const createUser = async (obj) => { //
  if(obj.id !== undefined) {
    Users.create({
      user_id: JSON.stringify(obj.id),
      user_name: obj.user_name !== undefined ? JSON.stringify(obj.user_name ): '',
      first_name: obj.first_name !== undefined ? JSON.stringify(obj.first_name): '',
      last_name: obj.last_name !== undefined ? JSON.stringify(obj.last_name ): '',
      date_conection: obj.date_conection !== undefined ? obj.date_conection : new Date(),
      info_user: JSON.stringify({
        active_page: obj.info_user.active_page !== undefined ? obj.info_user.active_page : '',
        text_request: obj.info_user.text_request !== undefined ? obj.info_user.text_request : '',
        date_last_request: obj.info_user.date_last_request !== undefined ? obj.info_user.date_last_request : new Date(),
        notification_request: obj.info_user.notification_request !== undefined ? obj.info_user.notification_request : JSON.stringify([{}])
      })
    })
    .then(result => {
      if (!result || result === null || result === "" || result[0] === 0) return console.log({msg: "Not user in table"})
       console.log("Create user in base succes")
    })
    .catch(error => {
      console.log(error.original.sqlMessage)
    }) 
  } else {
    console.log("NO CREATE USER.PLEASE ENTER ID !!!")
  }
}

const isUniqmUser = async (id) => { //
  const { user, errors } = await getUser(id);
  console.log(user)
  if(errors.length > 0) {
    console.log(errors[0]);
    return true;
  }
  return false;
}

module.exports = {
  initionalLocal: initionalUserLocalSession,
  initionalGlobal: initionalUserGlobalSession,
  isFerstSession: identificationSessionUser,
  garbageSessions: garbageSessionsUser,
  getUserSession,
  getUsers,
  getUser,
  getAdminItems,
  putUser,
  putAdmin,
  createUser,
  isUniqmUser,
  putUserSession,
  GLOBAL_UNIQUE_SESSIONS,
  LOCAL_USER_SESSIONS
}

 
// class DB {
//   constructor() { 
//     this.GLOBAL_UNIQUE_SESSIONS = [];
//     this.LOCAL_USER_SESSIONS = [];
//   }

//   async addInTables(table, obj) { 

//       switch (table) {
//         case 'users':  
   
//           const {
//             login,
//             password,  
//             refreshToken,  
//             isActivated,  
//             activationLink,
//             balance, 	 
//             startSub,
//             active,   
//             name,  
//             lastname,   
//             gender, 
//             email,  
//             telephone,  
//             avatar,  
//             last_seen,
//             index,  
//             number, 
//             floors, 
//             entrancesCount,  
//             flatsCount,  
//             region, 
//             city, 
//             district,
//             street,
//             role   
//           } = obj;  
 
//           const user = await Users.create({
//             AuthInfos: {
//               login,
//               password, 
//               activationLink,  
//               isActivated,  
//             },
//             Profiles: {
//               email,   
//             }  
//           },{
//             include: [
//               {
//                 model: AuthInfos,
//                 as: 'AuthInfos', 
//               },  
//               {
//                 model: Profiles,
//                 as: 'Profiles', 
//               }, 
//             ], 
//           });  
  
//           if (!user) {
//             throw ApiErr.BadRequest("Не получилось создать пользователя User add") 
//           }
     
//           return user;   
//         case 'page':   
//           const {
//             userId,
//             initialDeath, 
//             deathdate, 
//             birthdate, 
//             nationality, 
//             birthlocation, 
//             deathlocation, 
//             backgroundselect, 
//             secondhalf, 
//             children, 
//             career, 
//             education, 
//             epity,    
//             OneBlockArea,   
//             OneBlockInputTitle, 
//             TwoBlockInputTitle,  
//             OneBlockOneInput,  
//             OneBlockTwoInput,  
//             TwoBlockArea, 
//             TwoBlockOneInput, 
//             TwoBlockTwoInput,   
//             ThreeBlockArea,    
//             pageId,
//             pagelink,
//           } = obj;  
//           let tmpDeathdate = deathdate.split('-');
//           let tmpBirthdate = birthdate.split('-');
//           const page = await Pages.create({
//             userId,
//             deathdate:  new Date(`${tmpDeathdate[2]}-${tmpDeathdate[1]}-${tmpDeathdate[0]}`),  
//             birthdate: new Date(`${tmpBirthdate[2]}-${tmpBirthdate[1]}-${tmpBirthdate[0]}`), 
//             initialDeath,  
//             nationality, 
//             birthlocation, 
//             deathlocation, 
//             backgroundselect, 
//             secondhalf, 
//             children, 
//             career, 
//             education, 
//             epity,    
//             OneBlockArea,   
//             OneBlockInputTitle, 
//             TwoBlockInputTitle,  
//             OneBlockOneInput,  
//             OneBlockTwoInput,  
//             TwoBlockArea, 
//             TwoBlockOneInput, 
//             TwoBlockTwoInput,   
//             ThreeBlockArea,    
//             pageId,
//             pagelink,  
//           });  
  
//           if (!page) {
//             throw ApiErr.BadRequest("Не получилось создать страницу Pages add") 
//           }
     
//           return page;   
  
//       }
//   }
 
//   async searchInTables(table, item) {
//     const profileAttributes = [ "email" ]; 
 
//     switch (table) {
//       case 'user_info': 
      
//       const users_list = await AuthInfos.findOne({ 
//           where: item , 
//           attributes: ["login","password","refreshToken", "accessToken", "activationLink","id", "payinfo", "partners", "partnerLink"], 
//           include: [
//             {
//               model: Profiles,
//               as: 'Profiles', 
//               attributes: profileAttributes, 
//               include: [
//                 {
//                   model: Pages,
//                   as: 'Pages',  
//                 }, 
//               ]  
//             }, 
//           ]  
//       }) 
 
//       return users_list;
       
//       case 'user_id':  
//       const users_by_id = await Users.findAll({
//        where: { id: item },  
//        attributes: ["id"],
//        include: [
//          {
//            model: Profiles,
//            as: 'Profiles', 
//            attributes: profileAttributes, 
//          } 
//        ] 
//      })  

//      return users_by_id[0];

   
 
//       case 'user_me': 
    
//       const user_me = await Admin_user.findOne({ 
//         where: { id: 1 }, 
//         attributes: [ "id","createdAt"],
//         include: [  
//           {
//             model: Admin_user,
//             as: 'Admin_users', 
//              attributes: ["login","password","email", "toogle_status_bot", "admin_chat_tg_id","id", "info_project"], 
//           }, 
//         ],
        
//       }) 
 
//       return user_me;
  
    

//       case 'user_token':  
//       const usertoken = await AuthInfos.findOne({ 
//           where: { refreshToken: item },  
//       })  
 
//       return usertoken;
//       case 'users_list_registration':  
//       const users_list_registration = await AuthInfos.findOne({ 
//           where: item , 
//           attributes: ["login","password","id"], 
//       })  
 
//       return users_list_registration;
 
     
//       case 'profile_id':  
//       const profile_by_id = await Profiles.findAll({  
//         where: {
//           id: item
//         } 
//       })  
//       return profile_by_id[0];
     
//       case 'page_id':  
  
//       const pages = await Pages.findOne({  
//         where: { pageId: item }, 
//       })  
//       return pages;
 
//     } 
//   }
  
//   async removeInTables(model) {
//     const mod = await model.destroy();
//     return mod;
//   }

//   async updateModelTables(model,obj) {   
//     const mod = await model.update(obj);
//     return mod;
//   }

//   async resetIncrementTables() {
//     await db.sequelize.query("ALTER TABLE Users AUTO_INCREMENT = 0;");
//     await db.sequelize.query("ALTER TABLE Tokens AUTO_INCREMENT = 0;"); 
//     await db.sequelize.query("ALTER TABLE Dialogs AUTO_INCREMENT = 0;"); 
//     await db.sequelize.query("ALTER TABLE Users AUTO_INCREMENT = 1;");
//     await db.sequelize.query("ALTER TABLE Tokens AUTO_INCREMENT = 1;"); 
//     await db.sequelize.query("ALTER TABLE Dialogs AUTO_INCREMENT = 1;"); 
//     await db.sequelize.query("ALTER TABLE Users AUTO_INCREMENT = 0;");
//     await db.sequelize.query("ALTER TABLE Tokens AUTO_INCREMENT = 0;"); 
//     await db.sequelize.query("ALTER TABLE Dialogs AUTO_INCREMENT = 0;"); 
//   }

// }

// module.exports = new DB();