// swagger.mjs

import swaggerJsDoc from 'swagger-jsdoc';

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'Documentation for your API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./routes/*.mjs'], // Path to your API route files
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);

export default swaggerSpec;
