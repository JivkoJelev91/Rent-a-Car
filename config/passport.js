const passport = require('passport');
const LocalPassport = require('passport-local').Strategy;
const User = require('mongoose').model('User');



passport.serializeUser((user, done) => {
    if (user) return done(null, user._id);
});

passport.deserializeUser((id, done) => {
    User.findById(id).then(user => {
        if (!user) return done(null, false);
        return done(null, user);        
    });
});

passport.use(new LocalPassport((username, password, done) => {
    User.findOne({ username: username }).then(user => {
        if (!user) return done(null, false);
        if (!user.authenticate(password)) return done(null, false);
        return done(null, user);
    });
}));

module.exports = passport;
