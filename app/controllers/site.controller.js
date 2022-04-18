// Models
const BusSchedule = require("../models/busschdule.model");
const News = require("../models/new.model");
const Startend = require("../models/startend.model");
const CustomerManagement = require("../models/customer.model");

// Utils
const { mongooseToObject } = require("../../util/mongoose");
const { multipleMongooseToObject } = require("../../util/mongoose");
const { mongo } = require("mongoose");

const QRCode = require("qrcode");
const { momoPayGate } = require("../../util/momo");

module.exports = {
  index: function (req, res) {
    Promise.all([Startend.find({}), News.find({})]).then(([startend, news]) =>
      res.render("home", {
        startend: multipleMongooseToObject(startend),
        news: multipleMongooseToObject(news),
      })
    );
  },

  newsDetail: function (req, res) {
    Promise.all([News.find({}), News.findOne({ slug: req.params.slug })]).then(
      ([news, newsDetail]) =>
        res.render("news/news-detail", {
          news: multipleMongooseToObject(news),
          newsDetail: mongooseToObject(newsDetail),
        })
    );
  },

  searchTicket: function (req, res) {
    BusSchedule.find({
      startpoint: req.query.startpoint,
      endpoint: req.query.endpoint,
      tripdate: req.query.tripdate,
    })
      .populate("cartype")
      .then(function (busSchedule) {
        if (busSchedule) {
          //console.log(busSchedule);
          res.render("booking/schedule", {
            //busSchedule: mongooseToObject(busSchedule),
            busSchedule: multipleMongooseToObject(busSchedule),
            //car: mongooseToObject(busSchedule.cartype),
          });
        } else {
          res.render("booking/schedule", {
            busSchedule: mongooseToObject(busSchedule),
          });
        }
      });
  },

  searchTicketStore: function (req, res) {
    const busCustomer = new BusSchedule(req.body);
    busCustomer.save().then(function (result) {
      console.log(result);
    });
  },

  bookingInfo: async function (req, res) {
    // CustomerManagement.find()
    //   .sort({ _id: -1 })
    //   .limit(1)
    //   .then((data) => {
    //     res.render("booking/info", {
    //       data: multipleMongooseToObject(data),
    //     });
    //   });
    //console.log(req.params.id);
    CustomerManagement.findById(req.params.id).then((customer) => {
      //console.log(data);
      BusSchedule.findById(customer.busschedule)
        .populate("cartype")
        .then((bus) => {
          res.render("booking/info", {
            bus: mongooseToObject(bus),
            customer: mongooseToObject(customer),
            car: mongooseToObject(bus.cartype),
          });
        });
    });
  },

  // [POST] /dashboard/payment
  payment: function (req, res) {
    const customer = new CustomerManagement(req.body);
    let { _id, busschedule, fullname, email, phone, pickedseats } = customer;
    //console.log("id", _id);
    // console.log("bus", busschedule);
    momoPayGate(_id)
      .then((result) => {
        res.json({ status: "Success", redirect: result });
      })
      .then(() => {
        //console.log(req.body);
      });
    // customer.save().then((result) => {
    //   BusSchedule.updateOne(
    //     { _id: req.body.busschedule },
    //     {
    //       $push: {
    //         customers: result._id,
    //         customerpickedseats: req.body.pickedseats,
    //       },
    //     },
    //     { upsert: true }
    //   ).then(function () {
    //     //console.log(result._id);
    //     //res.redirect("/dashboard/bus-schedule");
    //     res.json({ status: "Success", redirect: `/info/${result._id}` });
    //   });
    // });
  },
  paymentFinish: function (req, res) {
    console.log(req);
    console.log(res);
  },
};
