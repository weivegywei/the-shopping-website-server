const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../register/schema');

const accessTokenSecret = 'togetherwefightpoverty';

export const loginAuthenticationRoute = (app) => app.post('/api/login', async (req, res) => {
    // Read email and hashed password from request body
    const { email, password } = req.body;

    const hashedPassword = crypto.createHash('md5').update(password).digest('hex');

    // Filter user from the users collection by email and hashed password
    const user = await User.findOne({ email, password: hashedPassword }).exec();

    if (user) {
        // Generate an access token
        const accessToken = jwt.sign({ email: user.email,  role: user.role }, accessTokenSecret);

        res.json({
            accessToken
        });
    } else {
        res.status(400);
        res.send('email or password incorrect');
    }
});
