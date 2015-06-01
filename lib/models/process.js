var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ProcessSchema = new Schema({
        userId: {type: Schema.Types.ObjectId, required: true},
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now},
        title: String,
        description: String,
        kpiList: [{
            alias: String,
            unit: String,
            description: String, // duplicated from KPI database
            name: String, // duplicated from KPI database,
            qualitative: Boolean,
            qualitativeSettings: [{
                label: String,
                value: String,
                referenceValue: Number
            }],
            selectedModule: {
                id: String,
                name: String,
                description: String,
                inputSpecification: Schema.Types.Mixed
            },
            bad: Number,
            excellent: Number
        }], 
        district: {
            geometry: {}, // contains a geojson structure representing the district
            area: {type: Number, default: 0}
        }
    });
    
module.exports = mongoose.model('Process', ProcessSchema);