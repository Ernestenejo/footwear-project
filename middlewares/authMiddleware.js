const jwt = require('jsonwebtoken');
module.exports = (req, res, next) => {
    try {
      const header = req.header("Authorization"); 
      
      if (!header) return res.status(401).json({ message: "Access Denied" });
  

      const token = header.split(" ")[1];
      if (!token) return res.status(401).json({ message: "Access Denied" });
 
  
      const verified = jwt.verify(token, process.env.JWT_SECRET);
     

      req.user = verified;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid Token" });
    }
  };
  