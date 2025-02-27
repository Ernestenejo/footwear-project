const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const DATABASE_URL = process.env.DATABASE_URL;
const cors = require('cors')
const PORT = 4040

const userRoutes = require('./route/userroute');
const productRoutes = require('./route/productroute');
const orderRoutes = require('./route/orderroute');

const app = express();
app.use(express.json())
app.use(cors())

app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', orderRoutes);



mongoose.connect(DATABASE_URL).then(()=>{
    console.log(`database connected successfully`)
    
app.listen(PORT, ()=>{
    console.log(`server is listening to PORT: ${PORT}`)
    })
}).catch((err)=>{
    console.log(`unable to connect to database`+err)
})


 