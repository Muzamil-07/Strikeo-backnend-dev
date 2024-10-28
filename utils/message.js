const { getNumber } = require("./stringsNymber");

function createMessageBody(order, agent) {
  const company = order?.company || null;
  const warehouse = company?.warehouse || null;

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
Name: ${warehouse?.name || "Warehouse name not provided"},
Country: ${warehouse?.location?.country || "Country not provided"}, 
City: ${warehouse?.location?.city || "City not provided"}, 
Zone: ${warehouse?.location?.zone || "Zone not provided"}, 
Area: ${warehouse?.location?.area || "Area not provided"}, 
ZipCode: ${warehouse?.location?.zipCode || "Zip code not provided"},
Address Line: ${warehouse?.location?.addressLine || "Address not provided"}.`;

  const customerDetails = `
Name: ${shippingDetails?.firstName || "N/A"} ${
    shippingDetails?.lastName || "N/A"
  },
Email: ${shippingDetails?.email || "N/A"},
Phone: ${shippingDetails?.phone || "N/A"},
Country: ${shippingDetails?.country || "N/A"},
City: ${shippingDetails?.city || "N/A"},
Zone: ${shippingDetails?.zone || "N/A"}, 
Area: ${shippingDetails?.area || "N/A"}, 
Zip Code: ${shippingDetails?.zipCode || "N/A"},
Address: ${shippingDetails?.address || "N/A"},
Special Instructions: ${shippingDetails?.instruction || "None"}.`;

  return `
*Order Pickup Details for Order #${orderNumber}*

Dear ${agent?.firstName || "Agent"} ${agent?.lastName || ""},

We kindly request your assistance in picking up an order from the assigned warehouse and delivering it to our valued customer. Below are the details for the pickup and delivery:

*Order Number:* ${orderNumber}

*Pickup Address:*
${pickupAddress}
Company Contact: ${company?.contact?.phone || "N/A"}, ${
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
_${company?.name || "Company name not available"}`;
}

exports.createMessageBody = createMessageBody;
