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
        selectedModule: Schema.Types.Mixed,
        alias: {type: String, unique: true},
        description: String,
        inputs: Schema.Types.Mixed,
        outputs: Schema.Types.Mixed
    });
    
module.exports = mongoose.model('Kpi', KpiSchema);