const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const Schema = mongoose.Schema;

const newSchema = new Schema(
    {
    title: {type: String, trim: true},
    content: {type: String, trim: true},
    category: {type: String, trim: true},
    slug: { type: String, slug: 'title', unique: true },
    },
    {
        timestamps: true,
    }
)

// Add plugins
mongoose.plugin(slug);
newSchema.plugin(mongooseDelete, {
    deletedAt: true,
    overrideMethods: 'all',
});

module.exports = mongoose.model('New', newSchema);