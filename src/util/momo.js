const axios = require("axios");

module.exports = {
  momoPayGate: function (orderId, extraDataEncode, amount) {
    //https://developers.momo.vn/#/docs/en/aiov2/?id=payment-method
    //parameters
    var partnerCode = "MOMOG15V20211231";
    var accessKey = "kkLisyg0elw5wmLC";
    var secretkey = "vQr3sg9SJRw6RxRNIkO3mVrElC1ZckSu";
    var requestId = partnerCode + new Date().getTime();
    var orderId = orderId;
    var orderInfo = "pay with MoMo";
    var redirectUrl = "http://127.0.0.1:3000/payment-finish";
    var ipnUrl = "https://webhook.site/#!/eeec4170-624a-44df-9a1c-159637236e94";
    var amount = amount;
    var requestType = "captureWallet";
    var extraData = extraDataEncode; //pass empty value if your merchant does not have stores

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
