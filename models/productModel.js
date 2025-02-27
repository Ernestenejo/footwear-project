const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String,
         required: true, 
         trim: true 
        },
    description: { type: String, 
        trim: true
     },
    price: { 
        type: Number,
         required: 
         true 
        },
    stock: { 
        type: Number, 
        required: true,
         default: 0
         },
    category: {
        type: String,
        enum: {
            values: ["men footwear","female footwear"],
        }
         },
    imageUrl: { 
        type: String,
         trim: true
         },
    dateAdded: { 
        type: Date, 
        default: Date.now
     }
});

module.exports = mongoose.model('Product', productSchema);
