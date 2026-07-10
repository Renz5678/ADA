import { models, sequelize } from "./server/src/models/index.js";
async function test() {
  const products = await models.Product.findAll({ attributes: ['product_id', 'product_name', 'image_url'] });
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}
test();
