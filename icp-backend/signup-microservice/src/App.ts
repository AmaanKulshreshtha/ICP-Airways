import * as path from 'path';
import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as passwordhash from 'password-hash'
var ibmdb = require('ibm_db');

class App {
  public express: express.Application;
  public connectionString: String;
  constructor() {
    this.connectionString = 'DATABASE=' + (process.env.DATABASE) + ';' +
      'HOSTNAME=' + process.env.HOSTNAME + ';' + 'UID=' + process.env.UID + ';' +
      'PWD=' + process.env.PASSWORD + ';' + 'PORT=' + process.env.PORT + ';' +
      'PROTOCOL=' + process.env.PROTOCOL + ';'
    console.log(this.connectionString);
    this.express = express();
    this.middleware();
    this.routes();
  }
  private middleware(): void {
    this.express.use(logger('dev'));
    this.express.use(bodyParser.json());
    this.express.use(bodyParser.urlencoded({ extended: false }));
  }
  private routes(): void {
    let router = express.Router();
    router.post('/createUser', (req, res, next) => {
      ibmdb.open(this.connectionString, function (err, conn) {
        conn.prepare("insert into SAMPLE.UserData (LastName, FirstName, Location, Email, Password, Age) VALUES (?, ?, ?, ?, ?, ?)", function (err, stmt) {
          if (err) {
            console.log(err);
            return conn.closeSync();
          }
          console.log(req.body.lastName)
          stmt.execute([req.body.lastName, req.body.firstName, req.body.location, req.body.email, passwordhash.generate(req.body.password), req.body.age], function (err, result) {
            if (err) console.log(err);
            else{
              res.json({
                message: "sucessful"
              });
               result.closeSync();
            }
            conn.close(function (err) { });
          });
        });
      });
    });
    this.express.use('/', router);
  }
}
export default new App().express;



// insert into "SAMPLE.UserData (LastName, FirstName, Location, Email, Password, Age) VALUES ('SAIF', 'rehman', 'ajman', 'a@a.com', '1', '23')"