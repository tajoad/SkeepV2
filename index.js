const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");

//Create connection
const db = mysql.createPool({
  host: "db4free.net",
  port: "3306",
  user: "skipdb",
  password: "skipdb2023",
  database: "skipdb",
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
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true); // you
  res.setHeader("Content-Type", "application/json");

  let userData = req.body;

  console.log(userData);

  userData.forEach((element) => {
    const params = [element.Answer, element.Questionid, element.Personid];
    query = `
              SELECT distinct count(person_id) as count FROM answers
              WHERE person_id = "${params[2]}" 
              and Question_id = "${params[1]}"
              `;

    db.query(query, (error, result) => {
      if (error) {
        throw err;
      } else {
        console.log(result[0].count);
        if (result[0].count === 0) {
          const sql = `insert into answers      (answer, Question_id, person_id)
                  VALUES("${params[0]}", "${params[1]}", "${params[2]}")`;

          let query = db.query(sql, userData, (err, result) => {
            if (err) {
              res.status(400).json({ message: "Not Submitted", status: 400 });
            } else {
              res.status(200).json({
                message: "Submitted Successfully",
                status: 200,
              });
            }
          });
        } else {
          const sql = `update answers  
                       set answer = "${params[0]}"
                       where Question_id=  "${params[1]}"
                       and   person_id = "${params[2]}" `;
          let query = db.query(sql, userData, (err, result) => {
            if (err) {
              res.status(400).json({ message: "Not Submitted", status: 400 });
            } else {
              res.status(200).json({
                message: "Submitted Successfully",
                status: 200,
              });
            }
          });
        }
      }
    });
  });
  // getRegResponse(false, "Submitted Successfully");
});

app.post("/getanswers", (req, res) => {
  // callback function
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true); // you
  res.setHeader("Content-Type", "application/json");
  let userData = req.body;

  query = `
              SELECT a.Answer, b.Question, a.Question_id Questionid, a.Person_id Personid 
              FROM answers a, questions b
              WHERE person_id = ${userData.Personid}
              and a.question_id = b.id
              `;

  db.query(query, (error, result) => {
    if ((res.statusCode = 200)) {
      res.send(result);
    } else {
      res.send(error);
    }
  });
});

// call answer

app.post("/answer", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true); // you
  res.setHeader("Content-Type", "application/json");
  let userData = req.body;

  userData.forEach((element) => {
    // if request questionid is null run this to inset into question and answer tables
    if (element.Questionid === "") {
      const quesSQL = `insert into questions      (Personid, Question)
        VALUES("${element.Personid}", "${element.Question}")`;

      db.query(quesSQL, userData, (err, result) => {
        if (err) {
          console.log(err);
        } else {
          const sql = `insert into answers      (answer, Question_id, person_id)
            VALUES("${element.Answer}", "${result.insertId}", "${element.Personid}")`;

          db.query(sql, userData, (err, result) => {
            if (err) {
              throw err;
            } else {
              return res.statusCode;
            }
          });
        }
      });
      // else do this
    } else {
      // call main input
      query = `
              SELECT distinct count(person_id) as count FROM answers
              WHERE person_id = "${element.Personid}" 
              and Question_id = "${element.Questionid}"
              `;

      db.query(query, (error, result) => {
        if (error) {
          throw err;
        } else {
          console.log(result[0].count);
          if (result[0].count === 0) {
            const sql = `insert into answers      (answer, Question_id, person_id)
                  VALUES("${element.Answer}", "${element.Questionid}", "${element.Personid}")`;

            let query = db.query(sql, userData, (err, result) => {
              if (err) {
                throw err;
              } else {
                return res.statusCode;
              }
            });
          } else {
            if (element.Questionid > 8) {
              const questSql = `update questions  
                  set Question = "${element.Question}"
                  where id=  "${element.Questionid}"
                  and   Personid = "${element.Personid}" `;
              db.query(questSql, userData, (err, result) => {
                if (err) {
                  throw err;
                } else {
                  return res.statusCode;
                }
              });

              const sql = `update answers  
                  set answer = "${element.Answer}"
                  where Question_id=  "${element.Questionid}"
                  and   person_id = "${element.Personid}" `;
              let query = db.query(sql, userData, (err, result) => {
                if (err) {
                  throw err;
                } else {
                  return res.statusCode;
                }
              });
            } else {
              const sql = `update answers  
                       set answer = "${element.Answer}"
                       where Question_id=  "${element.Questionid}"
                       and   person_id = "${element.Personid}" `;
              let query = db.query(sql, userData, (err, result) => {
                if (err) {
                  throw err;
                } else {
                  return res.statusCode;
                }
              });
            }
          }
        }
      });
    }
  });
  if (res.statusCode == 200) {
    res.send({ message: "Submitted Successfully", statusCode: 200 });
  } else {
    res.send({ message: "Not Submitted Successfully", statusCode: 400 });
  }
  //getRegResponse(false, "Submitted Successfully");
});

app.listen("3002", () => {
  console.log("Server Started on port 3002");
});
