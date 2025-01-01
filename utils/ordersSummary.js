const { generateItemData, customerOrdersSummayMail } = require("./mailer");
const { getMin0Number } = require("./stringsNymber");

const processOrdersSummaryNotifyForCustomer = async (
  summaryDoc = {},
  promoCodeDiscount = 0,
  userEmail = ""
) => {
  try {
    // Extract populated orders from the summary document
    const {
      groupedItems = [],
      customerBill = 0,
      shippingDetails = {},
      promotion = null,
    } = summaryDoc;

    const printableOrders = [];
    for (const order of groupedItems) {
      const { items = [] } = order;
      const printableItems = generateItemData(items, "salePrice");
      printableOrders.push({
        companyName: order?.company?.name || "N/A",
        printableItems,
      });
    }

    const totalCustomerBill = getMin0Number(customerBill);
    const totalShippingCost = getMin0Number(shippingDetails?.shippingCost);

    // Format promotions for summary
    const promoCode = promotion?.promoCode || null;

    const masterTotal = customerBill + totalShippingCost - promoCodeDiscount;

    // Combine data for rendering
    const summaryData = {
      totals: {
        customerBill: totalCustomerBill,
        shippingCost: totalShippingCost,
        promoCodeDiscount,
        promoCodeName: promoCode?.name,
        masterTotal,
      },
      printableOrders,
    };

    await customerOrdersSummayMail(summaryData, userEmail);
    return summaryData;
  } catch (error) {
    console.error("Error processing summary notification:", error);
    throw new Error("Failed to process summary notification.");
  }
};
module.exports = { processOrdersSummaryNotifyForCustomer };
