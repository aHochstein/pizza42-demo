function login(email, password, callback) {
    const axios = require('axios');
    const qs = require('qs');
    var data = qs.stringify({
      'grant_type': 'password',
      'username': email,
      'password': password,
      'client_id': configuration.client_id,
      'client_secret': configuration.client_secret
    });
    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: configuration.token_endpoint,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      data: data
    };

    axios(config)
      .then(function (response) {
        var config = {
          method: 'get',
          maxBodyLength: Infinity,
          url: configuration.userinfo_endpoint,
          headers: {
            'Authorization': `Bearer ${response.data.access_token}`}
        };

    axios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
        callback(null, {
          sub: response.data.sub,
          user_id: response.data.sub,
          name: response.data.name,
          given_name: response.data.given_name,
          family_name: response.data.family_name,
          email_verified: response.data.email_verified,
          nickname: response.data.nickname,
          email: response.data.email,
          app_metadata: {
            hasCrm : true
          }
        });
      })
      .catch(function (error) {
        callback(error);
      });
  })
  .catch(function (error) {
    callback(error);
  });
}