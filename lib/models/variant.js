var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    VariantSchema = new Schema({
        type: String, // as-is, to-be, variant
        name: String,
        userId: Schema.Types.ObjectId,
        processId: Schema.Types.ObjectId,
        caseId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now},
        description: String
    });
    
module.exports = mongoose.model('Variant', VariantSchema);