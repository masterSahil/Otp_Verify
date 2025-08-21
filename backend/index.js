require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connectDB = require('./config/DB');
const router = require('./routes/route');

app.listen(process.env.PORT, ()=> {
    console.log(`App is Listening on Port ${process.env.PORT}`);
})

connectDB();

app.use(cors());
app.use(express.json());
app.use('/', router);