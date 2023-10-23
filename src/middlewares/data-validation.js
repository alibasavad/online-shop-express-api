import { AppError } from "../handlers/error-handler";

const validation = {
  password: (password) => {
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{8,})(?!.*[ ])/g;
    const message =
      "password must contain\nUpper case and Lower case and number\nand be 8 or more charecters\nAnd can not contain space";
    let result = passwordPattern.test(password);
    if (result) return false;
    else throw new AppError(307);
  },

  alphaNumeric: (name) => {
    const namePattern = /^[a-zA-Z](\w|[ ])*$/g;
    const message =
      "Name must start with alphebet and\ncan only contain alphebet and numbers";
    let result = namePattern.test(name);
    if (result) return false;
    else throw new AppError(306);
  },

  phoneNumber: (PhoneNumber) => {
    const phoneNumberPatttern = /^09\d{9}$/g;
    const message =
      "PhoneNumber Must start with 09 and must contain 11 numbers";

    let result = phoneNumberPatttern.test(PhoneNumber);
    if (result) return false;
    else throw new AppError(308);
  },

  alpha: (familyName) => {
    const familyNamePatttern = /^[a-zA-Z][a-zA-Z ]+$/g;
    const message =
      "First and Last name must contain only alphebet and space\nand must start with alphebet";

    let result = familyNamePatttern.test(familyName);
    if (result) return false;
    else throw new AppError(309);
  },
};

module.exports = validation;
