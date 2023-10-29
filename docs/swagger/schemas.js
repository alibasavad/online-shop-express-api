// ---------------------------------User schema----------------------------
/**
 * @swagger
 * components:
 *  schemas:
 *      User:
 *          type: object
 *          properties:
 *              id:
 *                  type : Schema.Types.ObjectId
 *              firstName:
 *                  type : String
 *              lastName:
 *                  type : String
 *              email:
 *                  type : String
 *                  unique: true
 *                  required: true
 *                  lowercase : true
 *              password:
 *                  type : String
 *                  required: true
 *              passExpiresAt:
 *                  type : Number
 *                  defualt: null
 *              isDisable:
 *                  type : Boolean
 *                  default : true
 *              phoneNumber:
 *                  type : String
 *                  unique: true
 *                  required: true
 *              verificationCode:
 *                  type : object
 *                  properties:
 *                      code:
 *                          type : String
 *                      expiresAt :
 *                          type: Number
 *              role:
 *                  type : Array of String
 *
 */

// ---------------------------------Category schema----------------------------
/**
 * @swagger
 * components:
 *  schemas:
 *      Category:
 *          type: object
 *          properties:
 *              id:
 *                  type : Schema.Types.ObjectId
 *              name:
 *                  type : String
 *                  required: true
 *                  unique : true
 *              thumbnail:
 *                  type : String
 *              description:
 *                  type : String
 *              isDisable:
 *                  type : Boolean
 *                  default: false
 *
 */

// ---------------------------------Product schema----------------------------
/**
 * @swagger
 * components:
 *  schemas:
 *      Product:
 *          type: object
 *          properties:
 *              id:
 *                  type : Schema.Types.ObjectId
 *              name:
 *                  type : String
 *                  required: true
 *                  unique : true
 *              categoryId:
 *                  type : Array of ObjectId
 *              price:
 *                  type : Number
 *                  required : true
 *              quantity :
 *                  type : Number
 *                  required : true
 *              images :
 *                  type : object
 *                  properties:
 *                      imageURL :
 *                          type : String
 *                      isMain :
 *                          type : Boolean
 *                          default : dalse
 *              thumbnail:
 *                  type : String
 *              description:
 *                  type : String
 *              isDisable:
 *                  type : Boolean
 *                  default: false
 */

// ---------------------------------Role schema----------------------------
/**
 * @swagger
 * components:
 *  schemas:
 *      Role:
 *          type: object
 *          properties:
 *              id:
 *                  type : Schema.Types.ObjectId
 *              name:
 *                  type : String
 *                  required: true
 *                  unique : true
 *              permissions:
 *                  type : Array of String
 *              isDisable:
 *                  type : Boolean
 *                  default: false
 *
 */

// ---------------------------------Token schema----------------------------
/**
 * @swagger
 * components:
 *  schemas:
 *      Token:
 *          type: object
 *          properties:
 *              id:
 *                  type : Schema.Types.ObjectId
 *              token:
 *                  type : object
 *                  properties :
 *                      accessToken :
 *                          type : String
 *                      refreshToken :
 *                          type : String
 *              user:
 *                  type : Schema.Types.ObjectId
 *
 */
