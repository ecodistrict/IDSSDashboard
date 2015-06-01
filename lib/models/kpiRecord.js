var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    KpiRecordSchema = new Schema({
        // relations
        userId: Schema.Types.ObjectId,
        facilitatorId: Schema.Types.ObjectId,
        stakeholderId: Schema.Types.ObjectId,
        stakeholderName: String,
        processId: Schema.Types.ObjectId,
        variantId: Schema.Types.ObjectId,
        moduleId: Schema.Types.ObjectId,  
        alias: String,
        inputSpecification: Schema.Types.Mixed,
        value: Number,
        disabled: Boolean,
        status: String,
        manual: Boolean,
        weight: Number,
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now}  
    });
    
module.exports = mongoose.model('KpiRecord', KpiRecordSchema);