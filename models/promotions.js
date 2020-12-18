const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose);
const Currency = mongoose.Types.Currency;

const promotionSchema = new Schema({
        name:{
            type: String,
            required:true,
            unique: false
        },
        image:{
            type: String,
            required: true
        },
        label:{
            type: String,
            default: ''
        },
        price:{
            type: Currency,
            required: true,
            min: 0
        },
        description:{
            type: String,
            required: true
        },        
        feature:{
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
);

var Promotion = mongoose.model('Promotion',promotionSchema);

module.exports = Promotion;