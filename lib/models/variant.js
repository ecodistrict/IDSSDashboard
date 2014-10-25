var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    VariantSchema = new Schema({
        type: String, // as-is, to-be, variant
        name: String,
        userId: Schema.Types.ObjectId,
        processId: Schema.Types.ObjectId,
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now},
        description: String,
        kpiList: Schema.Types.Mixed, // Kpi list needs to be in variant to enable multi-stakeholder capabilities
        outputData: [{
            moduleId: String,
            outputs: Schema.Types.Mixed // save the output from modules in suitable chunks for the client
        }]
        inputData: [
            moduleId: String,
            inputs: Schema.Types.Mixed // save the input from modules in original state
        ]
    });
    
module.exports = mongoose.model('Variant', VariantSchema);