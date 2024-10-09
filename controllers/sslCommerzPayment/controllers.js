// const SSLCommerzPayment = require("sslcommerz-lts");
const SslCommerzPayment = require("./payment.js");
const OkResponse = require("express-http-response/lib/http/OkResponse.js");
const BadRequestResponse = require("express-http-response/lib/http/BadRequestResponse.js");
const {
  STORE_ID: store_id,
  FRONTEND_URL,
  BACKEND_URL,
  STORE_PASSWORD: store_passwd,
  IS_LIVE,
} = process.env;
const { init, validate } = SslCommerzPayment(store_id, store_passwd, IS_LIVE);
const { v4: uuidv4 } = require("uuid");
const Payment = require("../../models/Payment.js");
const { captureTransaction } = require("./transactionHandler.js");
const { tranStatusFormat } = require("./initDataProcess.js");
const Cart = require("../../models/Cart.js");
const { cartFormatForSelectedItems } = require("../../utils/Cart.js");
const { sslczNotification } = require("../../utils/mailer.js");
const { handleTransactionProcessNotify } = require("../../utils/Order.js");
// const dummyTranId = "SSLCZ_TEST_59bd349436a7k"; //change its last char if id already taken
const getPaymentOrder = async (paymentId) => {
  return await Payment.findOne({ paymentId }).populate({
    path: "orders",
    select: "orderNumber",
  });
};

exports.init = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    country,
    address,
    city,
    state,
    zipCode,
    phone,
    bill,
    productNames,
    noOfItems,
    cart,
  } = req.body;

  const data = {
    cart,
    total_amount: bill,
    currency: "BDT",
    tran_id: `sslcz-${uuidv4()}`, // use unique tran_id for each api call
    success_url: `${BACKEND_URL}/api/payment/success`,
    fail_url: `${BACKEND_URL}/api/payment/fail`,
    cancel_url: `${BACKEND_URL}/api/payment/cancel`,
    // ipn_url: `https://a851-116-90-112-192.ngrok-free.app/api/payment/ipn_listener`,
    shipping_method: "NO",
    product_name: productNames,
    num_of_item: noOfItems,
    product_category: "Electronic",
    product_profile: "general",
    cus_name: `${firstName} ${lastName}`,
    cus_email: email,
    cus_add1: address,
    cus_add2: address,
    cus_city: city,
    cus_state: state,
    cus_postcode: zipCode,
    cus_country: country,
    cus_phone: phone,
    // cus_fax: phone,
    // ship_name: `${firstName} ${lastName}`,
    // ship_add1: address,
    // ship_add2: address,
    // ship_city: city,
    // ship_state: state,
    // ship_postcode: zipCode,
    // ship_country: country,
  };

  try {
    if (!req?.user?.id) {
      return next(new BadRequestResponse("User not found"));
    }
    const cart = await Cart.findOne({ owner: req.user.id });
    if (!cart) {
      return next(new BadRequestResponse("Cart not found"));
    }
    if (cart?.items?.length === 0) {
      return next(new BadRequestResponse("Cart is empty"));
    }

    const { selectedItems = [] } = await cartFormatForSelectedItems(
      JSON.parse(JSON.stringify(cart))
    );

    if (selectedItems?.length <= 0) {
      return next(
        new BadRequestResponse("Selected items not found in your cart")
      );
    }

    const result = await init(data);
    if (result?.status?.toLowerCase() === "success" && result?.sessionkey) {
      const payment = new Payment({
        paymentId: data.tran_id,
        customer: req.user.id,
        amount: bill,
        method: "sslCommerz",
        currency: data.currency,
      });

      await payment.save();
      let GatewayPageURL = result?.GatewayPageURL;
      return next(new OkResponse({ GatewayPageURL }));
    } else {
      return next(
        new BadRequestResponse(
          "Failed to initiate payment: " + result?.failedreason
        )
      );
    }
  } catch (error) {
    console.log(error);
    return next(
      new BadRequestResponse(error?.message || "Something went wrong")
    );
  }
};

exports.validate = async (req, res, next) => {
  try {
    const result = await validate(req.body);
    return next(new OkResponse(result));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

exports.ipn_listener = async (req, res, next) => {
  console.log("ipn_Payload=>", req?.body);

  try {
    if (Object.keys(req?.body).length === 0) {
      console.log("IPN_Payload is empty => ", req?.body);
      return next(new BadRequestResponse("IPN_Payload is empty"));
    }

    const data = await validate(req.body);
    console.log("validated_Payload=>", data);
    // if (!tranStatusFormat(data?.status)) {
    //   console.log("IPN_Payload status is not valid => ", data?.status);
    //   return next(new BadRequestResponse("IPN_Payload status is not valid"));
    // }

    data.email_status = tranStatusFormat(data?.status)
      ? "Successfull"
      : String(req?.body?.status)
          .split(" ")
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ");

    await captureTransaction(data, req?.body)
      .then((result) => {
        return next(new OkResponse(result));
      })
      .catch((error) => {
        console.log("Transaction capture failed => ", error);
        handleTransactionProcessNotify(req.body).finally(() => {
          return next(
            new BadRequestResponse(
              "Transaction capture failed: " + error?.message
            )
          );
        });
      });
  } catch (validationError) {
    console.log("sslCommerz payload failed to validate => ", validationError);
    return next(
      new BadRequestResponse(
        "sslCommerz payload failed to validate: " + validationError?.message
      )
    );
  }
};

exports.success = async (req, res, next) => {
  console.log(`Payemnt Success with transaction id => ${req?.body?.tran_id}`);
  const data = await getPaymentOrder(req?.body?.tran_id);
  const orderNumber = data?.orders.map((o) => `${o?.orderNumber}`);
  // if (!orderNumber) {
  //   return res.redirect(
  //     `${FRONTEND_URL}/checkout/payment/failed?tran_id=${req?.body?.tran_id}&amount=${req?.body?.amount}&order=${orderNumber}`
  //   );
  // }
  return res.redirect(
    `${FRONTEND_URL}/checkout/payment/success?tran_id=${req?.body?.tran_id}&amount=${req?.body?.amount}&orders=${orderNumber}`
  );
};

exports.fail = async (req, res, next) => {
  console.log(`Payemnt Failed`, req?.body?.tran_id);
  return res.redirect(`${FRONTEND_URL}/checkout/payment/failed`);
};
exports.cancel = async (req, res, next) => {
  console.log(`Payemnt Canceled`, req?.body?.tran_id);
  return res.redirect(`${FRONTEND_URL}/checkout/payment/cancel`);
};
