import { Product } from "../create/schema";

export const listProductRoute = (app) => app.get('/api/admin/product/list', async(req, res) => {
    const allProductsWithManufacturerNames = await Product.aggregate([
        {
            $lookup: {
                from: 'manufacturers',
                localField: 'manufacturerId',
                foreignField: '_id',
                as: 'manufacturerInfo'
            }
        }
    ]).exec();
    return res.json(allProductsWithManufacturerNames);
});

export const deleteProductRoute = (app) => app.post('/api/admin/product/delete', async(req, res) =>{
    await Product.findOneAndDelete({_id: req.body.productId}).exec();
    return res.send('product deleted')
})

