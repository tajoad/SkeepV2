const processAnswer = async (req, res, next) => {
  try {
    var db = req.db;
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
  } catch (error) {
    res.send({
      message: "An error occured",
    });
  }
};

const deleteAnswer = async (req, res, next) => {
  try {
    var db = req.db;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true); // you
    res.setHeader("Content-Type", "application/json");
    let userData = req.body;

    console.log(userData);
    const questSql = `delete from questions  
    where id = "${userData.Questionid}"
    and   Personid = "${userData.Personid}" `;
    db.query(questSql, userData, (err, result) => {
      if (err) {
        throw err;
      } else {
        return res.statusCode;
      }
    });

    const sql = `delete from answers  
    where Question_id = "${userData.Questionid}"
    and   person_id = "${userData.Personid}" `;
    let query = db.query(sql, userData, (err, result) => {
      if (err) {
        throw err;
      } else {
        return res.statusCode;
      }
    });
  } catch (error) {}
};

const getAnswer = async (req, res, next) => {
  try {
    var db = req.db;
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
  } catch (error) {
    res.send({
      message: "An error occured",
    });
  }
};

module.exports = { processAnswer, deleteAnswer, getAnswer };
