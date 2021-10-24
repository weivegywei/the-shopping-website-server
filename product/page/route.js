import { Manufacturer } from '../../manufacturer/schema';
import { Product } from '../create/schema'

/* export const fetchManufacturerNameRoute = (app) => app.post(
    '/api/product/manufacturer/name', async(req, res) => {
        const manufacturer = await Manufacturer.find({_id: req.body.manufacturerId});
        return res.json(manufacturer)
    }) */

export const fetchProductInfoRoute = (app) => app.post('/api/product/info', async(req, res) => {
    const productInfo = [];
    const product = await Product.find({_id: req.body.productId});
    productInfo.push(product[0]);
    const manufacturer = await Manufacturer.find({_id: product[0].manufacturerId});
    productInfo.push(manufacturer[0]);
    //console.log(product, 'product');
    return res.json(productInfo)
})
