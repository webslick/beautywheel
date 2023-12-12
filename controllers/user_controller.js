const userService = require('../services/users-service');
const mailService = require('../services/mail-service'); 
const config = require('config');
const url_client = config.get('Server.URL.CLIENT'); 
const axios = require('axios');

class UserController  {
  
  async login(req,res,next) { 
    try {
      const { login ,password } = req.body;
      const userData = await userService.login(login, password, res); 
      res.cookie('refreshToken',userData.user.refreshToken,{maxAge:30*24*60*60*1000,httpOnly: true})
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
 
  async sendMoneyMail(req,res,next) {
    try {
      const { email , id, sum, numbercard } = req.body;
      const userData = await mailService.sendMoneyMail(email , id, sum, numbercard);  
      return res.json(userData);
    } catch (e) {
      next(e);
    }
  }
 
  async getUserInfo(req,res,next) { 
    try {
      const { refreshToken } = req.cookies;   
      const userData = await userService.getUserInfo(refreshToken); 
      return res.json(userData.user);
    } catch (e) {
      next(e);
    }
  }

  async setPageInfo(req,res,next) { 
    try { 
      const { pageInfo, pageId } = req.body; 
  
      const pageData = await userService.setPageInfo(pageInfo, pageId); 
      return res.json(pageData);
    } catch (e) {
      next(e);
    }
  }

  async createPage(req,res,next) { 
    try { 
      const {  
        birthdate, 
        birthlocation, 
        career, 
        children, 
        deathdate, 
        deathlocation, 
        education, 
        epity, 
        initialDeath, 
        nationality, 
        secondhalf, 
        userId 
       } = req.body;  
   
      const pageData = await userService.createPage({ 
        birthdate, 
        birthlocation, 
        career, 
        children, 
        deathdate, 
        deathlocation, 
        education, 
        epity, 
        initialDeath, 
        nationality, 
        secondhalf, 
      }, userId); 

      return res.json(pageData);
    } catch (e) { 
      next(e);
    }
  }
 
  async getUserData(req,res,next) {
    try {
      const { body } = req.body;
      if(body !== undefined) {
        const user = await userService.getUserData(body);
        res.json(user);
      }
    } catch (e) {
      next(e);
    }
  }
 
  async editPage(req, res, next) { 
    try {
      const file = await userService.editPage(req,res,next);
     return res.json(file);
    } catch (e) {
      next(e);
    }
  } 
  
  async sendInfo(req, res, next) {
    try {
      const { body } = req.body
      const {   
        userId, 
        initialDeath, 
        deathdate,  
        birthdate, 
        nationality,
        birthlocation,
        deathlocation,
        secondhalf, 
        children,
        career,
        backgroundselect,
        education, 
        byer_files,   
      } = body;  
      const info = await userService.createPage({ 
        initialDeath, 
        deathdate,  
        birthdate, 
        nationality,
        birthlocation,
        deathlocation,
        secondhalf, 
        children,
        backgroundselect,
        career,
        education, 
        byer_files, 
      },userId);
     return res.json(info);
    } catch (e) {
      next(e);
    }
  } 
  
  async getPageInfo(req, res, next) {
    try {
      const { pageId } = req.body 
      const info = await userService.getPageInfo(pageId);
     return res.json(info);
    } catch (e) {
      next(e);
    }
  } 
  
  async deletePage(req, res, next) {
    try {
      const { pageId } = req.body 
      const info = await userService.deletePage(pageId);
     return res.json(info);
    } catch (e) {
      next(e);
    }
  } 
  
  async sendConsult(req, res, next) {
    try {
      const { body } = req.body
      const { byer_consult_initial,byer_consult_tel, coment_consult } = body; 
 
      await userService.sendConsult(res, byer_consult_initial, byer_consult_tel, coment_consult );
    //  return res.json(info);
    } catch (e) {
      next(e);
    }
  } 
  
}

module.exports = new UserController();
