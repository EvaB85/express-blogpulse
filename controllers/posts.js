var express = require('express');
var db = require('../models');
var router = express.Router();

// POST /posts - create a new post
router.post('/', function(req, res) {
  // First, create a new post
  db.post.create({
    title: req.body.title,
    content: req.body.content,
    authorId: req.body.authorId
  }).then(function(post) {
    // Then, create/find a new tag...
    db.tag.findOrCreate({
      where: {name: req.body.tagName}
    }).spread(function(tag, created) {
      // Add that tag to the post from above...
      post.addTag(tag).then(function(tag) {
        console.log(tag + 'added to ' + post);
        res.redirect('/');
      });
    });
  })
  .catch(function(error) {
    res.status(400).render('main/404');
  });
});

// GET /posts/new - display form for creating new posts
router.get('/new', function(req, res) {
  db.author.findAll()
  .then(function(authors) {
    res.render('posts/new', { authors: authors });
  })
  .catch(function(error) {
    res.status(400).render('main/404');
  });
});

// GET /posts/:id - display a specific post and its author
router.get('/:id', function(req, res) {
  db.post.find({
    where: { id: req.params.id },
    include: [db.author, db.comment, db.tag]
  })
  .then(function(post) {
    if (!post) throw Error();
    console.log(post);
    res.render('posts/show', { post: post });
  })
  .catch(function(error) {
    res.status(400).render('main/404');
  });
});

// POST /posts/:id/comments - adds a new comment onto a posts
// **
router.post('/:id/comments', function(req, res){
  db.comment.create({
    name: req.body.name,
    content: req.body.content,
    postId: req.params.id
  }).then(function(comment) {
    res.redirect('/posts/' + req.params.id);
  });
});
//**


module.exports = router;
