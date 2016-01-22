var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    KpiRecordSchema = new Schema({
        // relations
        userId: {type: Schema.Types.ObjectId, required: true},
        facilitatorId: Schema.Types.ObjectId,
        stakeholderId: Schema.Types.ObjectId,
        processId: Schema.Types.ObjectId,
        variantId: {type: Schema.Types.ObjectId, required: true},
        moduleId: String,  
        kpiAlias: {type: String, required: true},
        value: Number,
        disabled: {type: Boolean, default: false},
        status: {type: String, required: true},
        manual: Boolean,
        weight: {type:Number, default: 0},
        minimum: {type:Number},
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now}  
    });
    
module.exports = mongoose.model('KpiRecord', KpiRecordSchema);