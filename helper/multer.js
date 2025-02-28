const multer = require('multer');

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
cb(null, "./upload")
    },
    filename:(req,file,cb)=>{
cb(null, file.originalname)
    }
});

const filefilter = (req,file,cb)=>{
    const allowtype = ["image/jpg","image/jpeg","image/jsvg","image/png","image/svg","image/gif"]
    if(allowtype.includes(file.mimetypes)){
cb(null,true)
    }else{
        cb(new Error("Only image allowed"))
    }
};

const limits = {filesize:1024*1024}

const upload = multer({filefilter,limits,storage});
module.exports = upload
