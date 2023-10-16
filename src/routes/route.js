import * as category from "../controllers/category-services";
import * as product from "../controllers/product-services";
import * as user from "../controllers/user-services";
import * as rolePermission from "../controllers/role-permission-services";

const express = require("express");

const routes = (app) => {
  app.route("/categories").get(category.readAllCategories);

  app
    .route("/category")
    .post(rolePermission.checkPermission, category.createCategory);

  app
    .route("/category/:Id")
    .get(category.readCategoryById)
    .delete(rolePermission.checkPermission, category.deleteCategory)
    .patch(rolePermission.checkPermission, category.updateCategory);

  app.route("/products").get(product.readAllProducts);

  app
    .route("/product")
    .post(rolePermission.checkPermission, product.createProduct);

  app
    .route("/product/:Id")
    .get(product.readProductById)
    .delete(rolePermission.checkPermission, product.deleteProduct)
    .patch(rolePermission.checkPermission, product.updateProduct);

  app
    .route("/roles")
    .get(rolePermission.checkPermission, rolePermission.readAllRoles);

  app
    .route("/role")
    .post(rolePermission.checkPermission, rolePermission.createRole);

  app
    .route("/role/:Id")
    .get(rolePermission.checkPermission, rolePermission.readRoleById)
    .delete(rolePermission.checkPermission, rolePermission.deleteRole)
    .patch(rolePermission.checkPermission, rolePermission.updateRole);

  app
    .route("/profile")
    .get(rolePermission.checkPermission, user.readProfile)
    .patch(rolePermission.checkPermission, user.updateProfile);

  app.route("/verify").post(user.verifyAccount);

  app.route("/verification_code").post(user.sendVerificationCode);

  app.route("/register").post(user.register);

  app.route("/disable_account").post(user.disableAccount);

  app.route("/login").post(user.login);

  app
    .route("/permissions")
    .get(rolePermission.checkPermission, rolePermission.readAllPermissions);

  app.route("/users").get(rolePermission.checkPermission, user.readAllUsers);

  app
    .route("/change_user_role")
    .put(rolePermission.checkPermission, rolePermission.updateUserRole);
};

export default routes;
