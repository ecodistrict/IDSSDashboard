var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ProcessSchema = new Schema({
        userId: {type: Schema.Types.ObjectId, required: true},
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now},
        title: String,
        description: String,
        requiredContextVariables: [],
        district: {
            geometry: {}, // contains a geojson structure representing the district
            area: {type: Number, default: 0}
        },
        contextList: [],
        logs: []
    });
    
module.exports = mongoose.model('Process', ProcessSchema);