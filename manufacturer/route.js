const { Manufacturer } = require('./schema');

const saveNewManufacturer = (manufacturerName, logoUrl)  => {
        const newManufacturer = new Manufacturer({
            name: manufacturerName,
            logoUrl
        });
        return newManufacturer.save()
    };

export const createManufacturerRoute = (app) => app.post('/api/admin/manufacturer/create', async(req, res) => {
    try {
    const manufacturerObject = await saveNewManufacturer(req.body.manufacturerName, req.body.logoUrl);
    return res.send(manufacturerObject);
    }
    catch(error) {
        res.status(400)
        return res.json({error})
    }
});
