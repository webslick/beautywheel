const { Router } = require('express');
const userController = require('../controllers/user_controller');   
const router = Router() 
  
router.get('/getUserInfo',userController.getUserInfo); 

router.post('/getPageInfo',userController.getPageInfo);  

router.post('/sendmail',userController.sendConsult); 

router.post('/sendinfo',userController.sendInfo);  
  
/* MAIL */

router.post('/sendMoneyMail',userController.sendMoneyMail);
 
module.exports = router;
