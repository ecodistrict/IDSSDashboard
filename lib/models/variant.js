var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    VariantSchema = new Schema({
        type: String, // as-is, to-be, variant
        name: String,
        connectedVariantId: Schema.Types.ObjectId,  
        userId: Schema.Types.ObjectId,
        processId: Schema.Types.ObjectId,
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now},
        description: String,
        kpiList: [Schema.Types.Mixed] // Kpi list needs to be in variant to enable multi-stakeholder capabilities
    });
    
module.exports = mongoose.model('Variant', VariantSchema);