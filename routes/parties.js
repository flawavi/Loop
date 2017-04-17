let express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }))
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        let method = req.body._method
        delete req.body._method
        return method
      }
}))

//build the REST operations at the base for parties
//this will be accessible from http://127.0.0.1:3000/parties if the default route for / is left unchanged
router.route('/')
    //GET all parties
    .get(function(req, res, next) {
        //retrieve all parties from Monogo
        mongoose.model('Party').find({}, function (err, parties) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/parties folder. We are also setting "parties" to be an accessible variable in our jade view
                    html: function(){
                        res.render('parties/index', {
                              title: 'All my Parties',
                              "parties" : parties
                          });
                    },
                    //JSON response will show all parties in JSON format
                    json: function(){
                        res.json(parties);
                    }
                });
              }
        });
    })
    //POST a new party
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        let name = req.body.name,
            date = req.body.date,
            isInviteOnly = req.body.isInviteOnly
        //call the create function for our database
        mongoose.model('Party').create({
            name : name,
            date : date,
            isInviteOnly : isInviteOnly
        }, function (err, party) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Party has been created
                  console.log('POST creating new party: ' + party);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("parties");
                        // And forward to success page
                        res.redirect("/parties");
                    },
                    //JSON response will show the newly created party
                    json: function(){
                        res.json(party);
                    }
                });
              }
        })
    });

/* GET New Party page. */
router.get('/new', function(req, res) {
    res.render('parties/new', { title: 'Add New Party' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Party').findById(id, function (err, party) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404)
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(party);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Party').findById(req.id, function (err, party) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + party._id);
        let partyDate = party.date.toISOString();
        partyDate = partyDate.substring(0, partyDate.indexOf('T'))
        res.format({
          html: function(){
              res.render('parties/show', {
                "partyDate" : partyDate,
                "party" : party
              });
          },
          json: function(){
              res.json(party);
          }
        });
      }
    });
  });

router.route('/:id/edit')
	//GET the individual party by Mongo ID
	.get(function(req, res) {
	    //search for the party within Mongo
	    mongoose.model('Party').findById(req.id, function (err, party) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            //Return the party
	            console.log('GET Retrieving ID: ' + party._id);
              var partyDate = party.date.toISOString();
              //what's going on here
              partyDate = partyDate.substring(0, partyDate.indexOf('T'))
	            res.format({
	                //HTML response will render the 'edit.jade' template
	                html: function(){
	                       res.render('parties/edit', {
	                          title: 'Party' + party._id,
                            "partyDate" : partyDate,
	                          "party" : party
	                      });
	                 },
	                 //JSON response will return the JSON output
	                json: function(){
	                       res.json(party);
	                 }
	            });
	        }
	    });
	})
	//PUT to update a party by ID
	.put(function(req, res) {
	    // Get our REST or form values. These rely on the "name" attributes
	    let name = req.body.name,
	        date = req.body.date,
	        isInviteOnly = req.body.isInviteOnly

	    //find the document by ID
	    mongoose.model('Party').findById(req.id, function (err, party) {
	        //update it
	        party.update({
	            name : name,
	            date : date,
	            isInviteOnly : isInviteOnly
	        }, function (err, partyID) {
	          if (err) {
	              res.send("There was a problem updating the information to the database: " + err);
	          }
	          else {
	                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	                  res.format({
	                      html: function(){
	                           res.redirect("/parties/" + party._id);
	                     },
	                     //JSON responds showing the updated values
	                    json: function(){
	                           res.json(party);
	                     }
	                  });
	           }
	        })
	    });
	})
	//DELETE a Party by ID
	.delete(function (req, res){
	    //find party by ID
	    mongoose.model('Party').findById(req.id, function (err, party) {
	        if (err) {
	            return console.error(err);
	        } else {
	            //remove it from Mongo
	            party.remove(function (err, party) {
	                if (err) {
	                    return console.error(err);
	                } else {
	                    //Returning success messages saying it was deleted
	                    console.log('DELETE removing ID: ' + party._id);
	                    res.format({
	                        //HTML returns us back to the main page, or you can create a success page
	                          html: function(){
	                               res.redirect("/parties");
	                         },
	                         //JSON returns the item with the message that is has been deleted
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : party
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});

module.exports = router;
