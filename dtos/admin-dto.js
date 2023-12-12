const moment = require('moment'); 
module.exports = class AdminDto {
   
  id;
  login;
  password;  
  email;  
  tokens;  
  accaunts;  
  toogle_status_bot; 
  admin_chat_tg_id; 
  albums; 
  command_topics;
  topics;
  scammers; 
  id_groups;  
  info_groups;   
  createdAt;   
 
  constructor(model) {   
    this.id = model?.id; 
    this.login = model?.login; 
    this.password = model?.password; 
    this.email = model?.email; 
    this.tokens = model?.tokens; 
    this.accaunts = model?.accaunts; 
    this.toogle_status_bot = model?.toogle_status_bot; 
    this.admin_chat_tg_id = model?.admin_chat_tg_id; 
    this.albums = model?.albums; 
    this.command_topics = model?.command_topics; 
    this.topics = model?.topics; 
    this.scammers = model?.scammers;
    this.id_groups = model?.id_groups;  
    this.info_groups = model?.info_groups;  
    this.createdAt = moment(model?.createdAt).format("YYYY-MM-DD HH:mm");     
  } 
}
 