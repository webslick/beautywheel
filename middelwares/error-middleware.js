const ApiErr = require('../exeptions/api-error');

module.exports = function (err,req,res,next) {
  if (err instanceof ApiErr) {
    if(err.message.length < 5) {
      err.message = 'Возникла ошибка:'
    }
    return res.status(err.status).json({message: err.message,errors:err.errors})
  }
  return res.status(500).json({message:'Непредвиденная ошибка'});
}