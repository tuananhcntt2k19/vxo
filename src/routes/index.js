const siteRouter = require("./site.route");
const authRouter = require("./auth.route");
const dashboardRouter = require("./dashboard.route");

function route(app) {
  app.use("/auth", authRouter);
  app.use("/dashboard", dashboardRouter);
  app.use("/", siteRouter);
}

module.exports = route;
