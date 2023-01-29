// Models
const User = require("../models/user.model");
const BusSchedule = require("../models/busschdule.model");
const NewsMangentment = require("../models/new.model");
const CarManagement = require("../models/car.model");
const CategoryManagement = require("../models/category.model");
const StartendManagement = require("../models/startend.model");
const StationManagement = require("../models/station.model");
const CustomerManagement = require("../models/customer.model");

// Utils
const {
  mongooseToObject,
  multipleMongooseToObject,
} = require("../../util/mongoose");
const md5 = require("md5");

module.exports = {
  // [GET] /dashboard/index
  index: function (req, res) {
    if (req.session && req.session.user) {
      // Check if session exists
      // lookup the user in the DB by pulling their email from the session
      Promise.all([
        CustomerManagement.countDocuments(),
        User.findOne({ email: req.session.user.email }),
      ])
        .then(([customersDoc, user]) => {
          if (!user) {
            // if the user isn't found in the DB, reset the session info and
            // redirect the user to the login page
            req.session.reset();
            res.redirect("/auth");
          } else {
            // expose the user to the template
            res.locals.user = user;

            // render the dashboard page
            res.render("dashboard/index", {
              customersDoc,
              user: mongooseToObject(user),
            });
          }
        })
        .catch();
    } else {
      res.redirect("/auth");
    }
  },

  // [GET] /dashboard/bus-schedule
  busSchedule: function (req, res, next) {
    if (req.session && req.session.user) {
      // Check if session exists
      // lookup the user in the DB by pulling their email from the session
      Promise.all([
        BusSchedule.find({}),
        User.findOne({ email: req.session.user.email }),
      ])
        .then(([busschdule, user]) => {
          if (!user) {
            // if the user isn't found in the DB, reset the session info and
            // redirect the user to the login page
            req.session.reset();
            res.redirect("/auth");
          } else if (user.role === 0) {
            // expose the user to the template
            res.locals.user = user;

            // render the dashboard page
            res.render("dashboard/bus-schedule/bus-schedule", {
              user: mongooseToObject(user),
              busschdule: multipleMongooseToObject(busschdule),
            });
          } else if (user.role === 2) {
            let carManagement = user.carmanagement;
            CarManagement.findById(carManagement)
              .populate("busschedule")
              .then((car) => {
                res.render("dashboard/bus-schedule/bus-schedule", {
                  user: mongooseToObject(user),
                  busschedule: multipleMongooseToObject(car.busschedule),
                });
              });
          } else {
            req.session.reset();
            res.redirect("/auth");
          }
        })
        .catch();
    } else {
      res.redirect("/auth");
    }
  },

  // [GET] /dashboard/bus-schedule/:id/edit
  busScheduleEdit: function (req, res, next) {
    Promise.all([
      BusSchedule.findById(req.params.id).populate("cartype"),
      User.findOne({}),
      CarManagement.find({}),
      StartendManagement.find({}),
      StationManagement.find({}),
    ])
      .then(([busschdule, user, listcars, startend, station]) =>
        res.render("dashboard/bus-schedule/bus-schedule-edit", {
          user: mongooseToObject(user),
          busschdule: mongooseToObject(busschdule),
          car: mongooseToObject(busschdule.cartype),
          startend: multipleMongooseToObject(startend),
          station: multipleMongooseToObject(station),
          listcars: multipleMongooseToObject(listcars),
        })
      )
      .catch();
  },

  // [PUT] /dashboard/bus-schedule/:id
  busScheduleUpdate: function (req, res) {
    BusSchedule.updateOne({ _id: req.params.id }, req.body, function () {
      res.redirect("/dashboard/bus-schedule");
    });
  },

  // [GET] /dashboard/bus-schedule/create
  busScheduleCreate: function (req, res) {
    Promise.all([
      CarManagement.find({}),
      User.findOne({}),
      StartendManagement.find({}),
      StationManagement.find({}),
    ]).then(([car, user, startend, station]) =>
      res.render("dashboard/bus-schedule/bus-schedule-create", {
        car: multipleMongooseToObject(car),
        user: mongooseToObject(user),
        startend: multipleMongooseToObject(startend),
        station: multipleMongooseToObject(station),
      })
    );
  },

  // [POST] /dashboard/bus-schedule/store
  busScheduleStore: function (req, res) {
    const schedule = new BusSchedule(req.body);
    schedule.save().then((result) => {
      CarManagement.updateOne(
        { _id: req.body.cartype },
        { $push: { busschedule: result._id } },
        { upsert: true }
      ).then(function () {
        res.redirect("/dashboard/bus-schedule");
      });
    });
  },

  // [GET] /dashboard/bus-schedule/:id/detail
  busScheduleDetail: function (req, res) {
    Promise.all([
      BusSchedule.findById({ _id: req.params.id })
        .populate("customers")
        .populate("cartype"),
      User.findOne({ email: req.session.user.email }),
    ]).then(([bus, user]) => {
      if (!user) {
        // if the user isn't found in the DB, reset the session info and
        // redirect the user to the login page
        req.session.reset();
        res.redirect("/auth");
      } else if (user.role === 0 || user.role === 2) {
        // expose the user to the template
        res.locals.user = user;

        // render the dashboard page
        res.render("dashboard/bus-schedule/bus-schedule-detail", {
          //bus: mongooseToObject(bus.cartype),
          bus: mongooseToObject(bus),
          user: mongooseToObject(user),
          car: mongooseToObject(bus.cartype),
          customers: multipleMongooseToObject(bus.customers),
        });
      } else {
        req.session.reset();
        res.redirect("/auth");
      }
    });
  },

  // [DELETE] /dashboard/car/:id/force
  busScheduleForce: function (req, res) {
    BusSchedule.deleteOne({ _id: req.params.id }, req.body, function () {
      res.redirect("back");
    });
  },

  // [GET] /dashboard/news/create
  newsCreate: function (req, res) {
    if (req.session && req.session.user) {
      // Check if session exists
      // lookup the user in the DB by pulling their email from the session
      Promise.all([
        CategoryManagement.find({}),
        User.findOne({ email: req.session.user.email }),
      ])
        .then(([category, user]) => {
          if (!user) {
            // if the user isn't found in the DB, reset the session info and
            // redirect the user to the login page
            req.session.reset();
            res.redirect("/auth");
          } else {
            // expose the user to the template
            res.locals.user = user;

            // render the dashboard page
            res.render("dashboard/news-management/news-create", {
              category: multipleMongooseToObject(category),
              user: mongooseToObject(user),
            });
          }
        })
        .catch();
    } else {
      res.redirect("/auth");
    }
  },

  // [POST] /dashboard/news/store
  newsStore: function (req, res) {
    const newMangentment = new NewsMangentment(req.body);
    newMangentment.save(function () {
      res.redirect("/dashboard/news");
    });
  },

  // [GET] /dashboard/news
  news: function (req, res, next) {
    if (req.session && req.session.user) {
      // Check if session exists
      // lookup the user in the DB by pulling their email from the session
      Promise.all([
        NewsMangentment.find({}),
        User.findOne({ email: req.session.user.email }),
      ])
        .then(([news, user]) => {
          if (!user) {
            // if the user isn't found in the DB, reset the session info and
            // redirect the user to the login page
            req.session.reset();
            res.redirect("/auth");
          } else {
            // expose the user to the template
            res.locals.user = user;

            // render the dashboard page
            res.render("dashboard/news-management/news", {
              news: multipleMongooseToObject(news),
              user: mongooseToObject(user),
            });
          }
        })
        .catch();
    } else {
      res.redirect("/auth");
    }
  },

  // [GET] /dashboard/news/:id/edit
  newsEdit: function (req, res) {
    Promise.all([
      NewsMangentment.findById(req.params.id),
      User.findOne({}),
      CategoryManagement.find({}),
    ]).then(([news, user, category]) =>
      res.render("dashboard/news-management/news-edit", {
        news: mongooseToObject(news),
        user: mongooseToObject(user),
        category: multipleMongooseToObject(category),
      })
    );
  },

  // [DELETE] /dashboard/news/:id/force
  newsForce: function (req, res) {
    NewsMangentment.deleteOne({ _id: req.params.id }, req.body, function () {
      res.redirect("back");
    });
  },

  // [PUT] /dashboard/news-management/:id
  newsUpdate: function (req, res) {
    NewsMangentment.updateOne({ _id: req.params.id }, req.body, function () {
      res.redirect("/dashboard/news");
    });
  },

  // [GET] /dashboard/car/create
  carCreate: function (req, res) {
    // User.findOne({}, function (error, user) {
    //   res.render("dashboard/car-management/car-create", {
    //     user: mongooseToObject(user),
    //   });
    // });
    Promise.all([User.findOne({}), User.find({})]).then(([user, userAll]) =>
      res.render("dashboard/car-management/car-create", {
        user: mongooseToObject(user),
        userAll: multipleMongooseToObject(userAll),
      })
    );
  },

  // [POST] /dashboard/car/store
  carStore: function (req, res) {
    const car = new CarManagement(req.body);
    car.save().then((result) => {
      User.updateOne(
        { _id: req.body.user },
        { $push: { carmanagement: result._id } },
        { upsert: true }
      ).then(function () {
        res.redirect("/dashboard/car");
      });
    });
  },

  // [GET] /dashboard/car/:id/edit
  carEdit: function (req, res) {
    Promise.all([
      CarManagement.findById(req.params.id),
      User.findOne({ email: req.session.user.email }),
      User.find({}),
    ]).then(([car, user, userAll]) => {
      if (!user) {
        // if the user isn't found in the DB, reset the session info and
        // redirect the user to the login page
        req.session.reset();
        res.redirect("/auth");
      } else if (user.role === 0 || user.role === 2) {
        // expose the user to the template
        res.locals.user = user;

        // render the dashboard page
        res.render("dashboard/car-management/car-edit", {
          car: mongooseToObject(car),
          user: mongooseToObject(user),
          userAll: multipleMongooseToObject(userAll),
        });
      } else {
        req.session.reset();
        res.redirect("/auth");
      }
    });
  },

  // [PUT] /dashboard/car-management/:id
  carUpdate: function (req, res) {
    CarManagement.updateOne({ _id: req.params.id }, req.body, function () {
      res.redirect("/dashboard/car");
    });
  },

  // [GET] /dashboard/car
  car: function (req, res) {
    Promise.all([
      CarManagement.find({}),
      User.findOne({ email: req.session.user.email }),
    ]).then(([car, user]) => {
      if (!user) {
        // if the user isn't found in the DB, reset the session info and
        // redirect the user to the login page
        req.session.reset();
        res.redirect("/auth");
      } else if (user.role === 0) {
        // expose the user to the template
        res.locals.user = user;

        // render the dashboard page
        res.render("dashboard/car-management/car", {
          car: multipleMongooseToObject(car),
          user: mongooseToObject(user),
        });
      } else if (user.role === 2) {
        let userCarManagement = user.carmanagement;
        CarManagement.findById(userCarManagement).then((car) => {
          res.render("dashboard/car-management/car", {
            user: mongooseToObject(user),
            car: mongooseToObject(car),
          });
        });
      } else {
        req.session.reset();
        res.redirect("/auth");
      }
    });
  },

  // [GET] /dashboard/car/:id/detail
  carDetail: function (req, res) {
    Promise.all([
      CarManagement.findById({ _id: req.params.id })
        .populate("busschedule")
        .populate("user"),
      User.findOne({ email: req.session.user.email }),
    ]).then(([car, user]) => {
      if (!user) {
        // if the user isn't found in the DB, reset the session info and
        // redirect the user to the login page
        req.session.reset();
        res.redirect("/auth");
      } else if (user.role === 0 || user.role === 2) {
        // expose the user to the template
        res.locals.user = user;

        // render the dashboard page
        res.render("dashboard/car-management/car-detail", {
          car: mongooseToObject(car),
          user: mongooseToObject(user),
          bus: multipleMongooseToObject(car.busschedule),
          usermanagement: mongooseToObject(car.user),
        });
      } else {
        req.session.reset();
        res.redirect("/auth");
      }
    });
  },

  // [DELETE] /dashboard/car/:id/force
  carForce: function (req, res) {
    CarManagement.deleteOne({ _id: req.params.id }, req.body, function () {
      res.redirect("back");
    });
  },

  // [GET] /dashboard/category/create
  categoryCreate: function (req, res) {
    User.findOne({}, function (error, user) {
      res.render("dashboard/category-management/category-create", {
        user: mongooseToObject(user),
      });
    });
  },

  // [POST] /dashboard/category/store
  categoryStore: function (req, res) {
    const category = new CategoryManagement(req.body);
    category.save(function () {
      //res.redirect("/dashboard/category");
      res.json({ status: "Success", redirect: "/dashboard/category" });
    });
  },

  // [GET] /dashboard/category
  category: function (req, res) {
    Promise.all([User.findOne({}), CategoryManagement.find({})]).then(
      ([user, category]) =>
        res.render("dashboard/category-management/category", {
          user: mongooseToObject(user),
          category: multipleMongooseToObject(category),
        })
    );
  },

  // [GET] /dashboard/category/:id/edit
  categoryEdit: function (req, res) {
    Promise.all([
      User.findOne({}),
      CategoryManagement.findById(req.params.id),
    ]).then(([user, category]) =>
      res.render("dashboard/category-management/category-edit", {
        user: mongooseToObject(user),
        category: mongooseToObject(category),
      })
    );
  },

  // [PUT] /dashboard/category-management/:id
  categoryUpdate: function (req, res) {
    CategoryManagement.updateOne({ _id: req.params.id }, req.body, function () {
      res.redirect("/dashboard/category");
    });
  },

  // [DELETE] /dashboard/category/:id/force
  categoryForce: function (req, res) {
    CategoryManagement.deleteOne({ _id: req.params.id }, req.body, function () {
      res.redirect("back");
    });
  },

  // [GET] /dashboard/profile/:id/detail
  profile: function (req, res) {
    User.findById(req.params.id, function (error, user) {
      res.render("dashboard/profile/profile", {
        user: mongooseToObject(user),
      });
    });
  },

  // [PUT] /dashboard/profile/:id
  profileUpdate: function (req, res) {
    User.updateOne({ _id: req.params.id }, req.body, function () {
      res.redirect("back");
    });
  },

  // [GET] /dashboard/startend/create
  startendCreate: function (req, res) {
    User.findOne({}, function (error, user) {
      res.render("dashboard/startend-management/startend-create", {
        user: mongooseToObject(user),
      });
    });
  },

  // [POST] /dashboard/startend/store
  startendStore: function (req, res) {
    const startend = new StartendManagement(req.body);
    startend.save(function () {
      res.redirect("/dashboard/startend");
    });
  },

  // [GET] /dashboard/startend
  startend: function (req, res) {
    Promise.all([User.findOne({}), StartendManagement.find({})]).then(
      ([user, startend]) =>
        res.render("dashboard/startend-management/startend", {
          user: mongooseToObject(user),
          startend: multipleMongooseToObject(startend),
        })
    );
  },

  // [GET] /dashboard/startend/:id/edit
  startendEdit: function (req, res) {
    Promise.all([
      User.findOne({}),
      StartendManagement.findById(req.params.id),
    ]).then(([user, startend]) =>
      res.render("dashboard/startend-management/startend-edit", {
        user: mongooseToObject(user),
        startend: mongooseToObject(startend),
      })
    );
  },

  // [PUT] /dashboard/startend-management/:id
  startendUpdate: function (req, res) {
    StartendManagement.updateOne({ _id: req.params.id }, req.body, function () {
      res.redirect("/dashboard/startend");
    });
  },

  // [DELETE] /dashboard/startend/:id/force
  startendForce: function (req, res) {
    StartendManagement.deleteOne({ _id: req.params.id }, req.body, function () {
      res.redirect("back");
    });
  },

  // [GET] /dashboard/station/create
  stationCreate: function (req, res) {
    User.findOne({}, function (error, user) {
      res.render("dashboard/station-management/station-create", {
        user: mongooseToObject(user),
      });
    });
  },

  // [POST] /dashboard/station/store
  stationStore: function (req, res) {
    const station = new StationManagement(req.body);
    station.save(function () {
      res.redirect("/dashboard/station");
    });
  },

  // [GET] /dashboard/station
  station: function (req, res) {
    Promise.all([User.findOne({}), StationManagement.find({})]).then(
      ([user, station]) =>
        res.render("dashboard/station-management/station", {
          user: mongooseToObject(user),
          station: multipleMongooseToObject(station),
        })
    );
  },

  // [GET] /dashboard/station/:id/edit
  stationEdit: function (req, res) {
    Promise.all([
      User.findOne({}),
      StationManagement.findById(req.params.id),
    ]).then(([user, station]) =>
      res.render("dashboard/station-management/station-edit", {
        user: mongooseToObject(user),
        station: mongooseToObject(station),
      })
    );
  },

  // [PUT] /dashboard/station-management/:id
  stationUpdate: function (req, res) {
    StationManagement.updateOne({ _id: req.params.id }, req.body, function () {
      res.redirect("/dashboard/station");
    });
  },

  // [DELETE] /dashboard/startend/:id/force
  stationForce: function (req, res) {
    StationManagement.deleteOne({ _id: req.params.id }, req.body, function () {
      res.redirect("back");
    });
  },

  // [GET] /dashboard/customers
  customer: function (req, res, next) {
    if (req.session && req.session.user) {
      // Check if session exists
      // lookup the user in the DB by pulling their email from the session
      Promise.all([
        CustomerManagement.find({}),
        User.findOne({ email: req.session.user.email }),
      ])
        .then(([customer, user]) => {
          if (!user) {
            // if the user isn't found in the DB, reset the session info and
            // redirect the user to the login page
            req.session.reset();
            res.redirect("/auth");
          } else {
            // expose the user to the template
            res.locals.user = user;

            // render the dashboard page
            res.render("dashboard/customer-management/customer", {
              customer: multipleMongooseToObject(customer),
              user: mongooseToObject(user),
            });
          }
        })
        .catch();
    } else {
      res.redirect("/auth");
    }
  },

  // [GET] /dashboard/customers/create
  customerCreate: function (req, res) {
    if (req.session && req.session.user) {
      // Check if session exists
      // lookup the user in the DB by pulling their email from the session
      Promise.all([
        BusSchedule.find({}),
        User.findOne({ email: req.session.user.email }),
      ])
        .then(([listbusschedules, user]) => {
          if (!user) {
            // if the user isn't found in the DB, reset the session info and
            // redirect the user to the login page
            req.session.reset();
            res.redirect("/auth");
          } else {
            // expose the user to the template
            res.locals.user = user;

            // render the dashboard page
            res.render("dashboard/customer-management/customer-create", {
              listbusschedules: multipleMongooseToObject(listbusschedules),
              user: mongooseToObject(user),
            });
          }
        })
        .catch();
    } else {
      res.redirect("/auth");
    }
  },

  // [POST] /dashboard/customers/store
  customerStore: function (req, res) {
    const customer = new CustomerManagement(req.body);
    //console.log(customer);
    customer.save().then((result) => {
      BusSchedule.updateOne(
        { _id: req.body.busschedule },
        {
          $push: {
            customers: result._id,
            customerpickedseats: req.body.pickedseats,
          },
        },
        { upsert: true }
      ).then(function () {
        //console.log(result._id);
        res.redirect("/dashboard/customers");
        //res.json({ status: "Success", redirect: `/info/${result._id}` });
      });
    });
  },

  // [GET] /dashboard/customers/:id/detail
  customerDetail: function (req, res) {
    if (req.session && req.session.user) {
      // Check if session exists
      Promise.all([
        CustomerManagement.findById(req.params.id),
        User.findOne({ email: req.session.user.email }),
      ])
        .then(([customer, user]) => {
          if (!user) {
            // if the user isn't found in the DB, reset the session info and
            // redirect the user to the login page
            req.session.reset();
            res.redirect("/auth");
          } else {
            // expose the user to the template
            res.locals.user = user;
            BusSchedule.findById(customer.busschedule).then((busSchedule) => {
              CarManagement.findById(busSchedule.cartype).then((carType) => {
                res.render("dashboard/customer-management/customer-detail", {
                  customer: mongooseToObject(customer),
                  user: mongooseToObject(user),
                  busSchedule: mongooseToObject(busSchedule),
                  carType: mongooseToObject(carType),
                });
              });
            });
          }
        })
        .catch();
    } else {
      res.redirect("/auth");
    }
  },

  // [DELETE] /dashboard/customer/:id/force
  customerForce: function (req, res) {
    CustomerManagement.deleteOne({ _id: req.params.id }, req.body, function () {
      res.redirect("back");
    });
  },

  // [GET] /dashboard/logout
  logout: function (req, res) {
    req.session.reset();
    res.redirect("/auth");
  },

  // [GET] /dashboard/accounts
  accounts: function (req, res, next) {
    if (req.session && req.session.user) {
      // Check if session exists
      // lookup the user in the DB by pulling their email from the session
      Promise.all([
        User.find({}),
        User.findOne({ email: req.session.user.email }),
      ])
        .then(([account, user]) => {
          if (!user) {
            // if the user isn't found in the DB, reset the session info and
            // redirect the user to the login page
            req.session.reset();
            res.redirect("/auth");
          } else {
            // expose the user to the template
            res.locals.user = user;

            // render the dashboard page
            res.render("dashboard/account-management/account", {
              account: multipleMongooseToObject(account),
              user: mongooseToObject(user),
            });
          }
        })
        .catch();
    } else {
      res.redirect("/auth");
    }
  },

  // [GET] /dashboard/accounts/create
  accountsCreate: function (req, res) {
    User.findOne({}, function (error, user) {
      res.render("dashboard/account-management/account-create", {
        user: mongooseToObject(user),
      });
    });
  },

  // [POST] /dashboard/accounts/store
  accountsStore: function (req, res) {
    let reqBody = req.body;
    let passwordBody = md5(reqBody.password);
    let newUser = {
      ...reqBody,
      password: passwordBody,
    };
    //console.log(newUser);
    const user = new User(newUser);
    user.save(function () {
      res.redirect("/dashboard/accounts");
    });
  },

  // [GET] /dashboard/accounts/:id/detail
  accountsDetail: function (req, res) {
    User.findOne({ email: req.session.user.email }).then((user) => {
      if (!user) {
        // if the user isn't found in the DB, reset the session info and
        // redirect the user to the login page
        req.session.reset();
        res.redirect("/auth");
      } else if (user.role === 0) {
        // expose the user to the template
        res.locals.user = user;

        // render the dashboard page
        User.findById(req.params.id, function (error, userDetail) {
          res.render("dashboard/account-management/account-detail", {
            user: mongooseToObject(user),
            userDetail: mongooseToObject(userDetail),
          });
        });
      } else {
        res.redirect("/auth");
      }
    });
  },

  // [DELETE] /dashboard/accounts/:id/force
  accountsForce: function (req, res) {
    User.deleteOne({ _id: req.params.id }, req.body, function () {
      res.redirect("back");
    });
  },

  // [GET] /dashboard/ticket-check
  ticketCheck: function (req, res) {
    if (req.session && req.session.user) {
      // Check if session exists
      // lookup the user in the DB by pulling their email from the session
      Promise.all([
        User.find({}),
        User.findOne({ email: req.session.user.email }),
      ])
        .then(([account, user]) => {
          if (!user) {
            // if the user isn't found in the DB, reset the session info and
            // redirect the user to the login page
            req.session.reset();
            res.redirect("/auth");
          } else {
            // expose the user to the template
            res.locals.user = user;

            // render the dashboard page
            res.render("dashboard/ticket-check/ticket-check", {
              user: mongooseToObject(user),
            });
          }
        })
        .catch();
    } else {
      res.redirect("/auth");
    }
  },
};
