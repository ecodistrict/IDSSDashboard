var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    SALT_WORK_FACTOR = 10,
    UserSchema = new Schema({
        dateCreated: {type: Date, default: Date.now},
        dateModified: {type: Date, default: Date.now},
        fname: String,
        lname: String,
        email: { 
            type: String, 
            required: true, 
            index: { unique: true } 
        },
        password: String,
        activeProcessId: Schema.Types.ObjectId,
        role: String,
        facilitatorId: Schema.Types.ObjectId,
        active: Boolean
    });
    
if(process.platform !== 'win32') {


    bcrypt = require('bcrypt'),

    // http://devsmash.com/blog/password-authentication-with-mongoose-and-bcrypt
    UserSchema.pre('save', function(next) {
        var user = this;

        // only hash the password if it has been modified (or is new)
        if (!user.isModified('password')) return next();

        // generate a salt
        bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
            if (err) return next(err);

            // hash the password along with our new salt
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) return next(err);

                // override the cleartext password with the hashed one
                user.password = hash;
                next();
            });
        });
    });

    UserSchema.methods.comparePassword = function(candidatePassword, cb) {
        bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
            if (err) return cb(err);
            cb(null, isMatch);
        });
    };

} else {

    UserSchema.methods.comparePassword = function(candidatePassword, cb) {
        var isMatch = candidatePassword === this.password ? true : false;
        cb(null, isMatch);
    };

}

module.exports = mongoose.model('User', UserSchema);