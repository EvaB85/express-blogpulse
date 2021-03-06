var express = require('express');
var bodyParser = require('body-parser');
var ejsLayouts = require('express-ejs-layouts');
var db = require('./models');
var moment = require('moment');
var rowdy = require('rowdy-logger');
var app = express();

rowdy.begin(app);

app.set('view engine', 'ejs');

app.use(require('morgan')('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(ejsLayouts);
app.use(express.static(__dirname + '/public/'));

// middleware that allows us to access the 'moment' library in every EJS view
app.use(function(req, res, next) {
  res.locals.moment = moment;
  next();
});

// middleware to log time, url and message to console
var logger = function(req, res, next) {
  req.log = function(message) {
    console.log(new Date(), req.url, message);
  }
  next();
}
app.use(logger);

// GET / - display all posts and their authors
app.get('/', function(req, res) {
  req.log('YAY! WE DID IT!');
  db.post.findAll({
    include: [db.author]
  }).then(function(posts) {
    res.render('main/index', { posts: posts });
  }).catch(function(error) {
    res.status(400).render('main/404');
  });
});

// bring in authors and posts controllers
app.use('/authors', require('./controllers/authors'));
app.use('/posts', require('./controllers/posts'));
// if you added a comments under controllers
app.use('/comments', require('./controllers/comments'));
app.use('/tags', require('./controllers/tags'));


var server = app.listen(process.env.PORT || 3001, function() {
  rowdy.print();
});

module.exports = server;
