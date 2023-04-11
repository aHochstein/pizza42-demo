function getByEmail(email, callback) {
    if(email === 'migrate-me@authfest.com') {
      let profile = 
      {
         "sub" : "123",
         "firstname" : "Migrate",
         "lastname" : "Me",
         "email" : "migrate-me@authfest.com" 
      };
      return   callback(null, profile);
      
    }
    return callback(null);
  }
  