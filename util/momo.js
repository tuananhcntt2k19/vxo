const axios = require("axios");

module.exports = {
  momoPayGate: function (orderId) {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    var partnerCode = "MOMOBDO720220418";
    var accessKey = "UuPeFqANIOtSsITj";
    var secretkey = "4N2LMrpO0TEUwkUQ4taI04azPTG0IbiZ";
    var requestId = partnerCode + new Date().getTime();
    var orderId = orderId;
    var orderInfo = "pay with MoMo";
    var redirectUrl =
      "https://webhook.site/eca7fadc-248c-433e-bdcf-b9274b54a9bd";
    //var ipnUrl = "http://127.0.0.1:3000/payment-finish";
    var ipnUrl = "https://webhook.site/eca7fadc-248c-433e-bdcf-b9274b54a9bd";
    // var ipnUrl = (redirectUrl =
    //   "https://webhook.site/eca7fadc-248c-433e-bdcf-b9274b54a9bd");
    var amount = "150000";
    var requestType = "captureWallet";
    var extraData = ""; //pass empty value if your merchant does not have stores

    //before sign HMAC SHA256 with format
    //accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
    var rawSignature =
      "accessKey=" +
      accessKey +
      "&amount=" +
      amount +
      "&extraData=" +
      extraData +
      "&ipnUrl=" +
      ipnUrl +
      "&orderId=" +
      orderId +
      "&orderInfo=" +
      orderInfo +
      "&partnerCode=" +
      partnerCode +
      "&redirectUrl=" +
      redirectUrl +
      "&requestId=" +
      requestId +
      "&requestType=" +
      requestType;
    //puts raw signature
    //console.log("--------------------RAW SIGNATURE----------------");
    //console.log(rawSignature);
    //signature
    const crypto = require("crypto");
    var signature = crypto
      .createHmac("sha256", secretkey)
      .update(rawSignature)
      .digest("hex");
    //console.log("--------------------SIGNATURE----------------");
    //console.log(signature);

    //json object send to MoMo endpoint
    const requestBody = JSON.stringify({
      partnerCode: partnerCode,
      accessKey: accessKey,
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: orderInfo,
      redirectUrl: redirectUrl,
      ipnUrl: ipnUrl,
      extraData: extraData,
      requestType: requestType,
      signature: signature,
      lang: "en",
    });

    const url = "https://test-payment.momo.vn/v2/gateway/api/create";

    return new Promise((resolve, reject) => {
      axios
        .post(url, requestBody, {
          headers: { "Content-Type": "application/json" },
        })
        .then((response) => {
          resolve(response.data.payUrl);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  },
};
