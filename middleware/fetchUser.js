const jwt = require('jsonwebtoken');
const JWT_SECRET = 'Harry is a good b$oy';

const fetchUser = (req, res, next) =>{
    //get the user from jwt token and add id to req object
    const token = req.header('auth-token')
    if(!token){
        res.status(401).send({error: "Please authenticate using a valid token"});
    }
    else{
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({error: "Please authenticate using a valid token"});
    }
}
}

module.exports = fetchUser;