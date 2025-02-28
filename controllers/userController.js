const userModel = require('../models/userModel')
const cloudinary = require('../helper/cloudinary')
const fs = require('fs');
const sendMail = require('../helper/email')
const jwt = require('jsonwebtoken')
const signUp = require('../helper/signup')
const bcrypt = require('bcrypt')
const LOCK = process.env.LOCK

exports.createUser = async (req, res)=>{
    try {
        const {fullName,address, email, password, role, phoneNumber} =req.body

        const uploadImage = await cloudinary.uploader.upload(req.file.path, (err,data)=>{
            if(err){
                res.status(400).json({message:err.message})
            }else{
return data
            }
        })
        const salt =await bcrypt.genSalt(10);
        const hash =await bcrypt.hashSync(password, salt)
          
const userData = {
    fullName: fullName,
    address: address,
    email: email,
    password:hash,
    phoneNumber,
    role,
    userImageUrl: uploadImage.secure_url,
    userImageId: uploadImage.public_id
            }

fs.unlink(req.file.path, (err)=>{
    if(err){
        console.log(err.message)
    }else{
        console.log("file uploaded successfully")
    }
})
          const newUser = await userModel.create(userData);
          const token = await jwt.sign({id:newUser._id}, LOCK, {expiresIn:'10mins'})
            const link = `${req.protocol}://${req.get('host')}/mail/${newUser._id}/${token}`
        

        const subject = "Welcome to this platform" + "  "  + fullName
          sendMail({subject:subject,email:newUser.email, html:signUp(link,newUser.fullName)})
    
           return res.status(201).json({
                message: `User created successfully`,
                data:newUser
            })
            
        
    } catch (error) {

    return res.status(500).json({
        message: error.message
     })   
    }
}

exports.verifyEmail = async (req,res)=>{
    try {
        const {id} = req.params
        const checkUser = await userModel.findById(id)
        if(!checkUser){
            return res.status(404).json({message: "No User Found"}
            )
        }
        if(checkUser.isVerified === true){
            return res.status(400).json({
                message:"Email has already been verified"
            })
        }
      try{  
       await jwt.verify(req.params.token, LOCK)
       
       }catch(error){
            return res.status(404).json({message: "Email Link Has Expired"

            })   
            
    }
        await userModel.findByIdAndUpdate(id, {isVerified:true})
       return res.status(200).json({
            message:"Email Verified Succefully"
        })
    } catch (error) {
        return res.status(500).json({message:error.message})
    }
}


exports.userLogin = async(req, res) => {
    try {
        const { email, password } = req.body;
        const checkEmail = await userModel.findOne({ email });
        if (!checkEmail) {
            return res.status(404).json({
                message: "Email not found"
            });
        }

        const checkPassword = await bcrypt.compareSync(password, checkEmail.password);

        if (!checkPassword) {
            return res.status(404).json({
                message: "Invalid Password"
            });
        }

        if (checkEmail.isVerified === false) {
            return res.status(400).json({
                message: "Email not verified"
            });
        }

        // Prepare newData object to include details of the user
        const newData = {
            fullName: checkEmail.fullName,
            email: checkEmail.email,
            id: checkEmail._id
        };

        const token = await jwt.sign({ id: checkEmail._id }, LOCK, { expiresIn: "24hrs" });

        res.status(200).json({
            message: "Login successful",
            data: newData,  // send the user details in the response
            token
        });

    } catch (error) {
        res.status(500).json({
            message: "Unable to Login: " + error.message
        });
    }
};

exports.changeDP = async (req, res) =>{
    try{
        const {id} = req.params;
        const findUser = await userModel.findById(id);
console.log("uploaded")
        if(!findUser){
            return res.status(404).json({
                message: "User Not Found"
            })
        }

        //This gets the image file from Cloudinary via the file path
const cloudImage = await cloudinary.uploader.upload(req.file.path, (err)=>{
    if(err){
        return res.status(404).json({
            message: err.message
        })
    }
})
        const newPhoto = {
            userImageUrl: cloudImage.secure_url, 
            userImageId: cloudImage.public_id
        }

        const delImage = await cloudinary.uploader.destroy(findUser.userImageId, (err)=>{
            if(err){
                return res.status(404).json({
                    message: err.message
                })
            }
        })

        fs.unlink(req.file.path, (err)=>{
            if(err){
                console.log(err.message)
            }else{
                console.log("Previous File Removed Successfully")
            }
        })

        const updateImage = await schoolModel.findByIdAndUpdate(id, newPhoto, {new: true})
        return res.status(200).json({
            message: "Image Successfully Updated"
        })
    }catch(err){
        res.status(500).json({
            message: "Internal Server Error" + err.message,

        })
    }
}

exports.getallUser = async (req, res) =>{
    try {
        const findallUser = await userModel.find()
        res.status(200).json({
            message: `All Users in Database`,
            data:findallUser
        })
    } catch (error) {
        res.status(500).json({
            message:error.message 
        })
      
    }
}

exports.getOneUser = async (req, res)=>{
    try {
        const {id} = req.params
        const findUser = await userModel.find(id)
        if(!findUser) {
            res.status(404).json({
                message:`User not found`
            })
        }else{
            res.status(200).json({
                message:`User found`,
                data: findUser
            })
        }
    } catch (error) {
        res.status(500).json({
            message:error.message 
        }) 
    }
}





exports.getOneUser = async (req, res) =>{
    try {
        const { id } = req.params
        const findUser = await schoolModel.findById(id)
        if (!findUser) {
            res.status(404).json({
             message: `User not found`   
            })
        }  
        else {
            res.status(200).json({
            message: `User found`,
            data: findUser
            })
        }
        
    } catch (error) {
        res.status(500).json({
            message: error.message 
        })
      
    }
}
