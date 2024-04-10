import * as category from "../controllers/category-services";
import * as order from "../controllers/order-services";
import * as cart from "../controllers/cart-services";
import * as product from "../controllers/product-services";
import * as wallet from "../controllers/wallet-services";
import * as user from "../controllers/user-services";
import * as rolePermission from "../controllers/role-permission-services";
import * as uploader from "../middlewares/uploader";
import { checkPermission } from "../middlewares/check-permission";
import { authenticate } from "../middlewares/authenticate";
import express from "express";

const router: any = express.Router();

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

router
    .route("/category/force_delete/:Id")
    .delete(authenticate, checkPermission, category.forceDelete);

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

router
    .route("/product/force_delete/:Id")
    .delete(authenticate, checkPermission, product.forceDelete);

// __________________________RolePermission Services_________________________________

router
    .route("/roles")
    .get(authenticate, checkPermission, rolePermission.readAllRoles);

router
    .route("/role")
    .post(authenticate, checkPermission, rolePermission.createRole);

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

// __________________________Cart Services_________________________________

router.route("/cart").get(authenticate, cart.readCart);

router
    .route("/active_carts")
    .get(authenticate, checkPermission, cart.activeCarts);

router.route("/add_cart").patch(authenticate, cart.addProduct);

router.route("/subtract_cart").patch(authenticate, cart.subtractProduct);

// __________________________Wallet Services_________________________________

router.route("/wallet").get(authenticate, wallet.readWallet);

router.route("/wallet/deposit").patch(authenticate, wallet.deposit);

router.route("/wallet/deposit/verify").get(authenticate, wallet.verification);

// __________________________Order Services_________________________________

router.route("/payment").post(authenticate, order.payment);

router.route("/verify_payment").get(order.verifyOrder);

router.route("/orders").get(authenticate, order.readOrders);

router.route("/order/:Id").get(authenticate, order.readOrderById);

router
    .route("/check_orders")
    .get(authenticate, checkPermission, order.checkOrders);

router
    .route("/check_order")
    .patch(authenticate, checkPermission, order.checkOrder);

router
    .route("/not_checkd_orders")
    .get(authenticate, checkPermission, order.notCheckedOrders);

router
    .route("/pending_orders")
    .get(authenticate, checkPermission, order.pendingOrders);

router
    .route("/delivered_orders")
    .get(authenticate, checkPermission, order.deliveredOrders);

router.route("/deliver").patch(authenticate, checkPermission, order.deliver);

export default router;
