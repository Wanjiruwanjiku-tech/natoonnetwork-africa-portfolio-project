if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

// Set up our basic express app and get the app var from express
const express = require('express');
const app = express();
const bycrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');


const InitializePassport = require('./passport-config');
InitializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const users =[];

// Tell server we are using ejs syntax
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

// set up a route and render a file
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs', { name: req.user.name });
});

// Handle home view
app.get('/home', (req, res) => {
    res.render('home.ejs')
})

// Handle the register view
app.get('/register', (req, res) => {
    res.render('register.ejs');
});

app.post('/register', async (req, res) => {
    try {
        const hashPasswd = await bycrypt.hash(req.body.password, 10);
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashPasswd
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
    console.log(users);
});
// Handle the login view
app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}));

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// Have an application running on port 3000
app.listen(3000);