import * as category from "../controllers/category-services";
import * as product from "../controllers/product-services";
import * as user from "../controllers/user-services";
import * as rolePermission from "../controllers/role-permission-services";
import * as uploader from "../middlewares/uploader";
import { checkPermission } from "../middlewares/check-permission";
import { authenticate } from "../middlewares/authenticate";

const express = require("express");

const router = express.Router();

// __________________________Upload Services___________________________________

router
  .route("/upload/image")
  .post(authenticate, checkPermission, uploader.uploadImages);

// __________________________Category Services_________________________________

router.route("/categories").get(authenticate, category.readAllCategories);

router
  .route("/category")
  .post(authenticate, checkPermission, category.createCategory);

router
  .route("/category/:Id")
  .get(authenticate, category.readCategoryById)
  .delete(authenticate, checkPermission, category.disableCategory)
  .patch(authenticate, checkPermission, category.updateCategory);

router
  .route("/category/thumbnail/:Id")
  .patch(authenticate, checkPermission, category.updateCategoryThumbnail)
  .delete(authenticate, checkPermission, category.deleteCategoryThumbnail);

router
  .route("/category/enable/:Id")
  .post(authenticate, checkPermission, category.enableCategory);

router
  .route("/disable-categories")
  .get(authenticate, checkPermission, category.readDisabledCategories);

// __________________________Product Services_________________________________

router.route("/products").get(authenticate, product.readAllProducts);

router
  .route("/product")
  .post(authenticate, checkPermission, product.createProduct);

router
  .route("/product/:Id")
  .get(authenticate, product.readProductById)
  .delete(authenticate, checkPermission, product.disableProduct)
  .patch(authenticate, checkPermission, product.updateProduct);

router
  .route("/product/images/:Id")
  .patch(authenticate, checkPermission, product.updateProductImages)
  .delete(authenticate, checkPermission, product.deleteProductImages);

router
  .route("/product/enable/:Id")
  .post(authenticate, checkPermission, product.enableProduct);

router
  .route("/disable-products")
  .get(authenticate, checkPermission, product.readDisabledProducts);

// __________________________RolePermission Services_________________________________

router
  .route("/roles")
  .get(authenticate, checkPermission, rolePermission.readAllRoles);

router.route("/role").post(checkPermission, rolePermission.createRole);

router
  .route("/role/:Id")
  .get(authenticate, checkPermission, rolePermission.readRoleById)
  .delete(authenticate, checkPermission, rolePermission.disableRole)
  .patch(authenticate, checkPermission, rolePermission.updateRole);

router
  .route("/permissions")
  .get(authenticate, checkPermission, rolePermission.readAllPermissions);

router
  .route("/user_role/change")
  .patch(authenticate, checkPermission, rolePermission.changeUserRole);

router
  .route("/user_role/add")
  .patch(authenticate, checkPermission, rolePermission.addUserRole);

router
  .route("/role/enable/:Id")
  .post(authenticate, checkPermission, rolePermission.enableRole);

router
  .route("/disable-roles")
  .get(authenticate, checkPermission, rolePermission.readDisabledRoles);

// __________________________User Services_________________________________

router
  .route("/profile")
  .get(authenticate, user.readProfile)
  .patch(authenticate, user.updateProfile);

router
  .route("/profile/change_password")
  .patch(authenticate, user.changePassword);

router.route("/forget_password").post(user.resetPassword);

router.route("/verify").post(user.verifyAccount);

router.route("/verification_code").post(user.sendVerificationCode);

router.route("/register").post(user.register);

router.route("/disable_account").post(user.disableAccount);

router.route("/login").post(user.login);

router.route("/logout").post(user.logout);

router.route("/generate_token").post(user.generateAccessToken);

router.route("/users").get(authenticate, checkPermission, user.readAllUsers);

module.exports = router;
