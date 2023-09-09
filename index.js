const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser");
const routes = require("./src/routes/routes");
const path = require("path");

//Create connection
const db = mysql.createConnection({
  host: "db4free.net",
  port: "3306",
  user: "skipdb",
  password: "skipdb2023",
  database: "skipdb",
});

db.connect(function (err) {
  if (err) {
    console.log("Error connecting to db");
  } else {
    console.log("connection established");
  }
});

const port = 3002;

app.listen(port, (err) => {
  if (err) {
    console.log("server failed to start");
  } else {
    console.log("server started at port : ", port);
  }
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieparser());
app.use(express.static(path.join(__dirname, "./images")));

app.use(cors());

app.use(function (req, res, next) {
  req.db = db;
  next();
});

app.use("/", routes);

module.exports = app;
