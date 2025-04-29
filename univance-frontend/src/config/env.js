// src/config/env.js

// Environment configuration for the Univance app
const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.23:3000/api',
    authServiceUrl: 'http://127.0.0.1:3001',
    userServiceUrl: 'http://127.0.0.1:3002',
    taskServiceUrl: 'http://127.0.0.1:3003',
    pointsServiceUrl: 'http://127.0.0.1:3004',
    rewardsServiceUrl: 'http://127.0.0.1:3005',
    notificationServiceUrl: 'http://127.0.0.1:3006',
    analyticsServiceUrl: 'http://127.0.0.1:3007',
  },
  prod: {
    apiUrl: 'https://api.univance.com',
    authServiceUrl: 'https://auth.univance.com',
    userServiceUrl: 'https://user.univance.com',
    taskServiceUrl: 'https://task.univance.com',
    pointsServiceUrl: 'https://points.univance.com',
    rewardsServiceUrl: 'https://rewards.univance.com',
    notificationServiceUrl: 'https://notifications.univance.com',
    analyticsServiceUrl: 'https://analytics.univance.com',
  }
};

// Determine which environment to use
const getEnvVars = (env = process.env.NODE_ENV || 'development') => {
  // Return development environment for development or testing
  if (env === 'development' || env === 'test') {
    return ENV.dev;
  }
  // Return production environment otherwise
  return ENV.prod;
};

export default getEnvVars();