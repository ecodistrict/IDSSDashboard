var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    OutputSchema = new Schema({
        moduleId: {type: String, required: true},
        kpiAlias: {type: String, required: true},
        variantId: {type: Schema.Types.ObjectId, required: true},
        outputs: {type: Schema.Types.Mixed, required: true},
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now}  
    });
    
module.exports = mongoose.model('Output', OutputSchema);