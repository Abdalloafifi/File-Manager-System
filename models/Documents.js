const mongoose = require('mongoose');
const documentSchema = new mongoose.Schema({
    file:[ {
        type: String,
        required: true,
    }],
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Auth',
        required: true,
    },
    data: {
        type: Date,
        default: ()=>new Date(),
    }
},
{ timestamps: true }
);
module.exports = mongoose.model('Document', documentSchema);
