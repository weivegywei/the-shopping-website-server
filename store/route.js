import { User } from "../../server/Register/schema";
import jwt_decode from "jwt-decode";

export const getUserRoute = (app) => app.post('/api/user', async(req, res) => {
    const decoded = jwt_decode(req.body.token);
    const user = await User.findOne({email: decoded.email}).exec(); 
    return res.json(user)
})
