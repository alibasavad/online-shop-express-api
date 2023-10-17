import * as category from "../controllers/category-services";
import * as product from "../controllers/product-services";
import * as user from "../controllers/user-services";
import * as rolePermission from "../controllers/role-permission-services";

const express = require("express");

const router = express.Router();

// __________________________Category Services_________________________________

router.route("/categories").get(category.readAllCategories);

router
  .route("/category")
  .post(rolePermission.checkPermission, category.createCategory);

router
  .route("/category/:Id")
  .get(category.readCategoryById)
  .delete(rolePermission.checkPermission, category.deleteCategory)
  .patch(rolePermission.checkPermission, category.updateCategory);

// __________________________Product Services_________________________________

router.route("/products").get(product.readAllProducts);

router
  .route("/product")
  .post(rolePermission.checkPermission, product.createProduct);

router
  .route("/product/:Id")
  .get(product.readProductById)
  .delete(rolePermission.checkPermission, product.deleteProduct)
  .patch(rolePermission.checkPermission, product.updateProduct);

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
  .delete(rolePermission.checkPermission, rolePermission.deleteRole)
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

module.exports = router;
