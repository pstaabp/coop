var crypto = require('crypto'),
    Document,
    User,
    LoginToken;


function defineModels(mongoose, fn) {
  var Schema = mongoose.Schema,
      ObjectId = Schema.ObjectId;

 /** Family 
   * 
   **/

  var Family = new Schema({
    name: String,
    parents: String,
    children: String,
    email: String,
    date_joined: Date,
    active: Boolean,
    starting_points: Number,
    current_points: Number
  });

  /** Transaction
    * 
    **/

  var Transaction = new Schema({
      tranaction_date: Date,
      from_family: String,
      to_family: String,
      points: Number
  })

  /**
    * Model: User
    */
  function validatePresenceOf(value) {
    return value && value.length;
  }

  var User = new Schema({
    first_name: String,
    last_name: String,
    role: String,
    email: { type: String, validate: [validatePresenceOf, 'an email is required'], index: { unique: true } },
    hashed_password: String,
    salt: String,
    reset_pass: Boolean,
    temp_pass: String
  });

  User.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  User.virtual('password')
    .set(function(password) {
      this._password = password;
      this.salt = this.makeSalt();
      this.hashed_password = this.encryptPassword(password);
    })
    .get(function() { return this._password; });


  User.method('authenticate', function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password;
  });
  
  User.method('makeSalt', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  User.method('encryptPassword', function(password) {
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  });

  User.pre('save', function(next) {
    if (!validatePresenceOf(this.password)) {
      next(new Error('Invalid password'));
    } else {
      next();
    }
  });

  User.methods.getPublicFields = function () {
    var returnObject = {
        first_name: this.first_name,
        last_name: this.last_name,
        role: this.role,
        email: this.email
    };
    return returnObject;
};

  /**
    * Model: LoginToken
    *
    * Used for session persistence.
    */
  LoginToken = new Schema({
    email: { type: String, index: true },
    series: { type: String, index: true },
    token: { type: String, index: true }
  });

  LoginToken.method('randomToken', function() {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  });

  LoginToken.pre('save', function(next) {
    // Automatically create the tokens
    this.token = this.randomToken();

    if (this.isNew)
      this.series = this.randomToken();

    next();
  });

  LoginToken.virtual('id')
    .get(function() {
      return this._id.toHexString();
    });

  LoginToken.virtual('cookieValue')
    .get(function() {
      return JSON.stringify({ email: this.email, token: this.token, series: this.series });
    });

  mongoose.model('Family', Family);
  mongoose.model('Transaction', Transaction);
  mongoose.model('User', User);
  mongoose.model('LoginToken', LoginToken);
  
  fn();
}

exports.defineModels = defineModels; 

