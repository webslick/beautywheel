module.exports = class ApiErr extends Error {
  status;
  errors;

  constructor(status,message,errors=[]) {
    console.log(status,message,errors,"CONSTRUCTOR")
    super(message)
    this.status = status;
    this.errors = errors;
  }

  static UnautorizaedError() {
    return new ApiErr(401,'Пользователь не авторизован')
  }

  static BadRequest(message,errors=[]) {
    return new ApiErr(400,message,errors);
  }

}