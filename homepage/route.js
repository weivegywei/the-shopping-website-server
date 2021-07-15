import { Product } from "../product/create/schema";

export const homepageProductRoute = (app) => app.get('/api/homepage/maingrid', async(req, res) => {
    const allProducts = await Product.find().exec();
    return res.json(allProducts)
});
