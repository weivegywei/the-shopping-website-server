import { Manufacturer } from '../../manufacturer/schema';

export const fetchManufacturerNameRoute = (app) => app.post(
    '/api/product/manufacturer/name', async(req, res) => {
        const manufacturer = await Manufacturer.find({_id: req.body.manuId});
        return res.json(manufacturer)
    })
