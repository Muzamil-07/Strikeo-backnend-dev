const nodemailer = require("nodemailer");
const Mailgen = require("mailgen");

// const smtpAuth = require("../config").smtpAuth;

let {
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

const setTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

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
      console.log("Body Not Valid", body);
      return null;
  }
};

const sendEmail = (user, subject, body) => {
  try {
    const transporter = setTransporter();

    let template = "";
    template = selectTemplate(user, body, subject);

    // console.log("Template selcted", template);

    const msg = {
      to: user?.email || user?.contact?.email,
      // from: process.env.SMTP_USER,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject,
      html: template,
    };

    // console.log("MAIL CREDENTIALSSS", user, subject, body);

    transporter.sendMail(msg, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Email sent", subject);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

const confirmOrder = async (user, cart, userEmail, shippingCost) => {
  try {
    const transporter = setTransporter();
    const data = cart.items.map((item) => {
      const quantity = item.quantity;
      const price = item?.variantSnapshot
        ? item?.variantSnapshot?.pricing?.salePrice
        : item?.productSnapshot?.pricing?.salePrice;
      const variant = item?.variantSnapshot
        ? item?.variantSnapshot?.variantName
        : null;
      const totalPrice = quantity * price;
      const productName = item?.productSnapshot?.name;

      const discount =
        quantity *
        (item?.variantSnapshot
          ? item?.variantSnapshot?.pricing?.discount
          : item.productSnapshot?.pricing?.discount);

      return {
        item: productName,
        quantity,
        discount,
        price: `TK. ${price}`,
        variant,
        totalPrice: `TK. ${totalPrice}`,
      };
    });

    const bill = cart.bill;
    const msg = {
      to: userEmail,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject: "Order Confirmation",
      html: orderConfirmTemplate(data, user, bill, Number(shippingCost)),
    };

    transporter.sendMail(msg, (err, info) => {
      if (err) {
        console.log("While order confirm email sent=> ", err);
      } else {
        console.log("Email sent", info);
      }
    });
  } catch (error) {
    console.log(error);
  }
};
const vendorUserOrderNotification = async (
  orderNo,
  items,
  vendorEmail,
  vendorBill,
  shippingDetails
) => {
  try {
    const transporter = setTransporter();

    // Resolve all product details asynchronously using Promise.all
    const data = await Promise.all(
      items.map(async (item) => {
        const quantity = item.quantity;
        const price = item?.variantSnapshot
          ? item?.variantSnapshot?.pricing?.costPrice
          : item?.productSnapshot?.pricing?.costPrice;
        const variant = item?.variantSnapshot
          ? item?.variantSnapshot?.variantName
          : null;
        const totalPrice = quantity * price;
        const productName = item?.productSnapshot?.name;

        const discount =
          quantity *
          (item?.variantSnapshot
            ? item?.variantSnapshot?.pricing?.discount
            : item.productSnapshot?.pricing?.discount);
        return {
          item: productName,
          quantity,
          variant,
          discount,
          price: `TK. ${price}`,
          totalPrice: `TK. ${totalPrice}`,
        };
      })
    );

    const msg = {
      to: vendorEmail,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject: `New Order : ${orderNo}`,
      html: customerOrderPlaceNotificationVendorTemplate(
        data,
        vendorBill,
        shippingDetails,
        orderNo
      ),
    };

    await transporter.sendMail(msg);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};
const customerOrderStatusNotification = async (
  orderNo,
  items,
  userEmail,
  bill,
  status,
  shippingDetails
) => {
  try {
    const transporter = setTransporter();

    const data = await Promise.all(
      items.map(async (item) => {
        const quantity = item.quantity;
        const price = item?.variantSnapshot
          ? item?.variantSnapshot?.pricing?.salePrice
          : item?.productSnapshot?.pricing?.salePrice;
        const variant = item?.variantSnapshot
          ? item?.variantSnapshot?.variantName
          : null;
        const totalPrice = quantity * price;
        const productName = item?.productSnapshot?.name;

        const discount =
          quantity *
          (item?.variantSnapshot
            ? item?.variantSnapshot?.pricing?.discount
            : item.productSnapshot?.pricing?.discount);

        return {
          item: productName,
          quantity,
          price: `TK. ${price}`,
          discount,
          variant,
          totalPrice: `TK. ${totalPrice}`,
        };
      })
    );

    const msg = {
      to: userEmail,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject: `Order Status : Order No.- ${orderNo}`,
      html: orderUpdateStatusForCustomTemplate(
        data,
        orderNo,
        bill,
        status,
        shippingDetails
      ),
    };

    await transporter.sendMail(msg);

    ///Email Notification for Strikeo
    const msgForStrikeo = {
      to: process.env.SMTP_USER,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject: `Order Status : Order No.- ${orderNo}`,
      html: orderUpdateStatusForCustomTemplate(
        data,
        orderNo,
        bill,
        status,
        shippingDetails
      ),
    };

    await transporter.sendMail(msgForStrikeo);

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};

const sslczNotification = async (content, userEmail) => {
  try {
    if (!userEmail) {
      console.info("No target email found. for sslCommerz notification");
      return;
    }
    const transporter = setTransporter();

    const msg = {
      to: userEmail,
      // from: process.env.SMTP_USER,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject: "SSLCommerz Transaction",
      html: sslCommerzeOrderTemplate(content),
    };

    transporter.sendMail(msg, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log("SSLCommerz Transaction Email sent");
      }
    });
  } catch (error) {
    console.log("SSLCommerz Transaction Email failed to sent", error);
  }
};

const sendContactUsEmail = async ({ name, email, phone, message }) => {
  return new Promise((resolve, reject) => {
    try {
      const data = {
        name,
        email,
        phone,
        message,
      };
      const transporter = setTransporter();

      const msg = {
        to: process.env.SMTP_USER || "support@strikeo.com", // Send to support or relevant team
        from: `"${name}" <${email}>`,
        subject: "New Contact Us Form Submission",
        html: contactUsMailTemplate(data),
      };

      transporter.sendMail(msg, (err, info) => {
        if (err) {
          console.log(err);
          return reject(err); // Ensure rejection on error
        } else {
          console.log("Contact Us Form Submission Email sent", info);
          return resolve(info?.response); // Ensure resolution on success
        }
      });
    } catch (error) {
      console.log(error);
      return reject(error); // Ensure rejection on exception
    }
  });
};

const handleOrderErrorsAndNotify = async (email, removedMessages = []) => {
  if (!email || removedMessages.length === 0) {
    console.log("No email or error messages to send notifications for.");
    return;
  }

  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Strikeo",
      link: process.env.FRONTEND_URL,
    },
  });

  // Prepare email body sections
  const emailBodySections = removedMessages.map((removedMessage) => {
    const sectionTitle = `<strong>${removedMessage.message}</strong> <br/>`; // Make the message bold

    const listItems =
      removedMessage.items?.map(
        (item, i) =>
          `${i + 1}. <b>Name:</b> (${item?.name}) <b>Price:<b/> (${
            item?.price
          })`
      ) || [];

    return {
      sectionTitle, // Save section title
      listItems: listItems.join("<br/>"), // Join list items with a line break
    };
  });

  // Prepare email body
  const emailBody = {
    body: {
      title:
        "Hi! Thank you for your recent order with us. We wanted to keep you updated about its status.",
      // signature: "Best Regards,\nThe Strikeo Team",
      outro: "Thank you for your understanding!",
      // Combine section titles and list items
      intro: emailBodySections
        .map((section) => `${section.sectionTitle}<br/>${section.listItems}`)
        .join("<br/><br/>"),
      action: {
        instructions: "If you have any questions, feel free to reach out!",
        button: {
          color: "#3869D4",
          text: "Contact Us",
          link: `mailto:${process.env.SMTP_USER}`,
        },
      },
    },
  };

  // Generate email content using Mailgen
  const emailContent = mailGenerator.generate(emailBody);

  const emailOptions = {
    to: email,
    from: `"Strikeo" <${process.env.SMTP_USER}>`,
    subject: "Update on Your Order",
    html: emailContent,
  };

  const transporter = setTransporter();

  try {
    await transporter.sendMail(emailOptions);
    console.log("Order update notification email sent successfully!");
  } catch (err) {
    console.error("Failed to send order update email:", err.message);
  }
};
const handleOrderCreateFailedNotify = async (email, removedMessage = {}) => {
  if (!email || !removedMessage.items?.length) {
    console.log("No email, reason, or items to send notifications for.");
    return;
  }

  // Extract reason and items from the object
  const { failureReason = "N/A", items = [], message = "N/A" } = removedMessage;

  const data = await Promise.all(
    items.map(async (item) => {
      const quantity = item.quantity;
      const price = item?.variantSnapshot
        ? item?.variantSnapshot?.pricing?.salePrice
        : item?.productSnapshot?.pricing?.salePrice;
      const variant = item?.variantSnapshot
        ? item?.variantSnapshot?.variantName
        : null;
      const totalPrice = quantity * price;
      const productName = item?.productSnapshot?.name;

      const discount =
        quantity *
        (item?.variantSnapshot
          ? item?.variantSnapshot?.pricing?.discount
          : item.productSnapshot?.pricing?.discount);

      return {
        item: productName,
        quantity,
        discount,
        price: `TK. ${price}`,
        variant,
        totalPrice: `TK. ${totalPrice}`,
      };
    })
  );

  const dt = {
    title: "Hi! Thank you for your recent order with us. Here's an update:",
    subTitle: `<strong>${message}</strong>`,
    reason: `<strong>Reason:</strong> <span> ${failureReason}</span>`,
    orders: data,
  };

  const emailOptions = {
    to: email,
    from: `"Strikeo" <${process.env.SMTP_USER}>`,
    subject: "Update on Your Order",
    html: orderCreateFailedEmailTemplate(dt),
  };

  const transporter = setTransporter();

  try {
    await transporter.sendMail(emailOptions);
    console.log("Order update notification email sent successfully!");
  } catch (err) {
    console.error("Failed to send order update email:", err.message);
  }
};
const orderAdminNotification = async (info) => {
  try {
    const { orderNumber, items } = info;
    const transporter = setTransporter();

    const userOrderData = await Promise.all(
      items.map(async (item) => {
        const quantity = item.quantity;
        const price = item?.variantSnapshot
          ? item?.variantSnapshot?.pricing?.salePrice
          : item?.productSnapshot?.pricing?.salePrice;
        const variant = item?.variantSnapshot
          ? item?.variantSnapshot?.variantName
          : null;
        const totalPrice = quantity * price;
        const productName = item?.productSnapshot?.name;

        const discount =
          quantity *
          (item?.variantSnapshot
            ? item?.variantSnapshot?.pricing?.discount
            : item.productSnapshot?.pricing?.discount);

        return {
          item: productName,
          quantity,
          price: `TK. ${price}`,
          discount,
          variant,
          totalPrice: `TK. ${totalPrice}`,
        };
      })
    );
    const vendorOrderData = await Promise.all(
      items.map(async (item) => {
        const quantity = item.quantity;
        const price = item?.variantSnapshot
          ? item?.variantSnapshot?.pricing?.costPrice
          : item?.productSnapshot?.pricing?.costPrice;
        const variant = item?.variantSnapshot
          ? item?.variantSnapshot?.variantName
          : null;
        const totalPrice = quantity * price;
        const productName = item?.productSnapshot?.name;

        const discount =
          quantity *
          (item?.variantSnapshot
            ? item?.variantSnapshot?.pricing?.discount
            : item.productSnapshot?.pricing?.discount);

        return {
          item: productName,
          quantity,
          price: `TK. ${price}`,
          discount,
          variant,
          totalPrice: `TK. ${totalPrice}`,
        };
      })
    );

    ///Email Notification for Strikeo
    const msgForStrikeo = {
      to: process.env.SMTP_USER,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject: `Order Status : Order No.- ${orderNumber}`,
      html: orderAdminOrderEmailTemplate(info, userOrderData, vendorOrderData),
    };

    await transporter.sendMail(msgForStrikeo);

    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
  }
};

const handleEmailAfterPaymentAndOrderDone = async (data) => {
  try {
    const { orders, customer } = data;
    const {
      email: customerEmail,
      firstName: customerFirstName,
      lastName: customerLastName,
    } = customer;
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
        const { firstName, lastName, contact } = await Vendor.findOne({
          company: company,
        });
        const { email } = contact;
        const status = "Confirmed";

        ///Send Email to vendor
        await vendorUserOrderNotification(
          orderNumber,
          items,
          email,
          vendorBill,
          shippingDetails
        );

        ///Send Email to customer
        await customerOrderStatusNotification(
          orderNumber,
          items,
          customerEmail,
          customerBill,
          status,
          shippingDetails
        );
        ///Strikeo Admin Email Notification

        const orderInfo = {
          customerName: `${customerFirstName} ${customerLastName}`,
          customerEmail,
          customerBill,
          shippingDetails,
          //Vendor Info
          vendorName: `${firstName} ${lastName}`,
          vendorEmail: email,
          orderNumber,
          vendorBill,
          items,
          status,
        };

        await orderAdminNotification(orderInfo);
      })
    );
  } catch (error) {
    console.log(error);
  }
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
