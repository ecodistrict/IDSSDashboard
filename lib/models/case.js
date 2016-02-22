var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    GeoJSON = require('mongoose-geojson-schema'),
    CaseSchema = new Schema({
        userId: {type: Schema.Types.ObjectId, required: true},
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now},
        title: String,
        description: String,
        districtPolygon: GeoJSON.Feature,
        // kpiId as key: value (this is values for AS-IS situation)
        // variant has their own map
        kpiValues: {
            type: Schema.Types.Mixed,
            default: {}
        },
        kpiDisabled: {
            type: Schema.Types.Mixed,
            default: {}
        },
        kpiList: [{
            kpiAlias: String,
            unit: String,
            confirmed: Boolean, // if the database is setup (response from data module)
            description: String, // duplicated from KPI database
            name: String, // duplicated from KPI database,
            qualitative: Boolean,
            qualitativeSettings: [{
                label: String,
                value: String,
                referenceValue: Number
            }],
            selectedModuleId: String,
            //inputSpecification: Schema.Types.Mixed,
            sufficient: Number,
            excellent: Number,
            descriptionSufficient: String,
            descriptionExcellent: String
        }]
    });
    
module.exports = mongoose.model('Case', CaseSchema);