import { Product } from "../product/create/schema";

export const homepageProductSearchRoute = (app) => app.post('/api/homepage/search', async(req, res) => {
    const searchKey = new RegExp(`${req.body.query}`, 'i')
    const searchSuggestions = await Product.find({name: searchKey}).limit(5).exec();
    return res.json(searchSuggestions)
});
