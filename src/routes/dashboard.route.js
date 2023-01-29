const express = require("express");
const dashboardController = require("../app/controllers/dashboard.controller");
const router = express.Router();

// Dashboard Controller
const dashBoardController = require("../app/controllers/dashboard.controller");

router.get("/", dashBoardController.index);

// Bus Schedule Router
router.get("/bus-schedule", dashBoardController.busSchedule);
router.get("/bus-schedule/:id/edit", dashBoardController.busScheduleEdit);
router.put("/bus-schedule/:id", dashBoardController.busScheduleUpdate);
router.get("/bus-schedule/create", dashBoardController.busScheduleCreate);
router.post("/bus-schedule/store", dashBoardController.busScheduleStore);
router.get("/bus-schedule/:id/detail", dashBoardController.busScheduleDetail);
router.delete("/bus-schedule/:id/force", dashBoardController.busScheduleForce);

// News Router
router.get("/news", dashBoardController.news);
router.get("/news/create", dashBoardController.newsCreate);
router.post("/news/store", dashBoardController.newsStore);
router.get("/news/:id/edit", dashBoardController.newsEdit);
router.put("/news/:id", dashBoardController.newsUpdate);
router.delete("/news/:id/force", dashBoardController.newsForce);

// Car Router
router.get("/car", dashBoardController.car);
router.get("/car/create", dashBoardController.carCreate);
router.post("/car/store", dashBoardController.carStore);
router.get("/car/:id/edit", dashBoardController.carEdit);
router.put("/car/:id", dashBoardController.carUpdate);
router.delete("/car/:id/force", dashBoardController.carForce);
router.get("/car/:id/detail", dashBoardController.carDetail);

// Category Router
router.get("/category", dashBoardController.category);
router.get("/category/create", dashBoardController.categoryCreate);
router.post("/category/store", dashBoardController.categoryStore);
router.get("/category/:id/edit", dashBoardController.categoryEdit);
router.put("/category/:id", dashBoardController.categoryUpdate);
router.delete("/category/:id/force", dashBoardController.categoryForce);

// Starend Router
router.get("/startend", dashBoardController.startend);
router.get("/startend/create", dashBoardController.startendCreate);
router.post("/startend/store", dashBoardController.startendStore);
router.get("/startend/:id/edit", dashBoardController.startendEdit);
router.put("/startend/:id", dashBoardController.startendUpdate);
router.delete("/startend/:id/force", dashBoardController.startendForce);

// Station Router
router.get("/station", dashBoardController.station);
router.get("/station/create", dashBoardController.stationCreate);
router.post("/station/store", dashBoardController.stationStore);
router.get("/station/:id/edit", dashBoardController.stationEdit);
router.put("/station/:id", dashBoardController.stationUpdate);
router.delete("/station/:id/force", dashBoardController.stationForce);

// Profile Router
router.get("/profile/:id/detail", dashBoardController.profile);
router.put("/profile/:id", dashBoardController.profileUpdate);

// Customer Router
router.get("/customers", dashBoardController.customer);
router.get("/customer/create", dashBoardController.customerCreate);
router.post("/customer/store", dashBoardController.customerStore);
router.get("/customer/:id/detail", dashBoardController.customerDetail);
router.delete("/customer/:id/force", dashBoardController.customerForce);

// Logout
router.get("/logout", dashBoardController.logout);

// Accounts Router
router.get("/accounts", dashBoardController.accounts);
router.get("/accounts/create", dashBoardController.accountsCreate);
router.post("/accounts/store", dashBoardController.accountsStore);
router.get("/accounts/:id/detail", dashBoardController.accountsDetail);
router.delete("/accounts/:id/force", dashBoardController.accountsForce);

// Ticket Check
router.get("/ticket-check", dashboardController.ticketCheck);

module.exports = router;
