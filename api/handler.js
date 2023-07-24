'use strict';
var { faker } = require('@faker-js/faker');


module.exports.crm = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        address: {
          city: faker.address.city(),
          postalCode: faker.address.zipCode(),
          streetAddress: faker.address.streetAddress(),
          country: faker.address.country()
        },
        company: {
          name: faker.company.name(),
          address: {
            city: faker.address.city(),
            postalCode: faker.address.zipCode(),
            streetAddress: faker.address.streetAddress(),
            country: faker.address.country()
          },
        }
      }
    ),
  };
};



module.exports.login = async (event) => {
  let body = JSON.parse(event.body);
  let username = body?.username;
  let password = body?.password;

  if(username === "migrate-me@authfest.com" && password === "MigrateMe!") {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          "sub" : "123",
          "firstname" : "Migrate",
          "lastname" : "Me",
          "email" : "migrate-me@authfest.com"  
        }
      ),
    };
  }
  if(username === "jim.smith@gmail.com" && password === "Paaf213XXYYZZ") {
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          "sub" : "123",
          "firstname" : "Jim",
          "lastname" : "Smith",
          "email" : "jim.smith@gmail.com"  
        }
      ),
    };
  }
  else {
    return {
      statusCode: 400,
      body: JSON.stringify(
        {
          "message" : "Wrong credentials or username"
        }
      ),
    } 
  }
};