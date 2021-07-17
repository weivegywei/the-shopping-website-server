import { Cart } from '../../cart/schema';
import { Manufacturer } from '../../manufacturer/schema';
const { Product } = require('./schema');
const mongoose = require('mongoose');

const saveNewProduct = ({name, manufacturerId, price, imageUrl, availability, inventory, 
    specification, specificationDescr, description, packageSize, category})  => {
        const newProduct = new Product({
            name, 
            manufacturerId,
            price, 
            imageUrl, 
            availability,
            inventory,
            specification, 
            specificationDescr,
            rating: {1:[], 2:[], 3:[], 4:[], 5:[]},
            description, 
            packageSize,
            category
        });
        return newProduct.save()
    };

export const createProductRoute = (app) => app.post('/api/admin/product/create', async(req, res) => {
    const abc = await Manufacturer.find().exec();
    const existingManufacturer = await Manufacturer.findOne({name: req.body.manufacturerName}).exec();
    if (existingManufacturer) {
        const {name, price, imageUrl, availability, inventory, 
            specification, specificationDescr, description, packageSize, category} = req.body;
        const productObject = await saveNewProduct({name, price, imageUrl, availability, inventory, 
            specification, specificationDescr, description, packageSize, category, 
            manufacturerId: existingManufacturer._id});
        return res.send(productObject);
    } else {
        res.status(400);
        return res.json({message: 'Manufacturer does not exist', field: 'manufacturerName'});
    }
});

export const adjustProductInventory = (app) => app.post('/api/admin/product/inventory', async(req, res) => {
    const userCart = await Cart.findOne({userId: req.body.userId, status: 'active'});
    const cartItemsIds = userCart.cartItems.map(item => mongoose.Types.ObjectId(item.productId));
    const products = await Product.find( { '_id': { $in: cartItemsIds } } );
    products.map((item) => {
        userCart.cartItems.find(it => String(it.productId) == String(item._id));
        item.inventory -= userCart.cartItems.find(it => String(it.productId) == String(item._id)).quantity;
    });
    const bulkUpdateOps = products.map(item => 
        ({
            "updateOne": {
                "filter": { '_id' : item._id},
                "update": { "$set": { "inventory": item.inventory } }
            }
        }))
    const updatedProducts = await Product.bulkWrite(bulkUpdateOps)
    return res.json(updatedProducts);
});
