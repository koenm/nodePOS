var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var stylus = require('stylus');
var snmp = require("net-snmp");

var settings = require("./public/js/settings.js");

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(stylus.middleware(path.join(__dirname, 'public')));

app.use(stylus.middleware({
    src: __dirname + '/stylesheets',
    dest: __dirname + '/public/css'
  }
));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

app.post('/',function(req, res) {
  var htmlTop =  '';
  var htmlBottom =  '';
  settings.machines.forEach(function(machine) {
    if (machine.row === "top") {
      htmlTop +='\
        <div class="machine">\
          <button class="btn btn-danger" id="' + machine.id + '" onclick="getCounter(this)">' + machine.name + '</button>\
          <div id="fns' + machine.id + '">\
            <span class="live">000</span>\
          </div>\
        </div>';
    } else {
      htmlBottom +='\
        <div class="machine">\
          <div id="fns' + machine.id + '">\
            <span class="live">000</span>\
          </div>\
          <button class="btn btn-danger" id="' + machine.id + '" onclick="getCounter(this)">' + machine.name + '</button>\
        </div>';
      }
    });
    res.send([htmlTop, htmlBottom]);
});


// STAAT HIER OM OP BIJ REFRESH DIRECT UIT TE VOEREN.
// MOET VERPLAATST WORDEN NAAR /getcounter

// clicked machine
theMachine = settings.machines.filter((machine) => machine.id == 12)[0];

var options = {
    retries: 1,
    timeout: 500
};

var session = snmp.createSession (theMachine.ip, "public", options);
var oids = theMachine.oids;

//oids = Object.keys(oids).map(i => oids[i]);

var counter = [];

// session.get(oid, function(error, varbinds) {
//   if (error) {
//     console.log(error);
//   } else {
//     if (snmp.isVarbindError(varbinds[0])) {
//       console.log(snmp.varbindError(varbinds[0]));
//     } else {
//       console.log([key, varbinds[0].value]);
//     }
//   }
// });
oid = ["1.3.6.1.4.1.253.8.53.13.2.1.6.1.20.1"];
function getTheCounter(oid) {
  return new Promise(function(resolve, reject) {
    session.get(oid, function(error, varbinds) {
      if (error) {
        reject(error);
      } else {
        if (snmp.isVarbindError(varbinds[0])) {
          resolve( snmp.varbindError(varbinds[0]));
        } else {
          reject([varbinds[0].value]);
        }
      }
    });
  });


}
getTheCounter(oid)
  .then(function (f) {
    console.log(f);
  })
  .catch(function (e) {
    console.log(e);
  })








for (var key in oids) {


  // aangezien session.get enkel een array van strings aannneemt moet
  // elke value in de oid array naar een array van 1 element omgezet worden
  // oidArray = [oids[key].oid];
  //
  // getTheCounter(key, oidArray)
  //   .then(function (val) {
  //     //theMachine.oids[val[0]].value = val[1];
  //     //console.log(val);
  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //   });
}




//res.send(counters);


app.post('/getCounter', function(req, res) {

});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
