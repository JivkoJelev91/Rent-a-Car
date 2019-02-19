const controllers = require('../controllers');
const auth = require('./auth');

module.exports = app => {
    app.get('/', controllers.home.index);
    app.get('/about', auth.hasRole('Admin'), controllers.home.about);

    // users routes
    app.get('/register', controllers.user.registerGet);
    app.post('/register', controllers.user.registerPost);
    app.post('/logout', controllers.user.logout);
    app.get('/login', controllers.user.loginGet);
    app.post('/login', controllers.user.loginPost);
    app.get('/users/me', controllers.user.profile);

    // cars route
    app.get('/cars/add', auth.hasRole('Admin'), controllers.cars.addGet );
    app.post('/cars/add', auth.hasRole('Admin'), controllers.cars.addPost );
    app.get('/cars/all', controllers.cars.all);
    app.post('/cars/rent/:id', auth.isAuthed ,controllers.cars.rent);
    app.post('/cars/all/:id', auth.hasRole('Admin'), controllers.cars.delete);

    app.all('*', (req, res) => {
        res.status(404);
        res.send('404 Not Found');
        res.end();
    });
};