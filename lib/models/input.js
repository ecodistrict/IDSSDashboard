var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    InputSchema = new Schema({
        moduleId: String,
        kpiId: String,
        variantId: Schema.Types.ObjectId,
        values: Schema.Types.Mixed,
        userId: Schema.Types.ObjectId
    });
    
module.exports = mongoose.model('Input', InputSchema);