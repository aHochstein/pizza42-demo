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
