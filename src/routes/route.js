import * as category from "../controllers/category-services";
import * as product from "../controllers/product-services";
import * as user from "../controllers/user-services";
import * as rolePermission from "../controllers/role-permission-services";
import * as uploader from "../middlewares/uploader";

const express = require("express");

const router = express.Router();

// __________________________Category Services_________________________________

router.route("/categories").get(category.readAllCategories);

router
  .route("/category")
  .post(rolePermission.checkPermission, category.createCategory);

router
  .route("/category/thumbnail")
  .post(rolePermission.checkPermission, uploader.uploadCategoryThumbnail);

router
  .route("/category/:Id")
  .get(category.readCategoryById)
  .delete(rolePermission.checkPermission, category.disableCategory)
  .patch(rolePermission.checkPermission, category.updateCategory);

router
  .route("/category/thumbnail/:Id")
  .patch(rolePermission.checkPermission, category.updateCategoryThumbnail)
  .delete(rolePermission.checkPermission, category.deleteCategoryThumbnail);

router
  .route("/category/enable/:Id")
  .post(rolePermission.checkPermission, category.enableCategory);

router
  .route("/disable-categories")
  .get(rolePermission.checkPermission, category.readDisabledCategories);

// __________________________Product Services_________________________________

router.route("/products").get(product.readAllProducts);

router
  .route("/product")
  .post(rolePermission.checkPermission, product.createProduct);

router
  .route("/product/images")
  .post(  uploader.uploadProductImages);

router
  .route("/product/:Id")
  .get(product.readProductById)
  .delete(rolePermission.checkPermission, product.disableProduct)
  .patch(rolePermission.checkPermission, product.updateProduct);

router
  .route("/product/images/:Id")
  .patch(rolePermission.checkPermission, product.updateProductImages)
  .delete(rolePermission.checkPermission, product.deleteProductImages);

router
  .route("/product/enable/:Id")
  .post(rolePermission.checkPermission, product.enableProduct);

router
  .route("/disable-products")
  .get(rolePermission.checkPermission, product.readDisabledProducts);

// __________________________RolePermission Services_________________________________

router
  .route("/roles")
  .get(rolePermission.checkPermission, rolePermission.readAllRoles);

router
  .route("/role")
  .post(rolePermission.checkPermission, rolePermission.createRole);

router
  .route("/role/:Id")
  .get(rolePermission.checkPermission, rolePermission.readRoleById)
  .delete(rolePermission.checkPermission, rolePermission.disableRole)
  .patch(rolePermission.checkPermission, rolePermission.updateRole);

router
  .route("/permissions")
  .get(rolePermission.checkPermission, rolePermission.readAllPermissions);

router.route("/users").get(rolePermission.checkPermission, user.readAllUsers);

router
  .route("/user_role/change")
  .patch(rolePermission.checkPermission, rolePermission.changeUserRole);

router
  .route("/user_role/add")
  .patch(rolePermission.checkPermission, rolePermission.addUserRole);

router
  .route("/role/enable/:Id")
  .post(rolePermission.checkPermission, rolePermission.enableRole);

router
  .route("/disable-roles")
  .get(rolePermission.checkPermission, rolePermission.readDisabledRoles);

// __________________________User Services_________________________________

router
  .route("/profile")
  .get(rolePermission.checkPermission, user.readProfile)
  .patch(rolePermission.checkPermission, user.updateProfile);

router
  .route("/profile/change_password")
  .patch(rolePermission.checkPermission, user.changePassword);

router.route("/forget_password").post(user.resetPassword);

router.route("/verify").post(user.verifyAccount);

router.route("/verification_code").post(user.sendVerificationCode);

router.route("/register").post(user.register);

router.route("/disable_account").post(user.disableAccount);

router.route("/login").post(user.login);

router.route("/logout").post(user.logout);

router.route("/generate_token").post(user.generateAccessToken);

module.exports = router;
