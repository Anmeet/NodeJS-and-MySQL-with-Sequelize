const express = require('express');
const router = express.Router();
const db = require('../config/database');
const Gig = require('../models/Gig');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

//Get gig list
router.get('/', (req, res) =>
  Gig.findAll()
    .then(gigs => {
   
      const context = {
        contextGigs: gigs.map(gig =>{
            return{
                title: gig.title,
                technologies: gig.technologies,
                budget: gig.budget,
                description: gig.description,
                contact_email: gig.contact_email
            }
        })
    }
      res.render('gigs', {gigs: context.contextGigs
      
      });
    })
    .catch(err => res.render('error', { error: err }))
);

//display add gig form

router.get('/add',(req,res) => {
  res.render('add')
} )

//Add a post

// Add a gig
router.post('/add', (req, res) => {
  let { title, technologies, budget, description, contact_email } = req.body;
  let errors = [];

  // Validate Fields
  if(!title) {
    errors.push({ text: 'Please add a title' });
  }
  if(!technologies) {
    errors.push({ text: 'Please add some technologies' });
  }
  if(!description) {
    errors.push({ text: 'Please add a description' });
  }
  if(!contact_email) {
    errors.push({ text: 'Please add a contact email' });
  }

  // Check for errors
  if(errors.length > 0) {
    res.render('add', {
      errors,
      title, 
      technologies, 
      budget, 
      description, 
      contact_email
    });
  } else {
    if(!budget) {
      budget = 'Unknown';
    } else {
      budget = `$${budget}`;
    }

    // Make lowercase and remove space after comma
    technologies = technologies.toLowerCase().replace(/,[ ]+/g, ',');

    // Insert into table
    Gig.create({
      title,
      technologies,
      description,
      budget,
      contact_email
    })
      .then(gig => res.redirect('/gigs'))
      .catch(err => res.render('error', {error:err.message}))
  }
});

//Search for gigs
router.get('/search', (req, res) => {
  let { term } = req.query;

  // Make lowercase
  term = term.toLowerCase();

  Gig.findAll({ where: { technologies: { [Op.like]: '%' + term + '%' } } })
  .then(gigs => {
   
    const context = {
      contextGigs: gigs.map(gig =>{
          return{
              title: gig.title,
              technologies: gig.technologies,
              budget: gig.budget,
              description: gig.description,
              contact_email: gig.contact_email
          }
      })
  }
    res.render('gigs', {gigs: context.contextGigs
    
    });
  })
    .catch(err => res.render('error', {error: err}));
});

module.exports = router;
