const User = require("../models/user.model");
const md5 = require("md5");

module.exports = {
  login: function (req, res) {
    res.render("auth/login");
  },
  postLogin: function (req, res) {
    User.findOne({ email: req.body.email }).exec(function (err, user) {
      if (err) {
        return err;
      } else if (!user) {
        res.render("auth/login", {
          err: ["Tài khoản không tồn tại"],
          values: req.body,
        });
        return;
      }
      var hashedPassword = md5(req.body.password);
      if (user.password !== hashedPassword) {
        res.render("auth/login", {
          err: ["Sai mật khẩu"],
          values: req.body,
        });
        return;
      }
      // var string = user._id;
      // res.redirect("/dashboard?data=" + string);
      req.session.user = user;
      var query = {
        email: req.body.email,
      };
      var update = {
        lastlogin: Date.now(),
      };
      var options = {
        new: true,
      };
      User.updateOne(query, update, options, function (err, user) {
        if (err) {
          console.log(err);
        }
      });
      res.redirect("/dashboard");
    });
  },
};
