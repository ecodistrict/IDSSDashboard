var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    VariantSchema = new Schema({
        type: String, // could be removed?
        name: String,
        userId: Schema.Types.ObjectId,
        processId: Schema.Types.ObjectId,
        caseId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        // kpiId as key: value
        // As is values is in case
        kpiValues: {
            type: Schema.Types.Mixed,
            default: {}
        },
        kpiDisabled: {
            type: Schema.Types.Mixed,
            default: {}
        },
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now},
        description: String
    });
    
module.exports = mongoose.model('Variant', VariantSchema);