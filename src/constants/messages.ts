import { MessageCodeClass } from "../interfaces/index";

export let messageCodes = new MessageCodeClass();
messageCodes = {
    100: { message: "Fetched Data Successfully" },
    101: { message: "Category Created Successfully" },
    102: { message: "Category Disabled Successfully" },
    103: { message: "Category Updated Successfully" },
    104: { message: "Category Thumbnail Deleted Successfully" },
    105: { message: "Category Enabled Successfully" },
    106: { message: "Product Created Successfully" },
    107: { message: "Product Disabled Successfully" },
    108: { message: "Product Updated Successfully" },
    109: { message: "Product Images Deleted Successfully" },
    110: { message: "Product Enabled Successfully" },
    111: { message: "Role Created Successfully" },
    112: { message: "User Role Changed Successfully" },
    113: { message: "Role Added To User Successfully" },
    114: { message: "Role Updated Successfully" },
    115: { message: "Role Disabled Successfully" },
    116: { message: "Role Enabled Successfully" },
    117: { message: "User Registerd Successfully" },
    118: {
        message:
            "Your Account Successfully Been Disabled , You Can Enable Your Account By Verifing With Your Email",
    },
    119: { message: "Please verify your account with your email" },
    120: { message: "this password is expired try forget password" },
    121: { message: "Verification Code sent to your email" },
    122: { message: "User Updated successfully" },
    123: { message: "Password changed successfully" },
    124: {
        message:
            "Your new password sent to your email\nthis password only works for a day\nchange your password in your profile",
    },
    125: {
        message:
            "password must contain\nUpper case and Lower case and number\nand be 8 or more charecters\nAnd can not contain space",
    },
    126: {
        message:
            "Name must start with alphebet and\ncan only contain alphebet and numbers",
    },
    127: {
        message: "PhoneNumber Must start with 09 and must contain 11 numbers",
    },
    128: {
        message:
            "First and Last name must contain only alphebet and space\nand must start with alphebet",
    },
    129: { message: "Email Sent" },
    130: { message: "File Uploaded Successfully" },
    131: { message: "User Logout Successfully" },
    132: { message: "Data Deleted Successfully" },
    133: { message: "Your Order Has Been Registered" },
    134: { message: "Wallet Creddit Increased Successfully" },
};
