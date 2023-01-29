const express = require("express");
const router = express.Router();

// Site Controller
const siteController = require("../app/controllers/site.controller");

router.get("/", siteController.index);
router.get("/news/:slug", siteController.newsDetail);
router.get("/search-ticket", siteController.searchTicket);
router.post("/search-ticket/store", siteController.searchTicketStore);
router.get("/info/:id", siteController.bookingInfo);
router.post("/payment", siteController.payment);
//router.post("/payment-finish", siteController.paymentFinish);
router.get("/payment-finish", siteController.paymentFinish);

module.exports = router;
