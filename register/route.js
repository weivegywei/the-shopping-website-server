const crypto = require('crypto');
const { User } = require('./schema');

const saveNewUser = (_id, firstName, lastName, email, password, address, country, role, type, status) => {
    const newUser = new User({
        _id, 
        firstName,
        lastName,
        email,
        password,
        address,
        country,
        role,
        type, 
        status
    });
    return newUser.save()
}

export const registerRoute = (app) => app.post('/api/register', async(req, res) => {
    try {
    const { _id, firstName, lastName, email, address, password, country, role, type, status } = req.body;
    const existingGuestMatch = await User.find({email, role: 'customer', type: 'guest'});
    if (existingGuestMatch) {
        console.log(existingGuestMatch, 'matched guest user');
        const updateGuestStatus = await User.updateOne(
            {email, role: 'customer', type: 'guest'},
            { $set: { 'status': 'inactive' } }
        )
        console.log(updateGuestStatus, 'updateGuestStatus')
    }
    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
    const UserObject = await saveNewUser( _id, firstName, lastName, email, hashedPassword, address, 
        country, role, type, status );
    return res.json(UserObject)
    }
    catch(error) {
        console.log(error, 'error in register')
        res.status(400);
        if (error.keyPattern.hasOwnProperty) {
            return res.send('USER_EXISTS')
        } 
        return res.json({error})
    }
})

export const registerGuestRoute = (app) => app.post('/api/guestregister', async(req, res) => {
    try {
        const { _id, firstName, lastName, email, address, country, role, type, status } = req.body;
        const existingMatch = await User.find({_id: req.body._id})
        if (existingMatch.length) {
            console.log(existingMatch, 'existingMatch')
            const updatedGuest = await User.updateOne(
                {_id: req.body._id},
                { $set: { 'firstName': firstName, 'lastName': lastName, 'email': email, 'address': address, 'country': country } }
            )
            return res.json(updatedGuest)
        } else {
            const newUser = new User({
                _id,
                firstName,
                lastName,
                email,
                password: null,
                address,
                country,
                role,
                type, 
                status
            });
            console.log('newuser', newUser);
            newUser.save()
            return res.json(newUser)
        }
    }
    catch(error) {
        console.log('guest register error', error);
        res.status(400);
        return res.json({error})
    }
})

export const checkGuestRoute = (app) => app.post('/api/checkguest', async(req, res) => {
    try {
        const existingMatch = await User.find({_id: req.body._id})
        return res.json(existingMatch)
    }
    catch(error) {
        console.log('error in checking guest', error);
        res.status(400);
        return res.json({error})
    }
})

export const checkUserRoute = (app) => app.post('/api/checkuser', async(req, res) => {
    try {
        const existingMatch = await User.find({email: req.body.email, type: 'regular'})
        if (existingMatch.length) {
            return res.send('This email has been registered.')
        } else {
            console.log('no such user')
            return res.send('no match.')
        }
    }
    catch (error) {
        console.log('error in checking user', error);
        res.status(400);
        return res.json({error})
    }
})
