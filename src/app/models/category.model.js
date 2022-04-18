const mongoose = require('mongoose');
const { carCreate } = require('../controllers/dashboard.controller');
const Schema =  mongoose.Schema;

const categorySchema = new Schema(
    {
        titlecategory: {type: String, required: true, trim: true},
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Category', categorySchema);

