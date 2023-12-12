const moment = require('moment'); 
module.exports = class UserDto {
  id;  
  user_id; 
  user_name; 
  first_name; 
  last_name; 
  date_conection; 
  info_user; 
  createdAt;  

  constructor(model) {   
    this.id = model?.id;  
    this.user_id = model?.user_id;  
    this.user_name = model?.user_name;  
    this.first_name = model?.first_name;  
    this.last_name = model?.last_name;  
    this.date_conection = model?.date_conection;  
    this.info_user = model?.info_user;   
    this.createdAt = moment(model?.createdAt).format("YYYY-MM-DD HH:mm");  
  }
 
}
 