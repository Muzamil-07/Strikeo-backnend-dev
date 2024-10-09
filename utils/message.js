function createMessageBody(order, agent) {
	const company = order.orders[0].company;
	const orderNumber = order.orderNumber;
	const shippingDetails = order.shippingDetails;
	const items = order.orders
		.flatMap((o) =>
			o.items.map((item) => {
				return `Product: ${item.product.name}, Size: ${item.details.size}, Quantity: ${item.details.quantity}, Price: ${item.details.price}`;
			})
		)
		.join("\n");

	return `
*Order Pickup Details for Order #${orderNumber}*

Dear ${agent.firstName} ${agent.lastName},
We kindly request your assistance in picking up an order from our vendor's location and delivering it to our valued customer. Below are the details for the pickup and delivery:

Order Number: ${orderNumber}

*Pickup Address:*
${company.name}
${company.address}
${company.city}, ${company.zipCode}
Contact: ${company.contact.phone}, ${company.contact.email}

*Customer Shipping Details:*
Name: ${shippingDetails.firstName} ${shippingDetails.lastName}
Email: ${shippingDetails.email}
Phone: ${shippingDetails.phone}
Address: ${shippingDetails.address}
City: ${shippingDetails.city}
State: ${shippingDetails.state}
Country: ${shippingDetails.country}
Zip Code: ${shippingDetails.zipCode}
Special Instructions: ${shippingDetails.instruction || "None"}

*Order Details:*
Items:
${items}

Please ensure prompt and secure handling of the order during pickup and delivery. Your cooperation is greatly appreciated.
Thank you for your service!

Best regards,
_${company.name}_
    `;
}

exports.createMessageBody = createMessageBody;
