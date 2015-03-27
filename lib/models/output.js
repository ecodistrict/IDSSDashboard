var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    OutputSchema = new Schema({
    	status: String,
        moduleId: String,
        kpiId: String,
        variantId: Schema.Types.ObjectId,
        outputs: Schema.Types.Mixed,
        userId: Schema.Types.ObjectId
    });
    
module.exports = mongoose.model('Output', OutputSchema);