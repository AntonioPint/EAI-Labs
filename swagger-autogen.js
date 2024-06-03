const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'My API',
    description: 'Description',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  schemes: ['http']
};

const outputFile = './swagger-output.json';
const routes = ['./routes/index.js', './routes/users.js'];  // Include all your route files

swaggerAutogen(outputFile, routes, doc);
