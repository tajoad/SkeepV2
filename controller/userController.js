const signUp = async (req, res, next) => {
  try {
    var db = req.db;
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
  } catch (error) {
    res.send({
      message: "An error occured",
    });
  }
};

const signIn = async (req, res, next) => {
  try {
    var db = req.db;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true); // you

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

      res.send(sendData);
      res.end();
    };

    //login authentication
    let userData = req.body;
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
            const res = bcrypt.compareSync(userData.password, hashedPassword);

            if (res == false) {
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
  } catch (error) {
    res.send({
      message: error,
    });
  }
};
module.exports = { signUp, signIn };
