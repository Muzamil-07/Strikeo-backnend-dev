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
} = require("../templates/email");
const { getNumber } = require("./stringsNymber");
const Product = require("../models/Product");

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

const confirmOrder = async (user, cart, userEmail) => {
  try {
    const transporter = setTransporter();
    const data = cart.items.map((item) => {
      // Prioritize variantDetails if available, otherwise fallback to product details
      const productInfo = item?.variantDetails || item?.product;
      // const productImageUrl =
      //   productInfo?.images?.[0]?.url || "/image/default_image.webp";
      // const imageAlt =
      //   productInfo?.images?.[0]?.alt || productInfo?.name || "Product Image";
      const productName = item?.product?.name;
      const discount = getNumber(productInfo?.pricing?.discount);
      const productPrice =
        getNumber(productInfo?.pricing?.salePrice) - discount;

      const color = item?.variantDetails
        ? productInfo?.color
        : item?.product?.attributes?.color;
      const size = item?.variantDetails
        ? productInfo?.size
        : item?.product?.attributes?.size;
      const table = {
        item: productName,
        quantity: item?.quantity,
        price: "TK. " + productPrice,
        size: size,
        color: color,
      };
      return table;
    });

    const bill = cart.bill;
    const msg = {
      to: userEmail,
      // from: process.env.SMTP_USER,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject: "Order Confirmation",
      html: orderConfirmTemplate(data, user, bill),
    };
    const bang = {
      to: "shsohel.tc@gmail.com",
      // from: process.env.SMTP_USER,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject: "Order Confirmation",
      html: orderConfirmTemplate(data, user, bill),
    };

    // transporter.sendMail(bang, (err, info) => {
    //   if (err) {
    //     console.log("While order confirm email sent=> ", err);
    //   } else {
    //     console.log("Email sent", info);
    //   }
    // });
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
        const productData = await Product.findById(item.product);
        const quantity = item.quantity;
        const price = item.productSnapshot?.pricing?.costPrice;
        const totalPrice = quantity * price;
        const productName = productData?.name;

        return {
          item: productName,
          quantity,
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
  status
) => {
  try {
    const transporter = setTransporter();

    // Resolve all product details asynchronously using Promise.all
    const data = await Promise.all(
      items.map(async (item) => {
        const productData = await Product.findById(item.product);
        const quantity = item.quantity;
        const price = item.productSnapshot?.pricing?.salePrice;
        const totalPrice = quantity * price;
        const productName = productData?.name;

        return {
          item: productName,
          quantity,
          price: `TK. ${price}`,
          totalPrice: `TK. ${totalPrice}`,
        };
      })
    );

    const msg = {
      to: userEmail,
      from: `"Strikeo" <${process.env.SMTP_USER}>`,
      subject: `Order Status : Order No.- ${orderNo}`,
      html: orderUpdateStatusForCustomTemplate(data, orderNo, bill, status),
    };

    await transporter.sendMail(msg);
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

  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Strikeo",
      link: process.env.FRONTEND_URL,
    },
  });

  // Extract reason and items from the object
  const { failureReason = "N/A", items = [], message = "N/A" } = removedMessage;

  // Create table rows for each item under this failure reason
  const tableRows = items.map(
    (item, i) =>
      `<tr>
        <td>${i + 1}</td>
        <td>${item?.productSnapshot?.name || "N/A"} ${
        item?.variantSnapshot
          ? `<br/> Variant: ${items?.variantSnapshot?.variantName || "N/A"}`
          : ""
      }</td>
        <td>${
          item?.variantSnapshot
            ? item?.variantSnapshot?.pricing?.salePrice
            : item?.productSnapshot?.pricing?.salePrice
        }</td>
      </tr>`
  );

  // Create a table to display item details
  const itemTable = `
    <table border="1" cellpadding="5" cellspacing="0" width="100%">
      <thead>
        <tr>
          <th>#</th>
          <th>Item Name</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows.join("")}
      </tbody>
    </table>
  `;

  // Prepare the email body
  const emailBody = {
    body: {
      title: "Hi! Thank you for your recent order with us. Here's an update:",
      intro: `<strong>${message}</strong><br/><br/>${itemTable}`,
      outro: `<strong>Reason:</strong> <span> ${failureReason}</span>`,
      action: {
        instructions: `If you have any questions, feel free to reach out!`,
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

module.exports = {
  sendEmail,
  confirmOrder,
  sslczNotification,
  sendContactUsEmail,
  handleOrderErrorsAndNotify,
  handleOrderCreateFailedNotify,
  vendorUserOrderNotification,
  customerOrderStatusNotification,
};
