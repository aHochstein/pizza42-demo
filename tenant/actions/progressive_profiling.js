 /**
 * configure progressive profiling
 *
 *
 */
// First configure wether you want your users to experience a multi page form workflow or not.
// e.g. request basic information first and request the shipping address on the second page
const multiPage = false;
// Since it is all about progressive profiling this page allows you to specify how many
// attributes shall be requested from your users at once.
const maxRequestedAttributes = 4;
// Lastly the schema defines which attributes should be present in the user profile
// it also defines the theme of the profiling app.
const schema = {
  "title": "Animal Store", // headline of the page
  "subheading": "Tell us something about your pet.", // subheading of the page (optional)
  "theme": {
      "logoUrl": "https://cdn.auth0.com/website/bob/press/shield-dark.png", // logo url (optional)
      "backgroundColor": "#f1f1f1", // (optional)
      "backgroundImage": "https://my-awesome-image.com", // (optional)
      "accentColor": "#fff"  // (optional)
  },
  "properties": {
      "street": {
          "label": "Street Address",
          "type": "text",
      },
      "zipCode": {
        "label": "Zip Code",
        "type": "text",
      },
      "city": {
        "label": "City",
        "type": "text",
      },
      "country": {
        "label": "Country",
        "type": "text",
      }
  }
};


// import necessary business logic
const {
  progressiveProfilingNeeded,
  calculateSchemaToRequest,
  mergeAttributesToProfile,
} = require("@felixcolaci/auth0-progressive-profiling-action");

/**
 * Handler that will be called during the execution of a PostLogin flow.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onExecutePostLogin = async (event, api) => {
  // calculate the schema to request based upon provided settings + current user profile
  const schemaForRedirect = calculateSchemaToRequest(
    schema, // as configured above
    event.user.user_metadata, // current state of the user profile
    multiPage, // config value from above
    maxRequestedAttributes // config value from above
  );
  // only perform redirect if necessary (if there are required attributes missing in the user profile)
  if (progressiveProfilingNeeded(schemaForRedirect)) {
    // if progressive profiling is necessary for the current user we encode the required data into
    // the session token and pass it of to the profiling app
    const token = api.redirect.encodeToken({
      secret: event.secrets.TOKEN_SIGNING,
      expiresInSeconds: 3600,
      payload: {
        requiredData: schemaForRedirect,
      },
    });
    // The redirect URL must not change in order for this app to work.
    api.redirect.sendUserTo("https://auth0-progressive-profiling.netlify.app", {
      query: {
        session_token: token,
      },
    });
  }
};

/**
 * Handler that will be invoked when this action is resuming after an external redirect. If your
 * onExecutePostLogin function does not perform a redirect, this function can be safely ignored.
 *
 * @param {Event} event - Details about the user and the context in which they are logging in.
 * @param {PostLoginAPI} api - Interface whose methods can be used to change the behavior of the login.
 */
exports.onContinuePostLogin = async (event, api) => {
  // decode the callback
  const payload = api.redirect.validateToken({
    secret: event.secrets.TOKEN_SIGNING,
    tokenParameterName: "continueToken",
  });
  // ... and update the user profile if necessary
  const userData = payload.requiredData;
  if (userData) {
    const customProfile = event.user.user_metadata["customProfile"] || {};
    // it is important to deep merge the profile since other approaches would overwrite existing data
    mergeAttributesToProfile(customProfile, userData);
    // at last we update the user profile through the management api
    api.user.setUserMetadata("customProfile", customProfile);
  }
};