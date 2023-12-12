import { AppError } from "../handlers/error-handler";

// validate given parameters
const validation = {
    // password validation
    password: (password) => {
        const passwordPattern =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.{8,})(?!.*[ ])/g;

        let result = passwordPattern.test(password);
        if (result) return false;
        else throw new AppError(306, 125);
    },

    // alphaNumeric validation
    alphaNumeric: (name) => {
        const namePattern = /^[a-zA-Z](\w|[ ])*$/g;

        let result = namePattern.test(name);
        if (result) return false;
        else throw new AppError(306, 126);
    },

    // phoneNumber validation
    phoneNumber: (PhoneNumber) => {
        const phoneNumberPatttern = /^09\d{9}$/g;

        let result = phoneNumberPatttern.test(PhoneNumber);
        if (result) return false;
        else throw new AppError(306, 127);
    },

    // alpha validation
    alpha: (familyName) => {
        const familyNamePatttern = /^[a-zA-Z][a-zA-Z ]+$/g;

        let result = familyNamePatttern.test(familyName);
        if (result) return false;
        else throw new AppError(306, 128);
    },
};

module.exports = validation;
