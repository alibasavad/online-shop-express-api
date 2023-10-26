import * as constants from "../constants/index";

export const notFound = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Api url doesn't exist ",
  });
};

export class AppError extends Error {
  constructor(errorCode, message) {
    if (message) {
      if (message instanceof Object) message = JSON.stringify(message);
      else if (typeof message === "number")
        message = constants.messages.messageCodes[message];

      super(constants.errors.errorCodes[errorCode][0] + "  :  " + message);
    } else {
      super(constants.errors.errorCodes[errorCode][0]);
    }

    this.errorCode = errorCode;

    this.statusCode = constants.errors.errorCodes[errorCode][1];

    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (error, req, res, next) => {
  if (error.name === "ValidationError") {
    return errorHandler(new AppError(305, error.message), req, res, next);
  }

  if (error.name === "MongoServerError") {
    return errorHandler(new AppError(303, error.keyValue), req, res, next);
  }

  if (error.name === "TokenExpiredError") {
    return errorHandler(new AppError(308), req, res, next);
  }

  if (error.name === "BSONError") {
    return errorHandler(new AppError(300), req, res, next);
  }

  if (error.name === "TypeError") {
    return errorHandler(new AppError(300), req, res, next);
  }

  if (error.name === "CastError") {
    return errorHandler(new AppError(300), req, res, next);
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      errorCode: error.errorCode,
    });
  }

  return res
    .status(500)
    .json({ errorName: error.name, errorMessage: error.message, error: error });
};
