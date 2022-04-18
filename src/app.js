const path = require("path");
const express = require("express");
const methodOverride = require("method-override");
const expressHandlebars = require("express-handlebars");
const Handlebars = require("handlebars");
var _ = require("lodash");
const session = require("client-sessions");

// DB Config
const db = require("./config/db/");
db.connect();

// Express Config
const app = express();
const port = 3000;

app.use(
  session({
    cookieName: "session",
    secret: "eg[isfd-8yF9-7w2315df{}+Ijsli;;to8",
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true,
    ephemeral: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.use(methodOverride("_method"));

// Use static folder
app.use(express.static(path.join(__dirname, "public")));

// Template engine
app.engine(
  "hbs",
  expressHandlebars({
    extname: ".hbs",
    helpers: {
      sumIndex: function (a, b) {
        return a + b;
      },
      characterLimit: function (length, context) {
        if (context.length > length) {
          return context.substring(0, length) + "...";
        } else {
          return context;
        }
      },
      seats: function (totalSeats, customerPickedSeat, busId) {
        var arrTotalSeats = [];
        var arrSeatsPicked;
        var joinSeats;
        var seatsNum;

        joinSeats = customerPickedSeat.join();
        arrSeatsPicked = Array.from(joinSeats.split(","), Number);
        //console.log(arrSeatsPicked);
        sortSeats = arrSeatsPicked.sort(function (a, b) {
          return a - b;
        });
        seatsNum = parseInt(totalSeats);
        for (var i = 1; i < seatsNum + 1; i++) {
          arrTotalSeats.push(i);
        }

        var seatsRender = arrTotalSeats.map(function (seat) {
          if (_.includes(sortSeats, seat))
            //console.log("ghe " + seat + " used")
            return `<div class="seat picked-seat" data-id="${busId}">
            <a href="#" data-id="${busId}" aria-disabled="true">
              <i class="material-icons" data-toggle="tooltip" data-placement="top" title="" data-original-title="Số ghế: ${seat}">weekend</i>
            </a>
            </div>`;
          //console.log("ghe " + seat + " availible")
          else
            return `<div class="seat" data-id="${busId}">
            <a href="#" data-id="${busId}" >
              <i class="material-icons" data-toggle="tooltip" data-placement="top" title="" data-original-title="Số ghế: ${seat}">weekend</i>
            </a>
            </div>`;
        });

        return new Handlebars.SafeString(seatsRender.join(""));
      },
      countTickets: function (tickets) {
        if (tickets.length > 0) {
          var joinSeats = tickets.join();
          var arrSeats = Array.from(joinSeats.split(","), Number);
          return arrSeats.length;
        } else {
          return `Không có dữ liệu`;
        }
      },
      calculateTicket: function (countTickets) {
        if (typeof countTickets === "number") {
          return (countTickets * 100000).toLocaleString();
        } else {
          return `Không có dữ liệu`;
        }
      },
      ifEquals: function (arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
      ifNotEquals: function (arg1, arg2, options) {
        return arg1 !== arg2 ? options.fn(this) : options.inverse(this);
      },
      eq: function () {
        const args = Array.prototype.slice.call(arguments, 0, -1);
        return args.every(function (expression) {
          return args[0] === expression;
        });
      },
      ifCond: function (v1, operator, v2, options) {
        switch (operator) {
          case "==":
            return v1 == v2 ? options.fn(this) : options.inverse(this);
          case "===":
            return v1 === v2 ? options.fn(this) : options.inverse(this);
          case "!=":
            return v1 != v2 ? options.fn(this) : options.inverse(this);
          case "!==":
            return v1 !== v2 ? options.fn(this) : options.inverse(this);
          case "<":
            return v1 < v2 ? options.fn(this) : options.inverse(this);
          case "<=":
            return v1 <= v2 ? options.fn(this) : options.inverse(this);
          case ">":
            return v1 > v2 ? options.fn(this) : options.inverse(this);
          case ">=":
            return v1 >= v2 ? options.fn(this) : options.inverse(this);
          case "&&":
            return v1 && v2 ? options.fn(this) : options.inverse(this);
          case "||":
            return v1 || v2 ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      },
      countSeats: function (pickedSeats, carSeats) {
        let joinSeats = pickedSeats.join();
        //console.log("joinSeats", joinSeats);
        let arrSeatsPicked = Array.from(joinSeats.split(","), Number);
        let removeZero = arrSeatsPicked.filter((item) => item !== 0);

        let remainingSeats = parseInt(carSeats);
        return remainingSeats - removeZero.length;
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

// Routes init
const route = require("./routes");
const { count } = require("console");
route(app);

app.listen(port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);
