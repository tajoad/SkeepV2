const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

//Create connection
const db = mysql.createPool({
  host: "sql.freedb.tech",
  port: "3306",
  user: "freedb_skeepdb",
  password: "PpgcbDV?pt4X2T!",
  database: "freedb_skeepdb",
});

const app = express();
app.use(cors());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// get user from database
app.get("/getusers/:id", (req, res) => {
  let sql = `SELECT * FROM aboutme WHERE id = ${req.params.id}`;
  let query = db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    console.log(results);
    res.send(results);
  });
});

// get question
app.get("/getquestions", (req, res) => {
  let sql = `SELECT * FROM questions`;
  let query = db.query(sql, (err, results) => {
    if (err) {
      throw err;
    }
    res.send(results);
  });
});

// update user picture
app.put("/updatepicture/:id", (req, res) => {
  const getRegResponse = (err, resp, data) => {
    let getRes;
    let status;

    if (err) {
      getRes = err.message;
      status = 0;
    } else {
      getRes = resp;
      status = 1;
    }

    const sendData = {
      responseMsg: getRes,
      responseCode: status,
      picture: data,
    };

    res.statusCode = 200;

    res.send(sendData);
    res.end();
  };

  let userData = req.body;
  let sql = `UPDATE aboutme SET picName = '${userData.name}' WHERE id = ${req.params.id}`;
  let query = db.query(sql, (err, results) => {
    if (err) {
      getRegResponse(true, err, null);
    }
    getRegResponse(false, "picture successfully uploaded", userData);
  });
});

// sign up call
app.post("/signup", (req, res) => {
  // callback function
  const getRegResponse = (err, resp) => {
    let getRes;
    let status;

    if (err) {
      getRes = err.message;
      status = 0;
    } else {
      getRes = resp;
      status = 1;
    }

    const sendData = {
      responseMsg: getRes,
      responseCode: status,
    };

    res.statusCode = 200;

    console.log(sendData);

    res.setHeader("Content-Type", "application/json");
    res.send(sendData);
    res.end();
  };

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true); // you
  let userData = req.body;
  console.log(userData);
  const bcrypt = require("bcrypt");

  const passwordHash = bcrypt.hashSync(userData.password, 10);

  const params = [userData.email, passwordHash, passwordHash];

  // Authenticate Registration

  if (userData.email && passwordHash) {
    query = `
        SELECT * FROM signup 
        WHERE email = "${userData.email}"
        `;

    db.query(query, (error, result) => {
      if (error) {
        getRegResponse(error, false);
      } else {
        if (result.length > 0) {
          console.log(result.length);
          getRegResponse(
            new Error("You already have an account. Kindly Login"),
            null
          );
        } else {
          //insert into table and send response

          const sql = `insert into signup (email, password, confirmPassword) VALUES("${params[0]}", "${params[1]}", "${params[2]}")`;
          let query = db.query(sql, userData, (err, result) => {
            if (err) {
              throw err;
            }
            getRegResponse(false, "Registration Successful");
          });
        }
      }
    });
  }
});

//Authenticate login
app.post("/signin", (request, response) => {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Credentials", true); // you

  //Callback function

  let sendData = {};

  const getResponse = (err, resp, getabt) => {
    let getRes;
    let status;
    let confirmSub;

    if (err) {
      getRes = err.message;
      status = 0;
    } else {
      getRes = resp;
      status = 1;
    }

    let sendData = {
      responseMsg: getRes,
      responseCode: status,
      respSubmitted: getabt,
    };
    // Object.assign(sendData, {
    //   responseMsg: getRes,
    //   responseCode: status,
    //   respSubmitted: confirmSub,
    // });

    response.send(sendData);
    response.end();
  };

  //login authentication
  let userData = request.body;
  const bcrypt = require("bcrypt");

  const passwordHash = bcrypt.hashSync(userData.password, 10);

  if (userData.email && passwordHash) {
    query = `
        SELECT * FROM signup 
        WHERE email = "${userData.email}"
        `;

    db.query(query, (error, result) => {
      if (error) {
        getResponse(error, false, null);
      } else {
        if (result.length == 0) {
          getResponse(new Error("Email address does not exist"), null, null);
        } else {
          const hashedPassword = result[0].password;
          const response = bcrypt.compareSync(
            userData.password,
            hashedPassword
          );

          if (response == false) {
            getResponse(new Error("Incorrect Password"), null, null);
          } else {
            // authenticate aboutme
            const welcomeString = result[0].Personid;
            query = `
              SELECT distinct person_id as count FROM answers
              WHERE person_id = "${result[0].Personid}"
              `;

            db.query(query, (error, result) => {
              if (error) {
                throw err;
              } else {
                console.log(result[0]);
                if (result[0] === undefined) {
                  getResponse(null, welcomeString, false);
                } else {
                  getResponse(null, welcomeString, true);
                }
              }
            });
          }
        }
      }
    });
  } else {
    null;
  }
});

// call about me

app.post("/answers", (req, res) => {
  // callback function
  const getRegResponse = (err, resp) => {
    let getRes;
    let status;

    if (err) {
      getRes = err.message;
      status = 0;
    } else {
      getRes = resp;
      status = 1;
    }

    const sendData = {
      responseMsg: getRes,
      responseCode: status,
    };

    res.statusCode = 200;

    res.send(sendData);
    res.end();
  };

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true); // you
  res.setHeader("Content-Type", "application/json");
  let userData = req.body;

  userData.forEach((element) => {
    const params = [element.value, element.id, element.userid];

    const sql = `insert into answers      (answer, Question_id, person_id)
                                        VALUES("${params[0]}", "${params[1]}", "${params[2]}")`;

    let query = db.query(sql, userData, (err, result) => {
      if (err) {
        throw err;
        //getRegResponse(err, true);
      }
    });
  });
  getRegResponse(false, "Submitted Successfully");
});

app.listen("3002", () => {
  console.log("Server Started on port 3002");
});
