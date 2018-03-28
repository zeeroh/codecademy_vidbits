const {mongoose, databaseUrl, options} = require('../database');

const connectDatabase = async () => {
  await mongoose.connect(databaseUrl, options);
  await mongoose.connection.db.dropDatabase();
};

const diconnectDatabase = async () => {
  await mongoose.disconnect();
};

module.exports = {
  connectDatabase,
  diconnectDatabase
};
