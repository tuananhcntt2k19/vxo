const path = require("path");
const express = require("express");
const methodOverride = require("method-override");
const expressHandlebars = require("express-handlebars");
const session = require("client-sessions");
const {
  characterLimit,
  seats,
  sumIndex,
  countTickets,
  calculateTicket,
  ifEquals,
  ifNotEquals,
  eq,
  ifCond,
  countSeats,
} = require("./util/helpers");

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

// Template engine & Helpers
app.engine(
  "hbs",
  expressHandlebars({
    extname: ".hbs",
    helpers: {
      sumIndex: sumIndex,
      characterLimit: characterLimit,
      seats: seats,
      countTickets: countTickets,
      calculateTicket: calculateTicket,
      ifEquals: ifEquals,
      ifNotEquals: ifNotEquals,
      eq: eq,
      ifCond: ifCond,
      countSeats: countSeats,
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "resources", "views"));

// Routes init
const route = require("./routes");
route(app);

app.listen(process.env.PORT || port, () =>
  console.log(`Server listening at http://localhost:${port}`)
);
