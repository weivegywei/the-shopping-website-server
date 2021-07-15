import { Manufacturer } from '../../manufacturer/schema';
import { Product } from '../create/schema';

export const getFiltersRoute = (app) => app.get('/api/product/filter', async(req, res) => {
    const allManufacturer = await Manufacturer.find().exec();
    const maxPriceArr = await Product.find().sort({price: -1}).limit(1);
    const minPriceArr = await Product.find().sort({price: 1}).limit(1);
    const maxPrice = maxPriceArr[0].price;
    const minPrice = minPriceArr[0].price;
    return res.json({allManufacturer, maxPrice, minPrice})
})

export const listFilteredProductRoute = (app) => app.post('/api/product/filter/result', async(req, res) => {
    const manufacturerFilters = req.body.manufacturerFilters;
    const categoryFilters = req.body.categoryFilters;
    const priceFilterMin = req.body.priceFilterMin;
    const priceFilterMax = req.body.priceFilterMax;
    const filteredManufacturers = await Manufacturer.find({
        'name': { $in: manufacturerFilters }
    })
    const listOfManufecturerIds = filteredManufacturers.map(item => item._id)
    const filteredProduct = await Product.find({ $and: [
         {'manufacturerId': listOfManufecturerIds.length ? { $in: listOfManufecturerIds } : {$nin: []}},
         {'category': categoryFilters.length ? { $in: categoryFilters } : {$nin: []}},
         {'price': priceFilterMin !== 0 ? { $gte: priceFilterMin } : {$nin: []}},
         {'price': priceFilterMax !== 0 ? { $lte: priceFilterMax } : {$nin: []}}
    ]});
    if (filteredProduct.length == 0) {
        const allProduct = await Product.find().exec()
        return res.json(allProduct)
    } else {return res.json(filteredProduct)}
});


