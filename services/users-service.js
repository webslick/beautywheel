 
const uuid = require('uuid');
const mailService = require('./mail-service'); 
const DB = require('../db/index'); 
const UserDto = require('../dtos/user-dto'); 
const ApiErr = require('../exeptions/api-error');
const S3 = require('aws-sdk/clients/s3') 
const path = require('path');
const serviceFunction = require("../service_functions")
const config = require('config');  
const url_api = config.get('Server.URL.ACTIVATIOLINK'); 
const url_client = config.get('Server.URL.CLIENT'); 
 
const random = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) ) + min;
}

const isEmptyObject = (obj) => {
  for (var i in obj) { 
      if (obj.hasOwnProperty(i)) {
          return false;
      }
  }
  return true;
}

class UserService {

  async registration (login, password,res, cookies) {
    try {
      const condidate = await DB.searchInTables('users_list_registration',{ login });
      if(condidate) {
        throw ApiErr.BadRequest(`Пользователь с почтовым адресом ${login} уже существует`);
      } else {
        const hashPassword = await bcrypt.hash(password, random(1,10)); 
        let result = {}
        const activationLink = uuid.v4(); 
 
        const user = await DB.addInTables('users',{ login, email:login, password : hashPassword, isActivated: false, activationLink, }); 
     
        result = { 
          ...serviceFunction.removeEmpty(user, 'Users'),   
          ...serviceFunction.removeEmpty(serviceFunction.getObjkey(user,'AuthInfos',false), 'AuthInfos'),  
          ...serviceFunction.removeEmpty(user.Profiles,'Profiles'),   
        }; 
    
        const tokens = tokenService.generateToken({ login: serviceFunction.removeEmpty(serviceFunction.getObjkey(user,'AuthInfos',false), 'AuthInfos').login, userId: serviceFunction.removeEmpty(user,'Users').id }) 
     
        const update_token = await DB.updateModelTables(serviceFunction.getObjkey(user,'AuthInfos',false),{
          id: serviceFunction.removeEmpty(condidate, 'AuthInfos').id,
          refreshToken: tokens.refreshToken,
          accessToken: tokens.accessToken
        })

        result.accessToken = update_token.accessToken
        result.refreshToken = update_token.refreshToken
    
        mailService.sendAcnivationMail(res,login,`${url_api}api/activate/${activationLink}`); 
   
        return { 
          user: result 
        }
      }
    } catch(e) {
      throw ApiErr.BadRequest(e.message)
    }
  }

  async login(login, password) {
    try { 
      const condidate = await DB.searchInTables('user_info',{ login });
      let result = {}
      if(!condidate) {
        throw ApiErr.BadRequest(`Пользователь не найден необходимо: `);
      } else {
        
        const isPassEquals = await bcrypt.compare(password,condidate.password);

        if(!isPassEquals) {
          throw ApiErr.BadRequest(`Неверный пароль повторите ввод: `);
        }
  
        result = {  
          ...serviceFunction.removeEmpty(condidate, 'AuthInfos'),  
          ...serviceFunction.removeEmpty(serviceFunction.getObjkey(condidate,'Profiles',false), 'Profiles'),  
        };  
 
        const tokens = tokenService.generateToken({ login: result.login, userId: result.id }) 
 
        const update_token = await DB.updateModelTables(condidate,{
          id: result.id,
          refreshToken: tokens.refreshToken,
          accessToken: tokens.accessToken
        })
 
        let pages = []

        serviceFunction.getObjkey(serviceFunction.getObjkey(condidate,'Profiles',false),'Pages',false).map((item) => {
          pages.push(serviceFunction.removeEmpty(item, 'Pages'))
        })

        result.pages = pages;
        result.accessToken = update_token.accessToken
        result.refreshToken = update_token.refreshToken

        return { user: result }
      }
    } catch(e) {
      throw ApiErr.BadRequest(e.message)
    } 
  }

  async forgot(email) {
    try {
      const condidate = await DB.searchInTables('users',{ email });
      if(!condidate) {
        throw ApiErr.BadRequest(`Пользователь не зарегистрирован: `);
      } else {
        const spliting = uuid.v4();
        var newForgotPass = spliting.split('-')[0];  
        const hashPassword = await bcrypt.hash(newForgotPass, random(1,10)); 
        mailService.sendForgotPass(email, newForgotPass);
        await DB.updateModelTables(condidate,{ password: hashPassword }); 
 
        return { msg: 'Новый пароль отправлен на почту, если не пришло проверьте спам.' }
        // return { ...data } $2b$07$S0/wDQCQSjwpkpnGJyv3YeZki4fVdG7eOa6.j.Ep66hpAokWQS1oq
      }
    } catch(e) { 
      throw ApiErr.BadRequest(e.message)
    } 
  }
 
  async addMoney(email, sum) {
    try { 
      const condidate = await DB.searchInTables('users',{ email }); 
      if(condidate) {
        const userDto = new UserDto(condidate);   
        await DB.updateModelTables(condidate,{ balancePartner: Number(userDto.balancePartner) + Number(sum) }); 
        return { 
          user: userDto
        }
      } else { 
        throw ApiErr.BadRequest(`Пользователь не найден`);
      }
    } catch(e) {
      throw ApiErr.BadRequest(e.message)
    } 
  }
 
  async setOutMoney(email, obj) {
    try { 
      const condidate = await DB.searchInTables('users',{ email }); 
      if(condidate) { 
        var t = await DB.updateModelTables(condidate,{ history: JSON.stringify(obj) }); 
        const newUserDto = new UserDto(t); 
        return { 
          user: newUserDto
        }
      } else { 
        throw ApiErr.BadRequest(`Пользователь не найден`);
      }
    } catch(e) {
      throw ApiErr.BadRequest(e.message)
    } 
  }

 
  async setPageInfo(pageInfo, pageId) {
   
    try { 
      const {
        photo, 
        initialDeath, 
        birthlocation,
        deathlocation,
        nationality,
        career,
        pagelink,
        secondhalf,
        children,
        education,
        birthdate,
        deathdate, 
        epity,
        media,
      } = pageInfo

 
      const page = await DB.searchInTables('page_id', pageId ); 
     
      if(page) { 
        var newpage = await DB.updateModelTables(page, { 
          photo, 
          initialDeath,
          birthlocation,
          deathlocation,
          nationality,
          career,
          secondhalf, 
          children: JSON.stringify(children),
          education,
          birthdate,
          deathdate, 
          epity,  
          pagelink,
          media: JSON.stringify(media) 
        }); 
        const newPageDto = new PageDto(newpage);  
        return { 
          page: newPageDto
        }
      } else { 
        throw ApiErr.BadRequest(`Данной страницы не существует`);
      }
    } catch(e) {
      throw ApiErr.BadRequest(e.message)
    } 
  }
 
  async getPageInfo(pageId) {
   
    try { 
     
      const page = await DB.searchInTables('page_id', pageId ); 
 
      if(page) { 
        const newPageDto = new PageDto(page);  
        return { ...newPageDto }
      } else { 
        throw ApiErr.BadRequest(`Данной страницы не существует`);
      }
    } catch(e) {
      throw ApiErr.BadRequest(e.message)
    } 
  }
 
  async deletePage(pageId) {
   
    try {  
      const page = await DB.searchInTables('page_id', pageId ); 
      const bucketParams = { Bucket: '430133e2-5ac8175c-9526-49bf-adaa-a31193a1248c' } // <--- заменить
      if(page) {  

        await this.emptyS3Directory (bucketParams, `${pageId}`)  
 

        await DB.removeInTables(page) 
        return true
      } else { 
        throw ApiErr.BadRequest(`Данной страницы не существует`);
      }
    } catch(e) {
      throw ApiErr.BadRequest(e.message)
    } 
  }
 
  async decMoney(email, sum) {
    try { 
      const condidate = await DB.searchInTables('users',{ email }); 
      if(condidate) {
        const userDto = new UserDto(condidate);   
        const newDTO = await DB.updateModelTables(condidate,{ balancePartner: Number(userDto.balancePartner) - Number(sum) }); 
        const newUserDto = new UserDto(newDTO); 
        return { 
          user: newUserDto
        }
      } else { 
        throw ApiErr.BadRequest(`Пользователь не найден`);
      }
    } catch(e) {
      throw ApiErr.BadRequest(e.message)
    } 
  }
 
  async writePayProductsUsers (obj) { 
    try {
      const condidate = await DB.searchInTables('users', { id: obj.id } );
      if(condidate) {  
        await DB.updateModelTables(condidate,{ isProductPay: obj }); 
      } else {
        throw ApiErr.BadRequest(`Пользователя с данным ${obj.id} не существует`);
      }
    } catch(e) {
      throw ApiErr.BadRequest(e.message);
    }
  } 
 
  async activate (activationLink) {
    const user = await DB.searchInTables('user_info',{ activationLink });
    if(!user) {
      throw ApiErr.BadRequest('Ссылка устарела, зарегистрируйтесь заново');
    }
    await DB.updateModelTables(user,{ isActivated: true });
  }

  
  async logout(refreshToken) { 

    const condidate = await DB.searchInTables('user_info',{ refreshToken });  
  
    const token = await DB.updateModelTables(condidate,{ refreshToken: null, accessToken: null });
    return token;
  }

  async refresh(refreshToken) { 
 
    if(!refreshToken) {
      throw ApiErr.UnautorizaedError();
    } 

    const userData = tokenService.validateRefreshToken(refreshToken);  
    const tokenFromDB = await DB.searchInTables('user_token', refreshToken ); 
 
    if(!userData || !tokenFromDB) {
      throw ApiErr.UnautorizaedError();
    } 

    const user = await DB.searchInTables('user_info', { id: userData.userId } ); 
    const data = await tokenService.saveToken(user); 
 
    return {
      ...data
    }
  }

 
  async getUserInfo(refreshToken) { 
   
    if(!refreshToken) {
      throw ApiErr.UnautorizaedError();
    } 
    let result = {}
    const userData = tokenService.validateRefreshToken(refreshToken);  
    const user = await DB.searchInTables('user_info', userData.userId ); 
 
    result = {  
      ...serviceFunction.removeEmpty(user, 'AuthInfos'),  
      ...serviceFunction.removeEmpty(serviceFunction.getObjkey(user,'Profiles',false), 'Profiles'),  
    };  

    let pages = []

    serviceFunction.getObjkey(serviceFunction.getObjkey(user,'Profiles',false),'Pages',false).map((item) => {
 
      pages.push(serviceFunction.removeEmpty(item, 'Pages'))
    })

    result.pages = pages;
 
    return { user: result } 
  }

  async getUserData(id) {
    const userData = await DB.searchInTables('vk',{ user_id: id });
    return userData;
  }

  async sendInfo (body, res, next) {
    try {
      const { body } = req.body; 
      const {
        byer_initial_dead,
        byer_date_birthday,
        byer_date_dead,
        install,
        photo,
        byer_initial,
        byer_tel,
        coment,
        byer_email,
        addres_city,
        addres,
        addres_index,
        addres_region,
        delivery_method,
        pay_method,
        buy,
        width,
        material, 
      } = body
  
      return response
    } catch(e) {
      console.log(e)
      if (err instanceof multer.MulterError) {
        throw ApiErr.BadRequest(e.message)
        // return res.status(500).json(err)
      } else if (err) {
        // return res.status(500).json(err)
        throw ApiErr.BadRequest(e.message)
      }
    }
  }

  async sendConsult (res, byer_consult_initial, byer_consult_tel, coment_consult) {
    try {
   
    let result = await mailService.sendConsultMail(res, byer_consult_initial, byer_consult_tel, coment_consult); 
  
      // return result
    } catch(e) {
      console.log(e)
      if (err instanceof multer.MulterError) {
        throw ApiErr.BadRequest(e.message)
        // return res.status(500).json(err)
      } else if (err) {
        // return res.status(500).json(err)
        throw ApiErr.BadRequest(e.message)
      }
    }
  }

  async upload (req, res, next) { 

    const { 
      pageId,
      userId, 
      initialDeath, 
      deathdate, 
      birthdate, 
      nationality, 
      birthlocation, 
      deathlocation, 
      backgroundselect, 
      secondhalf, 
      children, 
      career, 
      education, 
      epity,    
      OneBlockArea,   
      OneBlockInputTitle, 
      TwoBlockInputTitle,  
      OneBlockOneInput,  
      OneBlockTwoInput,  
      TwoBlockArea, 
      TwoBlockOneInput, 
      TwoBlockTwoInput,   
      ThreeBlockArea,   
    } = req.body
 
    try { 
 
      let createDataPage = await this.createPage({ 
        initialDeath, 
        deathdate, 
        birthdate, 
        nationality, 
        birthlocation, 
        deathlocation, 
        backgroundselect, 
        secondhalf, 
        children, 
        career, 
        education, 
        epity,    
        OneBlockArea,   
        OneBlockInputTitle, 
        TwoBlockInputTitle,   
        OneBlockOneInput,  
        OneBlockTwoInput,  
        TwoBlockArea, 
        TwoBlockOneInput, 
        TwoBlockTwoInput,   
        ThreeBlockArea,   
      },userId) // создали страницу без медиа файлов 
 
      const filephoto = req.files?.upload_photo; 
      const filemedia = req.files?.media;   
      const fileOneList = req.files?.fileOneList;   
      const fileTwoList = req.files?.fileTwoList;     
  
      const foldername = createDataPage?.page?.pageId; 
      const filePhotoPath = path.join(__dirname, '../uploads/'+ foldername + '/photo/' + uuid.v4().split('-')[0] +'.png')
      const fileMediaPath = '';
      const objectKey = 'objectkey.jpeg'
      const copyObjectKey = 'objectkeycopy'
      const bucketParams = { Bucket: '430133e2-5ac8175c-9526-49bf-adaa-a31193a1248c' } // <--- заменить
      const uploadParams = { Bucket: bucketParams.Bucket, Key: '', Body: '' }
      const createParams = { Bucket: bucketParams.Bucket, Key: objectKey, Body: 'test_body123' }
      const metaParams = { Bucket: bucketParams.Bucket, Key: objectKey }
      const copyParams = { Bucket: bucketParams.Bucket, CopySource: `${bucketParams.Bucket}/${objectKey}`, Key: copyObjectKey }
 
      let linkPhotoImage = '';
      let linkMediaImage = [];
 
      if(filephoto !== undefined) {  
        var promisesPhoto = new Promise(async (resolve, reject) => {
          filephoto.mv(filePhotoPath, async (err) => {   
            if (err) {
              return res.status(500).send(err);
            }  

            linkPhotoImage = await this.dowloadS3(filePhotoPath, foldername , 'photo', uploadParams);
          
            const page = await DB.searchInTables('page_id', createDataPage?.page?.pageId);
            if(page) {  
              if (linkPhotoImage !== '') {
                await DB.updateModelTables(page, { 
                  photo: linkPhotoImage.Location
                });  
              } 
              resolve(true) 
            } else { 
              throw ApiErr.BadRequest(`Данной страницы не существует`);
            } 
          });  
        })  
      } 
 
     await promisesPhoto;  

      if(filemedia !== undefined) {  
        var promisesMedia = [];
    
        if(filemedia.size === undefined) {
            promisesMedia = filemedia.map(async(item,key) => { 
            return new Promise(async (resolve, reject) => { 
              item.mv(path.join(__dirname, '../uploads/'+ foldername + '/media/' + foldername + '_' + key +'.png'), async (err) => {   
                if (err) {
                  return res.status(500).send(err);
                }   

                linkMediaImage = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/media/' + foldername + '_' + key +'.png'), foldername , 'media', uploadParams) 
          
                resolve(linkMediaImage.Location) 
              });  
            })  
          })
        } else {
          promisesMedia = new Promise(async (resolve, reject) => { 
            filemedia.mv(path.join(__dirname, '../uploads/'+ foldername + '/media/' + foldername + '.png'), async (err) => {   
              if (err) {
                return res.status(500).send(err);
              }   

              linkMediaImage = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/media/' + foldername + '.png'), foldername , 'media', uploadParams) 
        
              resolve(linkMediaImage.Location) 
            });  
          })  
        }

      }
 
      let LinkBioOneBlock = []

      if(fileOneList !== undefined) {  
        var promisesfileOneList = [];
    
        if(fileOneList.size === undefined) {
          promisesfileOneList = fileOneList.map(async(item,key) => { 
            return new Promise(async (resolve, reject) => { 
              item.mv(path.join(__dirname, '../uploads/'+ foldername + '/bio_one_block/' + foldername + '_' + key +'.png'), async (err) => {   
                if (err) {
                  return res.status(500).send(err);
                }   

                LinkBioOneBlock = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/bio_one_block/' + foldername + '_' + key +'.png'), foldername , 'bio_one_block', uploadParams) 
          
                resolve(LinkBioOneBlock.Location) 
              });  
            })  
          })
        } else {
          promisesfileOneList = new Promise(async (resolve, reject) => { 
            fileOneList.mv(path.join(__dirname, '../uploads/'+ foldername + '/bio_one_block/' + foldername + '.png'), async (err) => {   
              if (err) {
                return res.status(500).send(err);
              }   

              LinkBioOneBlock = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/bio_one_block/' + foldername + '.png'), foldername , 'bio_one_block', uploadParams) 
        
              resolve(LinkBioOneBlock.Location) 
            });  
          })  
        }

      }
 
      const LinksBioOne = []
      

      if(fileOneList !== undefined && fileOneList.size !== undefined) {

        let LinksBioOneFile = await promisesfileOneList 
        LinksBioOne.push(LinksBioOneFile)

      } else {

        if(fileOneList === undefined) {

        } else { 

          let promisesfileOneListArrayLink = await Promise.all(promisesfileOneList); 
          
          promisesfileOneListArrayLink.map((item) => {
            LinksBioOne.push(item)
          }) 
        }
      }
 
      let LinkBioTwoBlock = []
 
      if(fileTwoList !== undefined) {  
        var promisesfileTwoList = [];
    
        if(fileTwoList.size === undefined) {
          promisesfileTwoList = fileTwoList.map(async(item,key) => { 
            return new Promise(async (resolve, reject) => { 
              item.mv(path.join(__dirname, '../uploads/'+ foldername + '/bio_two_block/' + foldername + '_' + key +'.png'), async (err) => {   
                if (err) {
                  return res.status(500).send(err);
                }   

                LinkBioTwoBlock = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/bio_two_block/' + foldername + '_' + key +'.png'), foldername , 'bio_two_block', uploadParams) 
          
                resolve(LinkBioTwoBlock.Location) 
              });  
            })  
          })
        } else {
          promisesfileTwoList = new Promise(async (resolve, reject) => { 
            fileTwoList.mv(path.join(__dirname, '../uploads/'+ foldername + '/bio_two_block/' + foldername + '.png'), async (err) => {   
              if (err) {
                return res.status(500).send(err);
              }   

              LinkBioTwoBlock = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/bio_two_block/' + foldername + '.png'), foldername , 'bio_two_block', uploadParams) 
        
              resolve(LinkBioTwoBlock.Location) 
            });  
          })  
        }

      }
  
       
      const LinksBioTwo = []
      

      if(fileTwoList !== undefined && fileTwoList.size !== undefined) {

        let LinksBioOneFile = await promisesfileTwoList 
        LinksBioTwo.push(LinksBioOneFile)

      } else {

        if(fileTwoList === undefined) {

        } else { 

          let promisesfileTwoListArrayLink = await Promise.all(promisesfileTwoList); 
          
          promisesfileTwoListArrayLink.map((item) => {
            LinksBioTwo.push(item)
          }) 
        }
      }
 
      let linkMediaSlider = [];
 
      if(filemedia !== undefined && filemedia.size !== undefined) {
        let linkOneFile = await promisesMedia
 
        linkMediaSlider.push(
          {
            original: linkOneFile,
            thumbnail: linkOneFile,
            originalWidth: '100%',
            originalHeight: '100%', 
          }
        )
      } else {

        if(filemedia === undefined) {

        } else { 
          let promisesMediaArrayLink = await Promise.all(promisesMedia); 
          
          promisesMediaArrayLink.map((item) => {
            linkMediaSlider.push(
              {
                original: item,
                thumbnail: item,
                originalWidth: '100%',
                originalHeight: '100%', 
              }
            )
          }) 
        }
      }
 
      const page = await DB.searchInTables('page_id', createDataPage?.page?.pageId); 

      if(page) {   
          var newpage = await DB.updateModelTables(page, { 
            media: JSON.stringify(linkMediaSlider),
            fileOneList: JSON.stringify(LinksBioOne),
            fileTwoList: JSON.stringify(LinksBioTwo), 
          });   
      } else {  
        throw ApiErr.BadRequest(`Данной страницы не существует`);
      } 
 
      const fs = require('fs')
      fs.rmSync(path.join(__dirname, '../uploads/'+ foldername ), { recursive: true, force: true }); 
      return foldername; 

    } catch(err) { 
      if (err instanceof multer.MulterError) {
        throw ApiErr.BadRequest(err.message)
        // return res.status(500).json(err)
      } else if (err) {
        // return res.status(500).json(err)
        throw ApiErr.BadRequest(err.message)
      }
    }
  }

  async editPage (req, res, next) { 

    const { 
      pageId,
      userId, 
      initialDeath, 
      deathdate, 
      birthdate, 
      nationality, 
      birthlocation, 
      deathlocation, 
      backgroundselect, 
      secondhalf, 
      children, 
      career, 
      education, 
      epity,    
      OneBlockArea,   
      OneBlockInputTitle, 
      TwoBlockInputTitle,  
      OneBlockOneInput,  
      OneBlockTwoInput,  
      TwoBlockArea, 
      TwoBlockOneInput, 
      TwoBlockTwoInput,   
      ThreeBlockArea,   
    } = req.body
 
    try { 
 
      const page = await DB.searchInTables('page_id', pageId); 
 
      if(page) {   
          var tmpDeathdate = deathdate.split('-');
          var tmpBirthdate = birthdate.split('-'); 
 
          var newpage = await DB.updateModelTables(page, { 
            initialDeath, 
            deathdate:  new Date(`${tmpDeathdate[2]}-${tmpDeathdate[1]}-${tmpDeathdate[0]}`),  
            birthdate: new Date(`${tmpBirthdate[2]}-${tmpBirthdate[1]}-${tmpBirthdate[0]}`), 
            nationality, 
            birthlocation, 
            deathlocation, 
            backgroundselect, 
            secondhalf, 
            children, 
            career, 
            education, 
            epity,    
            OneBlockArea,   
            OneBlockInputTitle, 
            TwoBlockInputTitle,  
            OneBlockOneInput,  
            OneBlockTwoInput,  
            TwoBlockArea, 
            TwoBlockOneInput, 
            TwoBlockTwoInput,   
            ThreeBlockArea, 
            // media: JSON.stringify(linkMediaSlider),
            // fileOneList: JSON.stringify(LinksBioOne),
            // fileTwoList: JSON.stringify(LinksBioTwo), 
          });   
      } else {  
        throw ApiErr.BadRequest(`Данной страницы не существует`);
      } 



      
      const filephoto = req.files?.upload_photo; 
      const filemedia = req.files?.media;   
      const fileOneList = req.files?.fileOneList;   
      const fileTwoList = req.files?.fileTwoList;     
  
      const foldername = pageId; 
      const filePhotoPath = path.join(__dirname, '../uploads/'+ foldername + '/photo/' + uuid.v4().split('-')[0] +'.png')
      const fileMediaPath = '';
      const objectKey = 'objectkey.jpeg'
      const copyObjectKey = 'objectkeycopy'
      const bucketParams = { Bucket: '430133e2-5ac8175c-9526-49bf-adaa-a31193a1248c' } // <--- заменить
      const uploadParams = { Bucket: bucketParams.Bucket, Key: '', Body: '' }
      const createParams = { Bucket: bucketParams.Bucket, Key: objectKey, Body: 'test_body123' }
      const metaParams = { Bucket: bucketParams.Bucket, Key: objectKey }
      const copyParams = { Bucket: bucketParams.Bucket, CopySource: `${bucketParams.Bucket}/${objectKey}`, Key: copyObjectKey }
 
      let linkPhotoImage = '';
      let linkMediaImage = [];
 

      await this.emptyS3Directory (bucketParams, `${pageId}`)  

 
      if(filephoto !== undefined) {  
        var promisesPhoto = new Promise(async (resolve, reject) => {
          filephoto.mv(filePhotoPath, async (err) => {   
            if (err) {
              return res.status(500).send(err);
            }  

            linkPhotoImage = await this.dowloadS3(filePhotoPath, foldername , 'photo', uploadParams);
          
            const page = await DB.searchInTables('page_id', pageId);
            if(page) {  
              if (linkPhotoImage !== '') {
                await DB.updateModelTables(page, { 
                  photo: linkPhotoImage.Location
                });  
              } 
              resolve(true) 
            } else { 
              throw ApiErr.BadRequest(`Данной страницы не существует`);
            } 
          });  
        })  
      } 
 
     await promisesPhoto;  

      if(filemedia !== undefined) {  
        var promisesMedia = [];
    
        if(filemedia.size === undefined) {
            promisesMedia = filemedia.map(async(item,key) => { 
            return new Promise(async (resolve, reject) => { 
              item.mv(path.join(__dirname, '../uploads/'+ foldername + '/media/' + foldername + '_' + key +'.png'), async (err) => {   
                if (err) {
                  return res.status(500).send(err);
                }   

                linkMediaImage = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/media/' + foldername + '_' + key +'.png'), foldername , 'media', uploadParams) 
          
                resolve(linkMediaImage.Location) 
              });  
            })  
          })
        } else {
          promisesMedia = new Promise(async (resolve, reject) => { 
            filemedia.mv(path.join(__dirname, '../uploads/'+ foldername + '/media/' + foldername + '.png'), async (err) => {   
              if (err) {
                return res.status(500).send(err);
              }   

              linkMediaImage = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/media/' + foldername + '.png'), foldername , 'media', uploadParams) 
        
              resolve(linkMediaImage.Location) 
            });  
          })  
        }

      }
 
      let LinkBioOneBlock = []

      if(fileOneList !== undefined) {  
        var promisesfileOneList = [];
    
        if(fileOneList.size === undefined) {
          promisesfileOneList = fileOneList.map(async(item,key) => { 
            return new Promise(async (resolve, reject) => { 
              item.mv(path.join(__dirname, '../uploads/'+ foldername + '/bio_one_block/' + foldername + '_' + key +'.png'), async (err) => {   
                if (err) {
                  return res.status(500).send(err);
                }   

                LinkBioOneBlock = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/bio_one_block/' + foldername + '_' + key +'.png'), foldername , 'bio_one_block', uploadParams) 
          
                resolve(LinkBioOneBlock.Location) 
              });  
            })  
          })
        } else {
          promisesfileOneList = new Promise(async (resolve, reject) => { 
            fileOneList.mv(path.join(__dirname, '../uploads/'+ foldername + '/bio_one_block/' + foldername + '.png'), async (err) => {   
              if (err) {
                return res.status(500).send(err);
              }   

              LinkBioOneBlock = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/bio_one_block/' + foldername + '.png'), foldername , 'bio_one_block', uploadParams) 
        
              resolve(LinkBioOneBlock.Location) 
            });  
          })  
        }

      }
 
      const LinksBioOne = []
      

      if(fileOneList !== undefined && fileOneList.size !== undefined) {

        let LinksBioOneFile = await promisesfileOneList 
        LinksBioOne.push(LinksBioOneFile)

      } else {

        if(fileOneList === undefined) {

        } else { 

          let promisesfileOneListArrayLink = await Promise.all(promisesfileOneList); 
          
          promisesfileOneListArrayLink.map((item) => {
            LinksBioOne.push(item)
          }) 
        }
      }
 
      let LinkBioTwoBlock = []
 
      if(fileTwoList !== undefined) {  
        var promisesfileTwoList = [];
    
        if(fileTwoList.size === undefined) {
          promisesfileTwoList = fileTwoList.map(async(item,key) => { 
            return new Promise(async (resolve, reject) => { 
              item.mv(path.join(__dirname, '../uploads/'+ foldername + '/bio_two_block/' + foldername + '_' + key +'.png'), async (err) => {   
                if (err) {
                  return res.status(500).send(err);
                }   

                LinkBioTwoBlock = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/bio_two_block/' + foldername + '_' + key +'.png'), foldername , 'bio_two_block', uploadParams) 
          
                resolve(LinkBioTwoBlock.Location) 
              });  
            })  
          })
        } else {
          promisesfileTwoList = new Promise(async (resolve, reject) => { 
            fileTwoList.mv(path.join(__dirname, '../uploads/'+ foldername + '/bio_two_block/' + foldername + '.png'), async (err) => {   
              if (err) {
                return res.status(500).send(err);
              }   

              LinkBioTwoBlock = await this.dowloadS3(path.join(__dirname, '../uploads/'+ foldername + '/bio_two_block/' + foldername + '.png'), foldername , 'bio_two_block', uploadParams) 
        
              resolve(LinkBioTwoBlock.Location) 
            });  
          })  
        }

      }
  
       
      const LinksBioTwo = []
      

      if(fileTwoList !== undefined && fileTwoList.size !== undefined) {

        let LinksBioOneFile = await promisesfileTwoList 
        LinksBioTwo.push(LinksBioOneFile)

      } else {

        if(fileTwoList === undefined) {

        } else { 

          let promisesfileTwoListArrayLink = await Promise.all(promisesfileTwoList); 
          
          promisesfileTwoListArrayLink.map((item) => {
            LinksBioTwo.push(item)
          }) 
        }
      }
 
      let linkMediaSlider = [];
 
      if(filemedia !== undefined && filemedia.size !== undefined) {
        let linkOneFile = await promisesMedia
 
        linkMediaSlider.push(
          {
            original: linkOneFile,
            thumbnail: linkOneFile,
            originalWidth: '100%',
            originalHeight: '100%', 
          }
        )
      } else {

        if(filemedia === undefined) {

        } else { 
          let promisesMediaArrayLink = await Promise.all(promisesMedia); 
          
          promisesMediaArrayLink.map((item) => {
            linkMediaSlider.push(
              {
                original: item,
                thumbnail: item,
                originalWidth: '100%',
                originalHeight: '100%', 
              }
            )
          }) 
        }
      }
 
      const pagemedia = await DB.searchInTables('page_id',pageId); 

      if(pagemedia) {   
          var newpage = await DB.updateModelTables(pagemedia, { 
            media: JSON.stringify(linkMediaSlider),
            fileOneList: JSON.stringify(LinksBioOne),
            fileTwoList: JSON.stringify(LinksBioTwo), 
          });   
      } else {  
        throw ApiErr.BadRequest(`Данной страницы не существует`);
      } 
 
      const fs = require('fs')
      fs.rmSync(path.join(__dirname, '../uploads/'+ foldername ), { recursive: true, force: true }); 
 
      return pageId; 

    } catch(err) { 
      if (err instanceof multer.MulterError) {
        throw ApiErr.BadRequest(err.message)
        // return res.status(500).json(err)
      } else if (err) {
        // return res.status(500).json(err)
        throw ApiErr.BadRequest(err.message)
      }
    }
  }
 
  async createfileS3 (createParams) {
    try {
      console.log('Создание файла из скрипта')
      const s3 = new S3({
        accessKeyId: 'cw35668', // <--- заменить
        secretAccessKey: 'b22752c821e8128f8257e7df5d5ba8c3', // <--- заменить
        endpoint: 'https://s3.timeweb.com',
        s3ForcePathStyle: true,
        region: 'ru-1',
        apiVersion: 'latest',
      })
      const res = await s3.putObject(createParams).promise()
      console.log('Success', res)
    } catch (e) {
      console.log('Error', e)
    }
  }

  async dowloadS3 (file, foldername, subfolder, uploadParams) {
        
    try {

      console.log('Загрузка файла в бакет', foldername) 
 
      const s3 = new S3({
        accessKeyId: 'cw35668', // <--- заменить
        secretAccessKey: 'b22752c821e8128f8257e7df5d5ba8c3', // <--- заменить
        endpoint: 'https://s3.timeweb.com',
        s3ForcePathStyle: true,
        region: 'ru-1',
        apiVersion: 'latest',
      })
 
      const fs = require('fs')
      const fileStream = fs.createReadStream(file)
      fileStream.on('error', function (err) {
        console.log('File Error', err)
      })

      uploadParams.Body = fileStream 
     
      uploadParams.Key = `${foldername}/${subfolder}/${path.basename(file)}`

      const res = await s3.upload(uploadParams).promise()
      console.log('Success', res.Location) 
      return res
    } catch (e) {
   
      console.log('Error', e)
    } 
  }

  async emptyS3Directory(bucketParams, dir) {
 
    const s3 = new S3({
      accessKeyId: 'cw35668', // <--- заменить
      secretAccessKey: 'b22752c821e8128f8257e7df5d5ba8c3', // <--- заменить
      endpoint: 'https://s3.timeweb.com',
      s3ForcePathStyle: true,
      region: 'ru-1',
      apiVersion: 'latest',
    })

    const listParams = {
        Bucket: bucketParams.Bucket,
        Prefix: `${dir}/` 
    };
 
    const listedObjects = await s3.listObjects(listParams).promise();

    if (listedObjects.Contents.length === 0) return;
 
    const deleteParams = {
      Bucket: bucketParams.Bucket,
        Delete: { Objects: [] }
    };

    listedObjects.Contents.forEach(({ Key }) => {  
        deleteParams.Delete.Objects.push({ Key });
    });
 
    await s3.deleteObjects(deleteParams).promise();

    if (listedObjects.IsTruncated) await this.emptyS3Directory (bucketParams, `${pageId}`);
}

  async listFileS3 (bucketParams,pageId) {

    const s3 = new S3({
      accessKeyId: 'cw35668', // <--- заменить
      secretAccessKey: 'b22752c821e8128f8257e7df5d5ba8c3', // <--- заменить
      endpoint: 'https://s3.timeweb.com',
      s3ForcePathStyle: true,
      region: 'ru-1',
      apiVersion: 'latest',
    })
     
    try {

      console.log('Список объектов в бакете')
  
      const res = await s3.listObjects(bucketParams).promise()
      console.log('Success', res)
      res.Contents.map((item, key) => {
        console.log('item.key', item)
      })
      return res
    } catch (e) {
      console.log('Error', e)
    }
  }

  async deletedFileS3 (Key) {
    try {
      console.log('Удаление объектов')

      const s3 = new S3({
        accessKeyId: 'cw35668', // <--- заменить
        secretAccessKey: 'b22752c821e8128f8257e7df5d5ba8c3', // <--- заменить
        endpoint: 'https://s3.timeweb.com',
        s3ForcePathStyle: true,
        region: 'ru-1',
        apiVersion: 'latest',
      })

      const res = await s3.deleteObject({ Bucket: '430133e2-5ac8175c-9526-49bf-adaa-a31193a1248c', Key }).promise()
      console.log('Success', res) 
    } catch (e) {
      console.log('Error', e)
    }
  }
  
  async createPage(pageInfo, userId) {
   
    try { 
      const {
        initialDeath, 
        deathdate, 
        birthdate, 
        nationality, 
        birthlocation, 
        deathlocation, 
        backgroundselect, 
        secondhalf, 
        children, 
        career, 
        education, 
        epity,    
        OneBlockArea,   
        OneBlockInputTitle, 
        TwoBlockInputTitle,  
        OneBlockOneInput,  
        OneBlockTwoInput,  
        TwoBlockArea, 
        TwoBlockOneInput, 
        TwoBlockTwoInput,   
        ThreeBlockArea,   
      } = pageInfo 
 
      const pageId = uuid.v4().split('-')[0]; 
    
      const page = await DB.addInTables('page',{  
        userId,
        initialDeath, 
        deathdate, 
        birthdate, 
        nationality, 
        birthlocation, 
        deathlocation, 
        backgroundselect, 
        secondhalf, 
        children, 
        career, 
        education, 
        epity,    
        OneBlockArea,   
        OneBlockInputTitle, 
        TwoBlockInputTitle,  
        OneBlockOneInput,  
        OneBlockTwoInput,  
        TwoBlockArea, 
        TwoBlockOneInput, 
        TwoBlockTwoInput,   
        ThreeBlockArea,    
        pageId,
        pagelink: `${url_client}pages/${pageId}`,
      });
  
      const PageDtos = new PageDto(page);
      
      return {  
        page: { ...PageDtos } 
      } 

    } catch(e) {
      throw ApiErr.BadRequest(e.message)
    } 
  }
 
}

module.exports = new UserService();
