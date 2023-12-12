const ApiErr = require('../exeptions/api-error');
const tokenService = require('../services/token-service.js');
module.exports = function (err,req,res,next) {
  try {
    const autorizationHeader = req.headers.authorization;
    if(!autorizationHeader) {
      return next(ApiErr.UnautorizaedError());
    }
    const accessToken = autorizationHeader.split(' ')[1];
    if(!accessToken) {
      return next(ApiErr.UnautorizaedError());
    }
    const userData = tokenService.validateAccesToken(accessToken);
    if(!userData) {
      return next(ApiErr.UnautorizaedError());
    }

    req.user = userData;
    next();
  } catch (e) {
    next(ApiErr.UnautorizaedError());
  }
}