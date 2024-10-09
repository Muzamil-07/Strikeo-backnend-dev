const fakerjs = require("@faker-js/faker")
const mongoose = require("mongoose");
const User = require("./models/User.js");
const Admin = require("./models/StrikeO.js");
const Vendor = require("./models/Vendor.js");
const Role = require("./models/Role.js");
const Company = require("./models/Company.js");
const Order = require('./models/Order');
const Product = require('./models/Product');
const dotenv = require("dotenv");
dotenv.config();
const {faker} = fakerjs; 

mongoose
	.connect(`${process.env.MONGO_URI_DEV}`)
	.then(() => {
		console.log("connected to db in development environment");
		init();
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});

	const generateRandomItems = async (companyId) => {
		try {
			const products = await Product.find({ company: companyId });
			const items = [];
			const numItems = Math.floor(Math.random() * (products.length - 1)) + 1;
			for (let i = 0; i < numItems; i++) {
				const randomProduct = products[Math.floor(Math.random() * products.length)];
	
				const item = {
					product: randomProduct._id,
					details: {
						color: randomProduct.colors[0],
						size: randomProduct.sizes[Math.floor(Math.random() * randomProduct.sizes.length)],
						quantity: Math.floor(Math.random() * 5) + 1,
						price: randomProduct.salePrice 
					}
				};
	
				items.push(item);
			}

			return items;
		} catch (error) {
			console.error('Error generating random items:', error);
			return [];
		}
	};


async function seeFakeOrders() {
	for (let i = 0; i < 190; i++) {
		try {
			// Fetch a list of customer IDs
			const customer = [
				{
				id:'656c9607bb9c69722688a96e',
				shippingDetails: {
					"firstName": "Muhammad",
					"lastName": "Salman",
					"email": "learnmdsalman@gmail.com",
					"phone": "03450816247",
					"address": "Punjab University Boys Hostel Number 17, Room 222, Quaid-e-Azam Campus",
					"city": "Lahore",
					"state": "Punjab",
					"country": "Pakistan",
					"zipCode": "54700",
				  }
			},				
			{
				id:'656bedc026c6abb43176c43e',
				shippingDetails: {
					"firstName": "Fasih",
					"lastName": "ur Rehman",
					"email": "rfasih14@gmail.com",
					"phone": "03164246008",
					"address": "140 tufail block canal bank scheme Lahore",
					"city": "Lahore",
					"state": "Punjab",
					"country": "Pakistan",
					"zipCode": "54000"
				  }
			}
			];

			const statuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

	
			const randomCustomer = customer[Math.floor(Math.random() * customer.length)];
	
			const order = await new Order({
				customer: randomCustomer.id,
				orders: [
					{
						company: '65649e9c8ec2cb00c75f55c8',
						items: await generateRandomItems('65649e9c8ec2cb00c75f55c8'),
						status: statuses[Math.floor(Math.random() * statuses.length)],
						vendorBill: faker.commerce.price({min:6000,max:10000}),
					},
					{
						company: '6558b2264f80e1e521e70654',
						items: await generateRandomItems('6558b2264f80e1e521e70654'),
						status: statuses[Math.floor(Math.random() * statuses.length)],
						vendorBill: faker.commerce.price({min:6000,max:10000}),
					}
				],
				bill: faker.commerce.price({min:11000,max:20000}),
				payment: {
					status: 'Paid',
					method: 'card'
				},
				isConfirmed: true,
				isCompleted: false,
				shippingDetails: randomCustomer.shippingDetails,
				orderedAt: faker.date.between({from:'2023-10-01', to:'2023-12-05'})
			});           
			await order.save();

		} catch (error) {
			console.error('Error creating order:', error);
		}
    }
}


async function seedAdmin() {
	// Ensure there's an admin role in the database or create it
const strikeOPermissions = [
	"View Vendors",
	"Vendor Block/Unblock",
	"View Vendor Details",
	"View Vendor Orders",
	"View Vendor Company",
	"Edit Vendor Details",
	"Edit Vendor Orders",
	"Edit Vendor Company",
	"Create Vendors",
	"View Review Products",
	"View Review Product Details",
	"Edit Review Products",
	"Publish Review Products",
	"Reject Review Product",
	"View Published Products",
	"View Published Product Details",
	"Edit Published Products",
	"Enable/Disable Published Product",
	"View Categories",
	"Create Category",
	"Delete Category",
	"View Category Details",
	"Edit Category Details",
	"Category Enable/Disable",
	"View Vendor Roles",
	"Edit Vendor Role",
	"Add Vendor Role",
	"Enable/Disable Vendor Role",
	"View StrikeO Roles",
	"Edit StrikeO Role",
	"Add StrikeO Role",
	"Enable/Disable StrikeO Role",
	"View Users",
	"Edit User",
	"User Block/Unblock",
	"View User Details",
	"Edit User Details",
	"View User Orders",
	"View User Order Details",
	"Edit User Orders",
	"View Sales",
	"Add Sales",
	"View Sales Details",
	"Edit Sales",
	"View Sales Income Statement",
	"Edit Sales Income Statement",
	"View Sales Balance Sheet",
	"Edit Sales Balance Sheet",
	"View Sales Cash Flow Statement",
	"Edit Sales Cash Flow Statement",
	"View Agents",
	"View Agent Details",
	"Edit Agent",
	"Create Agent",
	"Agent Block/Unblock",
	"View Analytics",
  ];
	let adminRole = await Role.findOne({ type: "StrikeO" });
	if (!adminRole) {
		adminRole = new Role({ name: "SuperAdmin", type: "StrikeO" });
		adminRole.isActive = false;
		adminRole.strikeOPermissions = strikeOPermissions
		await adminRole.save();
	}

	const admin = new Admin({
		firstName: "Admin",
		username: "admin",
		email: "admin@gmail.com",
		role: adminRole._id,
		strikeOPermissions: strikeOPermissions,
		hash: "admin", // You would ideally want to use a stronger password
	});

	admin.setPassword();
	await admin.save();
}

async function seedVendor() {
	// Ensure there's a vendor role in the database or create it
	let vendorRole = await Role.findOne({ name: "Admin", type: "Vendor" });
	if (!vendorRole) {
		vendorRole = new Role({ name: "Admin", type: "Vendor" });
		vendorRole.vendorPermissions = [
			"View Products",
			"View Product Details",
			"Create Products",
			"Update Products",
			"Enable/Disable Product",
			// "Delete Products",
			"View Orders",
			"View Order Details",
			"Update Orders",
			"View Employees",
			"View Employee Details",
			"Create Employees",
			"Update Employees",
			"Block/Unblock Employees",
			// "Delete Employees",
			"View Sales",
		  ];
		vendorRole.isActive = false;
		await vendorRole.save();
	}

	// Ensure there's a company in the database or create it
	// let company = new Company({
	// 	name: "Devfum",
	// 	contact: { phone: "1234567890", email: "support@strikeo.com" },
	// 	country: "Pakistan",
	// 	address: "123 Example Street",
	// 	city: "Lahore",
	// 	zipCode: "54000",
	// });
	// await company.save();

	// const vendor = new Vendor({
	// 	firstName: "Muhammad",
	// 	lastName: "Salman",
	// 	username: "salman247",
	// 	contact: {
	// 		phone: "1234567890",
	// 		email: "salman@gmail.com",
	// 	},
	// 	role: vendorRole._id,
	// 	company: company._id,
	// 	hash: "1234", // Use a strong password in production
	// });

	// vendor.setPassword();
	// await vendor.save();
}

async function seedRole() {
	const role = new Role({
		type: "User",
		name: "Customer",
	});

	await role.save();
}

async function seedAgentRole() {
	const isAgentExist = await Role.findOne({ type: "Agent" });
	if (isAgentExist) {
		return;
	}
	const role = new Role({
		type: "Agent",
		name: "Agent",
	});

	await role.save();
}

async function init() {
	console.log("dropping DB");
	// await mongoose.connection.db.dropDatabase();
	// await seedUser();
	// await seedAdmin();
	// await seedVendor();
	// await seedRole();
	// await seedAgentRole();
	await seeFakeOrders();
	exit();
}

function exit() {
	console.log("exiting");
	process.exit(1);
}
