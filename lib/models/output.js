var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    OutputSchema = new Schema({
        moduleId: String,
        kpiId: String,
        variantId: Schema.Types.ObjectId,
        outputs: Schema.Types.Mixed,
        userId: Schema.Types.ObjectId,
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now}  
    });
    
module.exports = mongoose.model('Output', OutputSchema);