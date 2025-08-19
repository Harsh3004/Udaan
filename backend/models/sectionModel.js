const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    subsection: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subsection'
    }]
})

const sectionModel = mongoose.model('section',sectionSchema);
module.exports = sectionModel;