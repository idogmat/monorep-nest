'use strict';

require('dotenv').config();

exports.config = {
  app_name: process.env.NEW_RELIC_APP_NAME,
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  distributed_tracing: {
    enabled: true,
  },
  logging: {
    level: 'info', // можно 'trace', если хочешь больше логов
  },
  allow_all_headers: true,
  attributes: {
    exclude: ['request.headers.cookie', 'request.headers.authorization'],
  },
};
