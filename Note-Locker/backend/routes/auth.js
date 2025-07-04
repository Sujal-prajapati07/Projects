const express=require('express');
const User=require('../models/User');
const router=express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt=require("bcryptjs");
var jwt = require('jsonwebtoken');
var fetchUser = require('../middleware/fetchUser');

const jwt_secret="Hello sujal";

//Rout 1: create a user using:POST....No login required
router.post('/createuser',
    [
    body('name','Enter a valid name').isLength({ min: 3 }),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be atleast 5 character').isLength({ min: 5 }),
    ],async(req,res)=>{
        let success=false;
    //if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    //check whether the user with this email exists already
    try{
        let user=await User.findOne({email:req.body.email});
        if(user)
        {
            return res.status(400).json({success,error:'Sorry a user with this email already exists'});
        }
    const salt=await bcrypt.genSalt(10);
    const secPass=await bcrypt.hash(req.body.password,salt) 
    //create a new user
    user = await User.create({
    name: req.body.name,
    password: secPass,
    email: req.body.email,
    });

    const data={
        user:{
            id:user.id
        }
    }
    const authToken=jwt.sign(data,jwt_secret);
    // res.json(user)
    success=true;
    res.json({success,authToken})
    }
    //catch any errors
    catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});

//Rout 2:Authentication a user using:POST....No login required
router.post('/login',
    [
    body('email','Enter a valid email').isEmail(),
    body('password','Passowrd cannot be blank').exists(),
    ],async(req,res)=>{
    let success=false;
         //if there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {email,password}=req.body;

    try{
        let user=await User.findOne({email});
        if(!user)
        {
            success=false;
            return res.status(400).json({error:"Please try to login with correct credentials"});
        }

        const passwordCompare=await bcrypt.compare(password,user.password);
        if(!passwordCompare)
        {
            success=false;
            return res.status(400).json({success,error:"Please try to login with correct credentials"});
        }

       const data={
        user:{
            id:user.id
        }
        }
        const authToken=jwt.sign(data,jwt_secret);
        success=true;
        res.json({success,authToken})
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
    })

    //Rout 3:get loggin user details  using:POST....login required
    router.post('/getuser',fetchUser, async (req,res)=>{
    try{
        const user=await User.findById(req.user.id).select("-password");
        res.send(user);
    }catch(error){
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
});
module.exports=router;