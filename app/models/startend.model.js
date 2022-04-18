const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const startendSchema = new Schema(
    {
        point: {type: String, trim: true, unique: true},
    },
    {
        timestamps: true,
    }
)

module.exports = mongoose.model('Startend', startendSchema);