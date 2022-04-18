const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customerSchema = new Schema(
  {
    fullname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, require: true },
    busschedule: {
      type: Schema.Types.ObjectId,
      ref: "BusSchedule",
    },
    pickedseats: { type: Array, required: true },
    cartype: {
      type: Schema.Types.ObjectId,
      ref: "Car",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", customerSchema);
