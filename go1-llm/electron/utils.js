const { app } = require('electron');

const isDev = process.env.NODE_ENV === 'development' || 
              process.env.DEBUG_PROD === 'true' ||
              !app.isPackaged;

module.exports = {
  isDev
};