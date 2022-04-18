const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: { type: String, unique: true, required: true, trim: true },
    username: { type: String, required: true, trim: true, minlength: 2 },
    password: { type: String, required: true, minlength: 6 },
    // 0 = admin | 1 = nhan vien | 2 = lai xe
    role: { type: Number, required: true },
    carmanagement: {
      type: Schema.Types.ObjectId,
      ref: "Car",
    },
    lastlogin: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// userSchema.statics.login = function login(id, callback) {
//   return this.findByIdAndUpdate(
//     id,
//     { $set: { lastlogin: Date.now() } },
//     { upsert: true },
//     callback
//   );
// };

module.exports = mongoose.model("User", userSchema);
