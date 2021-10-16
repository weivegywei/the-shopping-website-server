const crypto = require('crypto');
const { User } = require('./schema');


const saveNewUser = (firstName, lastName, email, password, address, country, role, type) => {
    const newUser = new User({
        firstName,
        lastName,
        email,
        password,
        address,
        country,
        role,
        type
    });
    return newUser.save()
}

export const registerRoute = (app) => app.post('/api/register', async(req, res) => {
    try {
    const { firstName, lastName, email, address, password, country, role, type } = req.body;
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    const UserObject = await saveNewUser( firstName, lastName, email, hashedPassword, address, 
        country, role, type );
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

export const registerGuestRoute = (app) => app.post('/api/guestregister', async(req, res) => {
    try {
        const { _id, firstName, lastName, email, address, country, role, type } = req.body;
        const newUser = new User({
            _id,
            firstName,
            lastName,
            email,
            password: null,
            address,
            country,
            role,
            type
        });
        console.log('newus', newUser);
        newUser.save()
        return res.json(newUser)
    }
    catch(error) {
        console.log('guest register error', error);
        res.status(400);
        return res.json({error})
    }
})

