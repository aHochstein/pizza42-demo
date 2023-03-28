  /**
  * Handler that will be called during the execution of a PostLogin flow.
  *
  * @param {Event} event - Details about the user and the context in which they are logging in.
  * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
  */
  exports.onExecutePostLogin = async (event, api) => {
    let user_address = event.user.user_metadata["address"];
    if(user_address) {
      api.idToken.setCustomClaim('address', user_address)
    }
  };