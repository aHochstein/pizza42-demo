  /**
  * Handler that will be called during the execution of a PostLogin flow.
  *
  * @param {Event} event - Details about the user and the context in which they are logging in.
  * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
  */
  exports.onExecutePostLogin = async (event, api) => {
    let delivery_address = event.user.user_metadata["delivery_address"];
    if(delivery_address) {
      api.idToken.setCustomClaim('delivery_address', delivery_address)
    }
  };