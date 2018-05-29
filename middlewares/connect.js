var mongoose= require('mongoose');

mongoose.connect('mongodb://user:123@ds219100.mlab.com:19100/carnet_sante',
  function(err) {
    if(!err) {
      console.log('La connexion à la base de données a été un succes');
    }
      else {
        console.log(err);
      }
    }
  );

  
module.exports = mongoose;
