import * as category from "../controllers/category-services";
import * as product from "../controllers/product-services";
import * as user from "../controllers/user-services";
import * as rolePermission from "../controllers/role-permission-services";

const routes = (app) => {
  app
    .route("/category")
    .get(category.readAllCategories)
    .post(rolePermission.checkPermission, category.createCategory);

  app
    .route("/category/:categoryId")
    .get(category.readCategoryById)
    .delete(rolePermission.checkPermission, category.deleteCategory)
    .put(rolePermission.checkPermission, category.updateCategory);

  app
    .route("/product")
    .get(product.readAllProducts)
    .post(rolePermission.checkPermission, product.createProduct);

  app
    .route("/product/:productId")
    .get(product.readProductById)
    .delete(rolePermission.checkPermission, product.deleteProduct)
    .put(rolePermission.checkPermission, product.updateProduct);

  app
    .route("/role")
    .get(rolePermission.checkPermission, rolePermission.readAllRoles)
    .post(rolePermission.checkPermission, rolePermission.createRole);

  app
    .route("/role/:roleId")
    .get(rolePermission.checkPermission, rolePermission.readRoleById)
    .delete(rolePermission.checkPermission, rolePermission.deleteRole)
    .put(rolePermission.checkPermission, rolePermission.updateRole);

  app.route("/verify").post(user.verifyAccount);

  app.route("/verification-code").post(user.sendVerificationCode);

  app.route("/register").post(user.register);

  app.route("/disable-account").post(user.disableAccount);

  app.route("/login").post(user.login);

  app
    .route("/permission")
    .get(rolePermission.checkPermission, rolePermission.readAllPermissions);

  app
    .route("/all-users")
    .get(rolePermission.checkPermission, user.readAllUsers);

  app
    .route("/change-user-role")
    .put(rolePermission.checkPermission, rolePermission.updateUserRole);
};

export default routes;
