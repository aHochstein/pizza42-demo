const axios = require('axios');
  /**
   * Handler that will be called during the execution of a PostLogin flow.
   *
   * @param {Event} event - Details about the user and the context in which they are logging in.
   * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
   */
   exports.onExecutePostLogin = async (event, api) => {
      if(!event.user.app_metadata.hasCrm) {
        return;
      }
      let email = event.user.email;
      if(email && !event.user.user_metadata.address && !event.user.user_metadata.company) {
        let config = {
          url: 'https://n010mpzx35.execute-api.us-east-1.amazonaws.com/crm',
          params: { email : email},
          method: 'get'
        } 
        try {
          let response = await axios(config);
          let address = response.data.address;
          let company = response.data.company;
          api.user.setUserMetadata('address',address);
          api.user.setUserMetadata('company',company);
        }
        catch(e) {
          console.log(e);
          return;
        }
  }
};