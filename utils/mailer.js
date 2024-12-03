const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

const {
  emailVerifyTemplate,
  forgotPasswordTemplate,
  loginCredentialsTemplate,
  profileUpdateTemplate,
  createPasswordTemplate,
  emailChangeTemplate,
  updatePasswordTemplate,
  emailOTPTemplate,
  orderConfirmTemplate,
  sslCommerzeOrderTemplate,
  contactUsMailTemplate,
  customerOrderPlaceNotificationVendorTemplate,
  orderUpdateStatusForCustomTemplate,
  orderCreateFailedEmailTemplate,
  orderAdminOrderEmailTemplate,
} = require("../templates/email");

const Vendor = require("../models/Vendor");
const Order = require("../models/Order");
const { getMin0Number } = require("./stringsNymber");

// Utility: Set up transporter
const setTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

// Utility: Generate item data
const generateItemData = (items = [], priceField = "") =>
  items.map((item) => {
    const quantity = Math.max(1, getMin0Number(item.quantity));
    const price = getMin0Number(
      item?.variantSnapshot
        ? item?.variantSnapshot?.pricing[priceField]
        : item?.productSnapshot?.pricing[priceField]
    );
    const variant = item?.variantSnapshot?.variantName || null;
    const totalPrice = quantity * price;
    const productName = item?.productSnapshot?.name;
    const discount =
      quantity *
      getMin0Number(
        item?.variantSnapshot
          ? item?.variantSnapshot?.pricing?.discount
          : item.productSnapshot?.pricing?.discount
      );

    return {
      item: productName,
      quantity,
      variant,
      discount,
      price: `TK. ${price.toLocaleString()}`,
      totalPrice: `TK. ${getMin0Number(totalPrice).toLocaleString()}`,
    };
  });

// Utility: Send email
const sendMail = async (
  to,
  subject,
  html,
  from = `"Strikeo" <${process.env.SMTP_USER}>`
) => {
  const transporter = setTransporter();
  const msg = { to, from, subject, html };

  try {
    await transporter.sendMail(msg);
    console.log(`Email sent: ${subject}`);
  } catch (error) {
    console.error(`Failed to send email (${subject}):`, error.message);
  }
};

// Utility: Select template
const selectTemplate = (user, body, subject) => {
  switch (true) {
    case !!body.emailOTP:
      return emailOTPTemplate(user, subject);
    case !!body.verifyEmail:
      return emailVerifyTemplate(user);
    case !!body.forgotPassword:
      return forgotPasswordTemplate(user);
    case !!body.loginCredentials:
      return loginCredentialsTemplate(user);
    case !!body.updateProfile:
      return profileUpdateTemplate(user, body.newPass);
    case !!body.createPassword:
      return createPasswordTemplate(user);
    case !!body.changeEmail:
      return emailChangeTemplate(user);
    case !!body.updatePassword:
      return updatePasswordTemplate(user);
    default:
      console.error("Invalid email template body:", body);
      return null;
  }
};

// Function 1: Send general emails
const sendEmail = async (user, subject, body) => {
  const html = selectTemplate(user, body, subject);
  if (!html) return;

  const recipient = user?.email || user?.contact?.email;
  await sendMail(recipient, subject, html);
};

// Function 2: Confirm order
const confirmOrder = async (user, cart, userEmail, shippingCost) => {
  const data = generateItemData(cart.items, "salePrice");
  const html = orderConfirmTemplate(
    data,
    user,
    cart.bill,
    getMin0Number(shippingCost)
  );
  await sendMail(userEmail, "Order Confirmation", html);
};

// Function 3: Notify vendor about order
const vendorUserOrderNotification = async (
  orderNo,
  items,
  vendorEmail,
  vendorBill
) => {
  const data = generateItemData(items, "costPrice");
  const html = customerOrderPlaceNotificationVendorTemplate(
    data,
    vendorBill,
    orderNo
  );
  await sendMail(vendorEmail, `New Order : ${orderNo}`, html);
};

// Function 4: Notify customer about order status
const customerOrderStatusNotification = async (
  orderNo,
  items,
  userEmail,
  bill,
  status,
  shippingDetails
) => {
  const data = generateItemData(items, "salePrice");
  const html = orderUpdateStatusForCustomTemplate(
    data,
    orderNo,
    bill,
    status,
    shippingDetails
  );
  await sendMail(userEmail, `Order Status : Order No.- ${orderNo}`, html);
};

// Function 5: Notify admin about order
const orderAdminNotification = async (info) => {
  const { orderNumber, items } = info;

  const userOrderData = generateItemData(items, "salePrice");
  const vendorOrderData = generateItemData(items, "costPrice");
  const html = orderAdminOrderEmailTemplate(
    info,
    userOrderData,
    vendorOrderData
  );

  await sendMail(
    process.env.SMTP_USER,
    `Order Status : Order No.- ${orderNumber}`,
    html
  );
};

// Function 6: Handle order creation failure notification
const handleOrderCreateFailedNotify = async (email, removedMessage) => {
  const { failureReason = "N/A", items = [], message = "N/A" } = removedMessage;

  const data = generateItemData(items, "salePrice");
  const html = orderCreateFailedEmailTemplate({
    title: "Order Failed",
    subTitle: `<strong>${message}</strong>`,
    reason: `<strong>Reason:</strong> ${failureReason}`,
    orders: data,
  });

  await sendMail(email, "Order Creation Failed", html);
};

// Function 7: SSLCommerz notification
const sslczNotification = async (content, userEmail) => {
  if (!userEmail) {
    console.info("No target email for SSLCommerz notification");
    return;
  }
  const html = sslCommerzeOrderTemplate(content);
  await sendMail(userEmail, "SSLCommerz Transaction", html);
};

// Function 8: Send Contact Us email
const sendContactUsEmail = async ({ name, email, phone, message }) => {
  const data = { name, email, phone, message };
  const html = contactUsMailTemplate(data);

  await sendMail(
    process.env.SMTP_USER,
    "New Contact Us Form Submission",
    html,
    `"${name}" <${email}>`
  );
};

// Function 9: Handle notifications after payment and order completion
const handleEmailAfterPaymentAndOrderDone = async (data) => {
  const { orders, customer } = data;

  await Promise.all(
    orders.map(async (o) => {
      const order = await Order.findById(o._id);
      const {
        items,
        company,
        vendorBill,
        customerBill,
        shippingDetails,
        orderNumber,
      } = order;

      const vendor = await Vendor.findOne({ company });
      const vendorEmail = vendor?.contact?.email;

      await vendorUserOrderNotification(
        orderNumber,
        items,
        vendorEmail,
        vendorBill
      );
      await customerOrderStatusNotification(
        orderNumber,
        items,
        customer.email,
        customerBill,
        "Confirmed",
        shippingDetails
      );

      const adminInfo = {
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
        customerBill,
        shippingDetails,
        vendorName: `${vendor.firstName} ${vendor.lastName}`,
        vendorEmail,
        orderNumber,
        vendorBill,
        items,
        status: "Confirmed",
      };

      await orderAdminNotification(adminInfo);
    })
  );
};

// Function 10: Handle order errors and notify
const handleOrderErrorsAndNotify = async (email, removedMessages = []) => {
  if (!email || removedMessages.length === 0) {
    console.log("No email or error messages to notify.");
    return;
  }

  const bodySections = removedMessages.map(
    ({ message, items = [] }) =>
      `<strong>${message}</strong><br/>${items
        ?.map(
          (item, i) =>
            `${i + 1}. <b>Name:</b>${item?.name} <b>Price:</b>${item?.price}`
        )
        .join("<br/>")}`
  );
  const html = `<p>${bodySections.join("<br/>")}</p>`;
  await sendMail(email, "Update on Your Order", html);
};

module.exports = {
  sendEmail,
  confirmOrder,
  sslczNotification,
  sendContactUsEmail,
  handleOrderErrorsAndNotify,
  handleOrderCreateFailedNotify,
  vendorUserOrderNotification,
  customerOrderStatusNotification,
  handleEmailAfterPaymentAndOrderDone,
  orderAdminNotification,
};
