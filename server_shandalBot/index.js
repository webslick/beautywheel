const express = require('express');
const v8 = require('v8');
const app = express();
const path = require('path');
const config = require('config');
const router = require('../routers/router');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const fileUpload = require("express-fileupload"); 
const PORT = config.get('Server.port') || 8080;
const SESSION = require('../db/index');
const TGAPI = require ('../bot_TG_API/index'); 
 
app.use(cors({
  credentials: true, 
  //  origin: 'https://beautywheel.ru/',
 origin: 'http://localhost:3000',
  methods: "GET, POST, PATCH, DELETE, OPTIONS",
},
{
  headers: {
    'access-control-allow-credentials': true,
    'access-control-allow-headers': "Origin, X-Requested-With, Content-Type, Accept",
    'access-control-allow-methods': "GET, POST, PATCH, DELETE, OPTIONS",
    'access-control-allow-origin': '*'
  }
}
));
 
app.use(fileUpload({
  createParentPath: true,
  parseNested: true
}));

app.use(express.json());
app.use(cookieParser());
 
const errorMiddleware = require('../middelwares/error-middleware');
app.use('/api',router);

app.use(errorMiddleware);

if (process.env.NODE_ENV === 'production') {
  app.use('/',express.static(path.join(__dirname,'..','client','build')))
  app.get('*',(req,res)=>{
    res.sendFile(path.resolve(__dirname,'..','client','build','index.html'))
  })
} 

app.listen(PORT,async() => {
  // console.log(await SESSION.searchInTables('user_me',''))
  SESSION.getAdminItems().then(ADMINSETTINGS => {
 console.log(ADMINSETTINGS)
    if(ADMINSETTINGS.toogle_status_bot) {
      TGAPI.initialBotListner(ADMINSETTINGS);
    } else {
      console.log('TELEGRAMM BOT NO CONECTION...!');
    }
  })

  // const garbageInterval = setInterval(() => { SESSION.garbageSessions(); console.log('Проведена очистка сесии',SESSION.LOCAL_USER_SESSIONS) },60000 * 5)
  // const updateUsersInterval = setInterval(async() => {
  //   console.log('GLOBAL_UNIQUE_SESSIONS',SESSION.GLOBAL_UNIQUE_SESSIONS);
  //   await Promise.all(SESSION.GLOBAL_UNIQUE_SESSIONS.map(async (user) => {
  //     if(await SESSION.isUniqmUser(user.id)) {
  //       SESSION.createUser(user);
  //       console.log('Проведена запись новых пользователей');
  //     }
  //   }));
  // },32000 * 1);
 
  const totalHeapSize = v8.getHeapStatistics().total_available_size;
  const totalHeapSizeGb = (totalHeapSize / 1024 / 1024 / 1024).toFixed(2); 
  console.log('TOTAL HEAP SIZE Gb: ', totalHeapSizeGb);
  console.log(`Start server ${PORT} on port`);
  console.log(`process.env.NODE_ENV = ${process.env.NODE_ENV}`); 
  console.log('GLOBAL_UNIQUE_SESSIONS',SESSION.GLOBAL_UNIQUE_SESSIONS);
  console.log('LOCAL_USER_SESSIONS',SESSION.LOCAL_USER_SESSIONS);
});




  
