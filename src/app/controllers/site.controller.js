// Models
const BusSchedule = require("../models/busschdule.model");
const News = require("../models/new.model");
const Startend = require("../models/startend.model");
const CustomerManagement = require("../models/customer.model");

// Utils
const {
  mongooseToObject,
  multipleMongooseToObject,
} = require("../../util/mongoose");
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

  // [POST] /dashboard/payment
  payment: function (req, res) {
    const customer = new CustomerManagement(req.body);
    let { _id, busschedule, fullname, email, phone, pickedseats, cartype } =
      customer;
    let objData = {
      _id: _id.toString(),
      busschedule: busschedule.toString(),
      fullname,
      email,
      phone,
      pickedseats,
      cartype: cartype.toString(),
    };
    let amountBody = req.body.amount;
    let amount = amountBody.replace(/[, ]+/g, "");

    let stringObj = JSON.stringify(objData);
    let extraDataEncode = Buffer.from(stringObj).toString("base64");

    momoPayGate(_id, extraDataEncode, amount).then((result) => {
      res.json({ status: "Success", redirect: result });
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

  //
  paymentFinish: function (req, res) {
    //console.log(req.query);
    let extraDataDecode = Buffer.from(req.query.extraData, "base64").toString(
      "ascii"
    );
    let data = JSON.parse(`${extraDataDecode}`);

    if (data._id == req.query.orderId && req.query.resultCode == 0) {
      const customer = new CustomerManagement(data);
      customer.save().then((result) => {
        BusSchedule.updateOne(
          { _id: data.busschedule },
          {
            $push: {
              customers: result._id,
              customerpickedseats: data.pickedseats,
            },
          },
          { upsert: true }
        ).then(function () {
          //console.log(result._id);
          //res.redirect("/dashboard/bus-schedule");
          res.redirect(`info/${result._id}`);
        });
      });
      //console.log("true");
    } else {
      res.redirect("back");
    }
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
};
