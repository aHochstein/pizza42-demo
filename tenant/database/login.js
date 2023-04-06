function login(email, password, callback) {
  const axios = require('axios');
  var data = JSON.stringify({
    'username': email,
    'password': password
  });
  const config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: configuration.endpoint,
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      callback(null, {
        sub: response.data.sub,
        user_id: response.data.sub,
        name: response.data.email,
        given_name: response.data.firstname,
        family_name: response.data.lastname,
        email: response.data.email,
        app_metadata: {
          hasCrm : true
        }
      });
  })
  .catch(function (error) {
    callback(error);
  });
}