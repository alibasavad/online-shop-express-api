import * as category from "../controllers/category-services";
import * as product from "../controllers/product-services";

const routes = (app) => {
  app
    .route("/category")
    .get(category.readAllCategories)
    .post(category.createCategory);

  app
    .route("/category/:categoryId")
    .get(category.readCategoryById)
    .delete(category.deleteCategory)
    .put(category.updateCategory);

  app
    .route("/product")
    .get(product.readAllProducts)
    .post(product.createProduct);

  app
    .route("/product/:productId")
    .get(product.readProductById)
    .delete(product.deleteProduct)
    .put(product.updateProduct);
};

export default routes;
