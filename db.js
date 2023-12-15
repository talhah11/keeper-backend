const mongoose = require('mongoose');
require('dotenv').config();
const DB_HOST = process.env.DB_HOST;

const mongoURI = DB_HOST;

async function connectToMongo() {
    await mongoose.connect(mongoURI).then(() => console.log("Connected to Mongo Successfully")).catch(err => console.log(err));
}

module.exports = connectToMongo;
