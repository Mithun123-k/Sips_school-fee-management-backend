const logger = {
  info: (message) => {
    console.log(`\x1b[32m[INFO]\x1b[0m ${message}`);
  },

  error: (message) => {
    console.log(`\x1b[31m[ERROR]\x1b[0m ${message}`);
  },

  warning: (message) => {
    console.log(`\x1b[33m[WARNING]\x1b[0m ${message}`);
  },
};

module.exports = logger;