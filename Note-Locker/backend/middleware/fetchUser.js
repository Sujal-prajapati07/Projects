const jwt = require('jsonwebtoken');
const jwt_secret="Hello sujal";
const fetchuser=(req,res,next)=>{
    const token=req.header('auth-token');

    if(!token)
    {
        res.status(401).send({error:"Please authenticate using a valid token"});
    }

    try 
    {
    const data=jwt.verify(token,jwt_secret);
    req.user=data.user;
    next();
    } catch (error) {
       res.status(401).send({error:"Please authenticate using a valid token"});
    }
}
module.exports=fetchuser;