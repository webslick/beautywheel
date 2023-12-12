const moment = require('moment');  
const AdminDto = require('../dtos/admin-dto'); 
const UsersDto = require('../dtos/user-dto'); 

async function noDubleElements(arr) {
  let arr_3 = arr.reduce((result, item) => {
    return result.includes(item) ? result : [... result, item];
}, []);
  return arr_3;
}

function getTime (count, type) { if (type === 'm') { return count * 60000 }; if (type === 'h') { return count * 60000 * 60 } };

const getObjkey = (obj, objKey, innerKey) => {  // возвращает вложеную модель
 
  let result = false
  Object.keys(obj).map( item => {  
    if(innerKey) {
      if(item === objKey) {   
        Object.keys(obj[item]).map((item_inner_name) => {
          if(item_inner_name === innerKey) {   
            result = obj[item][item_inner_name]  
          } 
        })  
      } 
    } else {   
      if(item === objKey && obj[item] !== null && obj[item] !== undefined ) {  
        result = obj[item] 
      }
    }
  })   
  return result;
}


const removeEmpty = (obj,dto) => { //удаляет все undefined обьекты   
let objTmp = {}
  switch (dto) {
    case 'Admin_user':
      objTmp = new AdminDto(obj)
      break;   
    case 'UsersDto':  
      objTmp = new UsersDto(obj)
      break;  
  
    default:
      break;
  }
 
  let newObj = {};

  Object.keys(objTmp).forEach((key) => {  
    if (objTmp[key] === Object(objTmp[key])) newObj[key] = removeEmpty(objTmp[key]);
    else if (objTmp[key] !== undefined) newObj[key] = objTmp[key];
  }); 
  return newObj;
};


module.exports = {
  getTime,
  noDubleElements,
  getObjkey,
  removeEmpty,
} 
