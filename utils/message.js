const { getNumber } = require("./stringsNymber");

function createMessageBody(order, agent) {
  const company = order?.company || {};
  const warehouse = order?.agent?.warehouse || {};

  const orderNumber = order?.orderNumber || "N/A";
  const shippingDetails = order?.shippingDetails || {};

  const items =
    order?.items
      ?.map((item, ind) => {
        const variantName = item?.variantSnapshot?.variantName
          ? `Variant: ${item.variantSnapshot.variantName}`
          : "";

        const size =
          item?.variantSnapshot?.size ||
          item?.productSnapshot?.attributes?.size ||
          "N/A";
        const color =
          item?.variantSnapshot?.color ||
          item?.productSnapshot?.attributes?.color ||
          "N/A";

        const displayPrice = Math.max(
          0,
          getNumber(
            item?.variantSnapshot
              ? item?.variantSnapshot?.pricing?.costPrice
              : item?.productSnapshot?.pricing?.costPrice
          )
        );

        return `(${ind + 1}): ${
          item?.productSnapshot?.name || "Unnamed Product"
        }, ${variantName} Size: ${size}, Color: ${color}, Price: ${displayPrice}, Quantity: ${getNumber(
          item?.quantity || 0
        )}`;
      })
      ?.join("\n") || "No items available";

  // Error messages if warehouse not found or inactive
  if (!warehouse) {
    throw {
      message: `Warehouse not found for the order #${orderNumber}. Please check the warehouse details.`,
    };
  }

  if (!warehouse?.isActive) {
    throw {
      message: `Warehouse ${warehouse.name} for order #${orderNumber} is currently inactive.`,
    };
  }

  const pickupAddress = ` 
Name: ${warehouse?.name || "Warehouse name not available"}
Address Line: ${warehouse?.location?.addressLine || "Address not available"}
City: ${warehouse?.location?.city || "City not available"}, 
ZipCode: ${warehouse?.location?.zipCode || "Zip code not available"}`;

  const customerDetails = `
Name: ${shippingDetails?.firstName || "N/A"} ${shippingDetails?.lastName || ""}
Email: ${shippingDetails?.email || "N/A"}
Phone: ${shippingDetails?.phone || "N/A"}
Address: ${shippingDetails?.address || "N/A"}
City: ${shippingDetails?.city || "N/A"}
State: ${shippingDetails?.state || "N/A"}
Country: ${shippingDetails?.country || "N/A"}
Zip Code: ${shippingDetails?.zipCode || "N/A"}
Special Instructions: ${shippingDetails?.instruction || "None"}`;

  return `
*Order Pickup Details for Order #${orderNumber}*

Dear ${agent?.firstName || "Agent"} ${agent?.lastName || ""},

We kindly request your assistance in picking up an order from the assigned warehouse and delivering it to our valued customer. Below are the details for the pickup and delivery:

*Order Number:* ${orderNumber}

*Pickup Address:*
${pickupAddress}
Contact: ${company?.contact?.phone || "N/A"}, ${
    company?.contact?.email || "N/A"
  }

*Customer Shipping Details:*
${customerDetails}

*Order Details:*
Items:
${items}

Please ensure prompt and secure handling of the order during pickup and delivery. Your cooperation is greatly appreciated.
Thank you for your service!

Best regards,
_${company?.name || "The Strikeo Company"}_`;
}

exports.createMessageBody = createMessageBody;
