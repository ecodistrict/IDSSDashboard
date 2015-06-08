var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    KpiRecordSchema = new Schema({
        // relations
        userId: {type: Schema.Types.ObjectId, required: true},
        facilitatorId: Schema.Types.ObjectId,
        stakeholderId: Schema.Types.ObjectId,
        stakeholderName: String,
        processId: Schema.Types.ObjectId,
        variantId: {type: Schema.Types.ObjectId, required: true},
        moduleId: String,  
        kpiAlias: {type: String, required: true},
        inputs: Schema.Types.Mixed, // for now a copy of inputSpecification but with value property on the inputs
        value: Number,
        disabled: Boolean,
        status: {type: String, required: true},
        manual: Boolean,
        weight: Number,
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now}  
    });
    
module.exports = mongoose.model('KpiRecord', KpiRecordSchema);