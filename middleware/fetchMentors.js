const Mentor = require('../models/mentor')

module.exports = async() =>{
    Mentor.find()
        .then(mentors => {
            console.log('func: '+mentors)
            console.log('parse: '+JSON.stringify(mentors))
            return 'etxt'
        })
        .catch(err=> {
            const error = new Error(err);
            error.httpStatusCode(500);
            return next(error)
        })
}