import { User } from "../register/schema";
import jwt_decode from "jwt-decode";

export const getUserRoute = (app) => app.post('/api/user', async(req, res) => {
    try{
        const decoded = jwt_decode(req.body.token);
        const user = await User.findOne({email: decoded.email}).exec();
        return res.json(user)
    }
    catch (error) {
        res.status(400)
        return res.json({error})
    }
})
