// src/swagger.js
const path = require("path");
const swaggerJsdoc = require("swagger-jsdoc");

// Swagger configuration for the API Gateway
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Univance API Gateway",
    version: "1.0.0",
    description: "Combined API documentation for all Univance microservices",
  },
  servers: [
    {
      url: "http://localhost:3000/api",
      description: "Local API Gateway server",
    },
    {
      url: "https://api.univance.com/api",
      description: "Production API Gateway server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  // Apply JWT auth globally; endpoints can override
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: [
    path.join(__dirname, "../../auth-service/src/routes/*.js"),
    path.join(__dirname, "../../user-service/src/routes/*.js"),
    path.join(__dirname, "../../points-service/src/routes/*.js"),
    path.join(__dirname, "../../notification-service/src/routes/*.js"),
    path.join(__dirname, "../../task-service/src/routes/*.js"),
    // Add additional service route patterns here as needed
  ],
};

module.exports = swaggerJsdoc(options);
