let express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    User = require('../model/users.js');

//build the REST operations at the base for users
//this will be accessible from http://127.0.0.1:3000/users if the default route for / is left unchanged
router.route('/')
    //GET all users
    .get(function(req, res, next) {
        //retrieve all users from Monogo
        User.find({}, function (err, users) {
              if (err) return next(err)
              //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
              res.format({
                //HTML response will render the index.jade file in the views/users folder. We are also setting "users" to be an accessible variable in our jade view
                html: function(){
                    res.render('users/index', {
                          title: 'All Users',
                          users : users
                      });
                },
                //JSON response will show all users in JSON format
                json: function(){
                    res.json(users);
                }
            });
        });
    })
    //POST a new user
    .post(function(req, res, next) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        let name = req.body.name,
            age = req.body.age,
            email = req.body.email
        //call the create function for our database
        User.create({
            name : name,
            age : age,
            email : email
        }, function (err, user) {
              if (err) return next(err)
              //User has been created
              res.format({
                //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                html: function(){
                    res.redirect("/users");
                },
                //JSON response will show the newly created user
                json: function(){
                    res.json(user);
                }
            });
        })
    });

/* GET New User page. */
router.get('/new', function(req, res) {
    res.render('users/new', { title: 'Add New User' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    User.findById(id, function (err, user) {
        if (err) return next(err)
        if (!user) {
          err = new Error('Not Found')
          err.status = 404
          return next(err)
        }
        res.locals.user = user
        next()
    });
});

router.route('/:id')
  .get(function(req, res) {
    res.format({
      html: function(){
        res.render('users/show');
      },
      json: function(){
        res.json(user);
      }
    });
  });

router.route('/:id/edit')
	.get(function(req, res) {
    res.format({
      html: function(){
        res.render('users/edit');
       },
      json: function(){
        res.json(user);
      }
    });
	})
	//PUT to update a user by ID
	.put(function(req, res, next) {
	    // Get our REST or form values. These rely on the "name" attributes
	    let name = req.body.name,
	        age = req.body.age,
	        email = req.body.email,
	        isInviteOnly = req.body.isInviteOnly

      res.locals.user.set({
          name : name,
          age : age,
          email : email
      }).save(function (err) {
        if (err) return next(err)
        res.format({
          html: function(){
            res.redirect('/users/' + res.locals.user._id);
          },
          json: function(){
            res.json(res.locals.user);
          }
        });
      })
	})
	//DELETE a User by ID
	.delete(function (req, res, next){
    res.locals.user.remove(function (err, user) {
      if (err) return next(err)
      res.format({
        //HTML returns us back to the main page, or you can create a success page
          html: function(){
               res.redirect("/users");
         },
        json: function(){
               res.json({message : 'deleted',
                   item : user
               });
         }
      });
    });
	});

module.exports = router;
