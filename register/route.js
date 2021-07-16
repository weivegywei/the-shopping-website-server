const crypto = require('crypto');
const {User} = require('./schema');

const saveNewUser = (firstName, lastName, email, password, address, country, role) => {
    const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        address,
        country,
        role
    });
    return newUser.save()
}

export const registerRoute = (app) => app.post('/api/register', async(req, res) => {
    try {
    const hashedPassword = crypto.createHash('md5').update(req.body.password).digest('hex');
    const UserObject = await saveNewUser(req.body.firstName, req.body.lastName, req.body.email, hashedPassword, 
        req.body.address, req.body.country, req.body.role);
    return res.json(UserObject)
    }
    catch(error) {
        res.status(400);
        if (error.keyPattern.hasOwnProperty) {
            return res.send('USER_EXISTS')
        } 
        return res.json({error})
    }
})
