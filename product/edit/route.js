import { Manufacturer } from '../../manufacturer/schema';
import { Product } from '../../product/create/schema';

export const editProductRoute = (app) => app.post('/api/admin/product/edit', async(req, res) => {
    const existingManufacturer = await Manufacturer.findOne({name: req.body.manufacturerName}).exec();
    const {_id, name, manufacturerName, inventory, price, specification, specificationDescr, availability, imageUrl, 
        description, packageSize, category} = req.body;
    if (existingManufacturer) {
        const editedProduct = await Product.updateOne(
            { _id },
            { $set: { name, manufacturerId: existingManufacturer._id, inventory, price, imageUrl, availability, 
                specification, specificationDescr, description, packageSize, category} }
        )
        console.log('editedProduct', editedProduct);
        return res.send('Product updated');
    } else {
        res.status(400);
        return res.json({message: 'Manufacturer does not exist', field: 'manufacturerName'});
    }
})