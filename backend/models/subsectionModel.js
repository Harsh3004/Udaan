const mongoose = require('mongoose');

const subsectionSchema = new mongoose.Schema({
    topic: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    file: {
        url : { type: String },
        public_id: {type: String}
    },
    timeDuration: {
        type: String,
    },
})

const subsectionModel = mongoose.model('subsection',subsectionSchema);
module.exports = subsectionModel;