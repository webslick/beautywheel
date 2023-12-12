const multer = require('multer');
const path = require('path'); 

const storage = multer.diskStorage({ 
  destination: function (req, file, cb) { 
    cb(null,'files/')
  },
  filename: function (req, file, cb) { 
      let extention = '';
      switch (file.mimetype) {
        case 'image/jpeg':
         extention = 'upload_file.jpeg'
          break;
        case 'image/jpg':
         extention = 'upload_file.jpg'
          break;
        case 'image/png':
         extention = 'upload_file.png'
          break; 
        case 'image/webp':
         extention = 'upload_file.webp'
          break; 
        default:
          break;
      }
      cb(null, (extention))
  }
})

module.exports = multer({storage: storage});
 