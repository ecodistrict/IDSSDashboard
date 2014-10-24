var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    KpiSchema = new Schema({
        userId: Schema.Types.ObjectId,
        official: Boolean,
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now},
        minValue: Number,
        maxValue: Number,
        unit: String,
        asIsValue: Number,
        toBeValue: Number,
        name: String,
        alias: {type: String, unique: true},
        description: String
    });
    
module.exports = mongoose.model('Kpi', KpiSchema);