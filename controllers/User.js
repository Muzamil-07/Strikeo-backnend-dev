const {
  OkResponse,
  BadRequestResponse,
  UnauthorizedResponse,
  NotFoundResponse,
} = require("express-http-response");

const User = require("../models/User.js");
const Order = require("../models/Order.js");
const Cart = require("../models/Cart.js");
const Billing = require("../models/Billing.js");
const Product = require("../models/Product.js");
const Role = require("../models/Role.js");

const { sendEmail, sendContactUsEmail } = require("../utils/mailer.js");
const { generateOTPCode } = require("../utils/Auth.js");
const { sendOtpMessage } = require("../utils/OTPMessage.js");
const { jsonFormat, getProductId } = require("../utils/stringsNymber.js");
const FavouriteProduct = require("../models/FavouriteProduct.js");

const getUser = async (req, res, next) => {
  const { id } = req.user;

  try {
    if (!id) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const user = await User.findById(id).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    if (!user) {
      return next(new UnauthorizedResponse("User not found"));
    } else {
      return next(new OkResponse(user));
    }
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const {
      page,
      all,
      search,
      limit = 10,
      isVerified,
      fields = "",
    } = req.query;
    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const query = { ...(isVerified && { isVerified: true }) };
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        // { role: { $regex: search, $options: "i" } },
      ];
    }
    const selectedFields = fields
      ? fields.split(",").map((field) => field.trim())
      : [];
    if (all === "true") {
      const aggregationPipeline = [
        { $match: { ...query } },
        { $sort: { firstName: 1 } },
      ];

      // Add projection only if selectedFields is not empty
      if (selectedFields?.length > 0) {
        const projection = selectedFields.reduce(
          (acc, field) => ({ ...acc, [field]: 1 }),
          {}
        );
        aggregationPipeline.push({ $project: projection });
      }

      const users = await User.aggregate(aggregationPipeline).collation({
        locale: "en",
        strength: 1,
      });

      return next(
        new OkResponse({
          users,
          totalUsers: users.length,
        })
      );
    }

    const options = {
      sort: { createdAt: -1 },
      populate: "activeBillingAddress",
      offset,
      limit,
    };

    const users = await User.paginate(query, options);

    const updatedUsers = await Promise.all(
      users.docs.map(async (user) => {
        const ordersPlaced = await Order.countDocuments({
          customer: user._id,
          isConfirmed: true,
        });

        return {
          ...user.toJSON(),
          authType: user?.authType,
          totalOrders: ordersPlaced,
        };
      })
    );

    return next(
      new OkResponse({
        totalUsers: users.totalDocs,
        users: updatedUsers,
        totalPages: users.totalPages,
        hasPrevPage: users.hasPrevPage,
        hasNextPage: users.hasNextPage,
        currentPage: users.page,
      })
    );
  } catch (error) {
    return next(new BadRequestResponse("Failed to get users"));
  }
};

const signup = async (req, res, next) => {
  const { username, email, password, model, firstName, lastName } = req.body;

  try {
    if (!email || !password || !firstName || !lastName) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const existingUser = await User.findOne({ email });
    const role = await Role.findOne({ type: "User", name: "Customer" });

    if (existingUser) {
      return next(new BadRequestResponse("User already exists"));
    }

    let user = await User({
      username: email.split("@")[0],
      email,
      firstName,
      lastName,
      hash: password,
      role,
    });

    // const token =
    //   Math.random().toString(36).substring(2, 15) +
    //   Math.random().toString(36).substring(2, 15);
    // user.verify_token = {
    //   token,
    //   link: `${process.env.FRONTEND_URL}/login?email=${email}&token=${token}`,
    //   expires: Date.now() + 3600000 * 24 * 365 * 100,
    // };

    user.setPassword();

    const cart = new Cart({
      owner: user._id,
    });
    const favourite = new FavouriteProduct({
      owner: user._id,
    });
    await cart.save();
    await favourite.save();

    user.cart = cart;
    user.favouriteProducts = favourite;
    await user.save();

    sendEmail(user, "Email Verification", { verifyEmail: true });

    return next(new OkResponse(user));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const user = await User.findOne({ email }).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    if (!user.isActive) {
      return next(new BadRequestResponse("You've been blocked by Admin!"));
    }

    if (!user.isVerified) {
      return next(new BadRequestResponse("Email not verified!"));
    }

    if (!user.validPassword(password)) {
      return next(new BadRequestResponse("Invalid password"));
    }
    return next(new OkResponse(user.toAuthJSON()));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const verifyEmail = async (req, res, next) => {
  const { email, token } = req.body;

  try {
    if (!email || !token) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    // if (!user.verify_token || user.verify_token.token !== token) {
    //   return next(new BadRequestResponse("Invalid token!"));
    // }

    // if (user.verify_token.expires < Date.now()) {
    //   return next(new BadRequestResponse("Validation token expired!"));
    // }

    user.isVerified = true;
    // user.verify_token = null;

    await user.save();

    return next(new OkResponse("Email verified successfully!"));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const forgotPassword = async (req, res, next) => {
  const { email } = req.body;

  try {
    if (!email) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const user = await User.findOne({ email, authType: "local" });

    if (!user) {
      return next(new BadRequestResponse("Email not found!"));
    }

    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    user.reset_token = {
      token,
      link: `${process.env.FRONTEND_URL}/reset-password?email=${email}&token=${token}`,
      expires: Date.now() + 3600000, // 1 hour
    };

    await user.save();

    sendEmail(user, "Forgot Password", { forgotPassword: true });

    return next(new OkResponse("Email sent successfully!"));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const resetPassword = async (req, res, next) => {
  const { email, token, password } = req.body;

  try {
    if (!email || !token || !password) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const user = await User.findOne({ email, authType: "local" });

    if (!user) {
      return next(new BadRequestResponse("User not found!"));
    }

    if (!user.reset_token || user.reset_token.token !== token) {
      return next(new BadRequestResponse("Invalid token!"));
    }

    if (user.reset_token.expires < Date.now()) {
      return next(new BadRequestResponse("Token expired!"));
    }

    user.hash = password;
    user.reset_token = null;

    user.setPassword();

    await user.save();

    return next(new OkResponse("Password reset successfully!"));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const updateProfile = async (req, res, next) => {
  const {
    firstName,
    lastName,
    username,
    email,
    profileImage,
    password,
    billing,
    id,
  } = req.body;

  try {
    const user = await User.findById(id);

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    if (username) {
      const checkUser = await User.findOne({ username });

      if (checkUser) {
        return next(new BadRequestResponse("Username already taken!"));
      }

      user.username = username;
    }

    let billingToUpdate;
    if (billing && Object.keys(billing).length > 0) {
      if (!user.activeBillingAddress) {
        billingToUpdate = new Billing(billing);
        await billingToUpdate.save();
        user.activeBillingAddress = billingToUpdate._id;
      } else {
        billingToUpdate = await Billing.findById(user.activeBillingAddress);
        if (billing.firstName) billingToUpdate.firstName = billing.firstName;
        if (billing.lastName) billingToUpdate.lastName = billing.lastName;
        if (billing.email) billingToUpdate.email = billing.email;
        if (billing.phone) billingToUpdate.phone = billing.phone;
        if (billing.address) billingToUpdate.address = billing.address;
        if (billing.city) billingToUpdate.city = billing.city;
        if (billing.zone) billingToUpdate.zone = billing.zone;
        if (billing.area) billingToUpdate.area = billing.area;
        if (billing.state) billingToUpdate.state = billing.state;
        if (billing.country) billingToUpdate.country = billing.country;
        if (billing.zipCode) billingToUpdate.zipCode = billing.zipCode;
        await billingToUpdate.save();
      }
    }

    if (profileImage) user.profileImage = profileImage;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;

    if (email) {
      const checkUser = await User.findOne({ email });

      if (checkUser) {
        return next(new BadRequestResponse("Email already taken!"));
      }

      user.email = email;
    }

    if (password) {
      user.hash = password;
      user.setPassword();
    }

    // console.log("User", user);
    await user.save();

    sendEmail(user, "Strike'O Profile Update", {
      updateProfile: true,
      newPass: password,
    });

    return next(
      new OkResponse({
        ...user.toJSON(),
        activeBillingAddress: billingToUpdate
          ? billingToUpdate
          : user.toJSON().activeBillingAddress,
      })
    );
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};
const updateBillingAddess = async (req, res, next) => {
  const { billing, id } = req.body;

  try {
    if (!billing || !Object.keys(billing).length || !id) {
      return next(new BadRequestResponse("Missing required parameters."));
    }
    if (String(id) !== String(req?.user?.id)) {
      return next(new BadRequestResponse("User verification failed."));
    }
    const user = await User.findById(id);

    if (!user) {
      return next(new BadRequestResponse("User not found."));
    }

    let billingToUpdate;

    if (!billing?.id) {
      billingToUpdate = new Billing(billing);
    } else {
      billingToUpdate = await Billing.findById(billing.id);

      if (!billingToUpdate) {
        return next(new BadRequestResponse("Billing address not found."));
      }

      if (billing?.firstName) billingToUpdate.firstName = billing.firstName;
      if (billing?.lastName) billingToUpdate.lastName = billing.lastName;
      if (billing?.email) billingToUpdate.email = billing.email;
      if (billing?.phone) billingToUpdate.phone = billing.phone;
      if (billing?.address) billingToUpdate.address = billing.address;
      if (billing?.city) billingToUpdate.city = billing.city;
      if (billing?.zone) billingToUpdate.zone = billing.zone;
      if (billing?.area) billingToUpdate.area = billing.area;
      if (billing?.state) billingToUpdate.state = billing.state;
      if (billing?.country) billingToUpdate.country = billing.country;
      if (billing?.zipCode) billingToUpdate.zipCode = billing.zipCode;
      if (billing?.instruction)
        billingToUpdate.instruction = billing.instruction;
    }
    const updatedBillId = billingToUpdate?._id || billingToUpdate?.id;
    billingToUpdate.id = updatedBillId;

    await billingToUpdate.save();

    if (billing?.isDefault || !user.activeBillingAddress) {
      user.activeBillingAddress = updatedBillId;
    }

    if (!user?.billingAddresses.includes(updatedBillId)) {
      user.billingAddresses.push(updatedBillId);
    }

    await user.save();
    const updatedUser = await User.findById(id).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    return next(
      new OkResponse({
        user: updatedUser.toJSON(),
        activeBillingAddress: updatedUser.toJSON().activeBillingAddress,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse(error));
  }
};
const googleAuth = async (req, res, next) => {
  const { signup } = { ...req.session.lastQuery };
  const htmlPage =
    '<html><head><title>Main</title></head><body></body><script defer >res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>';

  try {
    // console.log(req.user, "Google Auth");
    const email = req.user.emails[0].value;
    const username = req.user.displayName;
    const firstName = req.user.name.givenName;
    const lastName = req.user.name.familyName;
    const profileImage = req.user.photos[0].value;
    const googleId = req.user.id;

    if (!email) {
      const errorResponse = htmlPage.replace(
        "%value%",
        JSON.stringify({ error: "Email not found!" })
      );

      return res.status(200).send(errorResponse);
    }

    const user = await User.findOne({ email });

    if (user && signup) {
      const errorResponse = htmlPage.replace(
        "%value%",
        JSON.stringify({ error: "User has already registered!" })
      );
      return res.status(200).send(errorResponse);
    }

    if (!user && !signup) {
      const errorResponse = htmlPage.replace(
        "%value%",
        JSON.stringify({ error: "User hasn't registered!" })
      );
      return res.status(200).send(errorResponse);
    }

    if (!user) {
      const role = await Role.findOne({ type: "User", name: "Customer" });
      let newUser = await User({
        email,
        authType: "google",
        googleId,
        isVerified: true,
        role: role.id,
      });

      if (firstName) newUser.firstName = firstName;
      if (lastName) newUser.lastName = lastName;
      if (username) {
        newUser.username = String(username)
          .trim()
          .toLowerCase()
          .replace(" ", "_");
        // split(" ")[0] +
        // fbId.slice(0, 5) +
        // Math.floor(Math.random() * (999 - 100 + 1) + 100);
      } else if (email) {
        newUser.username = email.split("@")[0];
      }
      if (profileImage) {
        newUser.profileImage = profileImage;
      }

      const cart = new Cart({
        owner: newUser._id,
      });
      const favourite = new FavouriteProduct({
        owner: newUser._id,
      });
      await cart.save();
      await favourite.save();
      newUser.cart = cart._id;
      newUser.favouriteProducts = favourite;
      await newUser.save();

      const responseHTML = htmlPage.replace(
        "%value%",
        JSON.stringify({ user: newUser.toAuthJSON(), signup: true })
      );

      return res.status(200).send(responseHTML);
    } else {
      const response = {};
      if (!user.isActive) {
        const errorResponse = htmlPage.replace(
          "%value%",
          JSON.stringify({ error: "You've been blocked by Admin!" })
        );

        return res.status(200).send(errorResponse);
      }
      // if (!user.googleId) {
      //   const errorResponse = htmlPage.replace(
      //     "%value%",
      //     JSON.stringify({
      //       error: "Authentication failed due to duplicate auth method!",
      //     })
      //   );

      //   return res.status(200).send(errorResponse);
      //   // user.googleId = googleId;
      //   // await user.save();
      //   // response.linked = true;
      // }
      // if ( user.googleId && model ) {
      //   const errorResponse = htmlPage.replace(
      //     "%value%",
      //     JSON.stringify( { error: "User already registered!" } )
      //   );

      //   return res.status( 200 ).send( errorResponse );
      // }
      if (profileImage) user.profileImage = profileImage;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      await user.save();
      await user.populate(
        "role cart activeBillingAddress billingAddresses favouriteProducts"
      );
      response.user = user.toAuthJSON();
      const responseHTML = htmlPage.replace(
        "%value%",
        JSON.stringify(response)
      );
      return res.status(200).send(responseHTML);
    }
  } catch (error) {
    console.log("While login with google => ", error);
    const errorResponse = htmlPage.replace(
      "%value%",
      JSON.stringify({ error: "Authentication failed!" })
    );

    return res.status(200).send(errorResponse);
  }
};

const facebookAuth = async (req, res, next) => {
  const { signup } = { ...req.session.lastQuery };
  const htmlPage =
    '<html><head><title>Main</title></head><body></body><script defer >res = %value%; window.opener.postMessage(res, "*");window.close();</script></html>';

  try {
    // console.log(req.user, "Facebook Auth");
    const fbId = req.user.id;
    const name = req.user.displayName;
    const firstName = req.user.displayName.split(" ")[0];
    const lastName = req.user.displayName.split(" ")[1];
    const email = req.user.emails?.[0]?.value;
    const profileImage = req.user?.photos[0]?.value;

    const user = await User.findOne({ facebookId: fbId });

    if (!email) {
      const errorResponse = htmlPage.replace(
        "%value%",
        JSON.stringify({ error: "Email not found!" })
      );
      return res.status(200).send(errorResponse);
    }
    if (user && signup) {
      const errorResponse = htmlPage.replace(
        "%value%",
        JSON.stringify({ error: "User has already registered!" })
      );
      return res.status(200).send(errorResponse);
    }

    if (!user && !signup) {
      const errorResponse = htmlPage.replace(
        "%value%",
        JSON.stringify({ error: "User hasn't registered!" })
      );
      return res.status(200).send(errorResponse);
    }

    if (!user) {
      // if ( !model ) {
      //   const errorResponse = htmlPage.replace(
      //     "%value%",
      //     JSON.stringify( { error: "User hasn't registered!" } )
      //   );

      //   return res.status( 200 ).send( errorResponse );
      // }
      const role = await Role.findOne({ type: "User", name: "Customer" });
      let newUser = await User({
        authType: "facebook",
        facebookId: fbId,
        isVerified: true,
        role: role.id,
        email,
      });
      if (profileImage) {
        newUser.profileImage = profileImage;
      }
      if (firstName) newUser.firstName = firstName;
      if (lastName) newUser.lastName = lastName;
      if (name) {
        newUser.username = String(name).trim().toLowerCase().replace(" ", "_");
        // split(" ")[0] +
        // fbId.slice(0, 5) +
        // Math.floor(Math.random() * (999 - 100 + 1) + 100);
      } else if (email) {
        newUser.username = email.split("@")[0];
      }

      const cart = new Cart({
        owner: newUser._id,
      });
      const favourite = new FavouriteProduct({
        owner: newUser._id,
      });
      await cart.save();
      await favourite.save();
      newUser.cart = cart._id;
      newUser.favouriteProducts = favourite;
      await newUser.save();

      const responseHTML = htmlPage.replace(
        "%value%",
        JSON.stringify({ user: newUser.toAuthJSON(), signup: true })
      );

      return res.status(200).send(responseHTML);
    } else {
      const response = {};
      if (!user.isActive) {
        const errorResponse = htmlPage.replace(
          "%value%",
          JSON.stringify({ error: "You've been blocked by Admin!" })
        );

        return res.status(200).send(errorResponse);
      }
      // if ( !user.facebookId ) {
      //   const errorResponse = htmlPage.replace(
      //     "%value%",
      //     JSON.stringify( { error: "Authentication failed due to duplicate auth method!" } )
      //   );

      //   return res.status( 200 ).send( errorResponse );
      //   // user.facebookId = fbId;
      //   // await user.save();
      //   // response.linked = true;
      // }
      // if ( user.facebookId && model ) {
      //   const errorResponse = htmlPage.replace(
      //     "%value%",
      //     JSON.stringify( { error: "User already registered!" } )
      //   );

      //   return res.status( 200 ).send( errorResponse );
      // }
      if (profileImage) user.profileImage = profileImage;
      if (firstName) user.firstName = firstName;
      if (lastName) user.lastName = lastName;
      await user.save();
      await user.populate(
        "role cart activeBillingAddress billingAddresses favouriteProducts"
      );
      response.user = user.toAuthJSON();
      const responseHTML = htmlPage.replace(
        "%value%",
        JSON.stringify(response)
      );
      return res.status(200).send(responseHTML);
    }
  } catch (error) {
    const errorResponse = htmlPage.replace(
      "%value%",
      JSON.stringify({ error: "Authentication failed!" })
    );
    console.log("While login with facebook => ", error);
    return res.status(200).send(errorResponse);
  }
};

const authFailed = async (req, res, next) => {
  return next(new BadRequestResponse("Authentication failed"));
};

const getContext = async (req, res, next) => {
  if (req.user) {
    if (!req.user.isActive) {
      return next(new BadRequestResponse("You've been blocked by Admin!"));
    }
    return next(new OkResponse(req.user));
  } else if (req.vendor) {
    if (!req.vendor.isActive) {
      return next(new BadRequestResponse("You've been blocked by Admin!"));
    }
    return next(new OkResponse(req.vendor));
  } else {
    return next(new BadRequestResponse("User not found"));
  }
};

const getFavourites = async (req, res, next) => {
  try {
    if (!req.user) {
      return next(new BadRequestResponse("User not found"));
    }

    const favourites = await Product.find({
      _id: { $in: req.user.favourites },
    }).populate("category");

    return next(new OkResponse(favourites));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const addToFavourites = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const product = await Product.findById(id);

    if (!product) {
      return next(new BadRequestResponse("Product not found"));
    }

    if (!req.user) {
      return next(new BadRequestResponse("User not found"));
    }

    if (req.user.favourites.includes(id)) {
      return next(new BadRequestResponse("Product already in favourites"));
    }

    req.user.favourites.push(id);

    await req.user.save();
    // const updatedUser = await req.user.populate("favourites");
    return next(new OkResponse({ favourites: req.user?.favourites }));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const removeFromFavourites = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (!id) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const product = await Product.findById(id);

    if (!product) {
      return next(new BadRequestResponse("Product not found"));
    }

    if (!req.user) {
      return next(new BadRequestResponse("User not found"));
    }

    if (!req.user?.favourites?.includes(id)) {
      return next(new BadRequestResponse("Product not in favourites"));
    }

    req.user.favourites = req.user.favourites.filter(
      (favourite) => favourite.toString() !== id
    );

    await req.user.save();
    await req.user.populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    return next(new OkResponse(req.user));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

// user Auth Blueberry theme
const userSignup = async (req, res, next) => {
  const { contact, password, firstName, lastName } = req.body;

  try {
    if (!contact || !password || !firstName || !lastName) {
      return next(new BadRequestResponse("Missing required parameters"));
    }
    const existingUser = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    });

    if (existingUser) {
      return next(new BadRequestResponse("User already exists"));
    }
    const role = await Role.findOne({ type: "User", name: "Customer" });

    const userData = {
      // username: contact.includes("@")
      //   ? contact.split("@")[0]
      //   : `${firstName?.toLowerCase()}${lastName?.toLowerCase()}`,
      firstName,
      lastName,
      hash: password,
      role,
    };

    if (contact?.includes("@")) {
      userData.email = contact;
    } else {
      userData.phone = contact;
    }
    let user = await User(userData);

    const code = await generateOTPCode();
    user.verify_OTP = {
      code,
      expires: Date.now() + 60000, // 1 minute
    };

    user.setPassword();

    const cart = new Cart({
      owner: user._id,
    });
    const favourite = new FavouriteProduct({
      owner: user._id,
    });
    await cart.save();
    await favourite.save();

    user.cart = cart;
    user.favouriteProducts = favourite;
    await user.save();
    if (contact?.includes("@")) {
      sendEmail(user, "Account Verification OTP", { emailOTP: true });
    } else {
      sendOtpMessage(contact, code);
    }

    return next(
      new OkResponse(
        `OTP sent to your ${contact?.includes("@") ? "email" : "phone number"}!`
      )
    );
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};
const getUserWithPreferences = async (contact) => {
  const userAggregation = await User.aggregate([
    {
      $match: {
        $or: [{ email: contact }, { phone: contact }],
      },
    },
    {
      $lookup: {
        from: "carts",
        localField: "_id",
        foreignField: "owner",
        as: "cart",
      },
    },
    {
      $lookup: {
        from: "favouriteproducts",
        localField: "_id",
        foreignField: "owner",
        as: "favouriteProducts",
      },
    },
  ]);

  return userAggregation;
};

const userLogin = async (req, res, next) => {
  const { contact, password } = req.body;
  try {
    if (!contact || !password) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const user = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    });

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    if (!user.isActive) {
      return next(new BadRequestResponse("You've been blocked by Admin!"));
    }

    if (!user.isVerified) {
      return next(new BadRequestResponse("Please verify your account!"));
    }
    if (!user.validPassword(password)) {
      return next(
        new BadRequestResponse(
          `Invalid ${contact.includes("@") ? "email" : "phone"} or password`
        )
      );
    }
    user.verify_OTP = null;
    await user.save();
    await user.populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    return next(new OkResponse(user.toAuthJSON()));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const sendUserOTP = async (req, res, next) => {
  const { contact, firstName, lastName, isSignup } = req.body;
  try {
    if (!contact) {
      return next(new BadRequestResponse("Missing required parameters"));
    }
    let user = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    });

    if (isSignup) {
      if (user) {
        return next(new BadRequestResponse("User already exists"));
      }
      if (!firstName || !lastName) {
        return next(new BadRequestResponse("Missing required parameters"));
      }

      const role = await Role.findOne({ type: "User", name: "Customer" });

      const userData = {
        // username: contact.includes("@")
        //   ? contact.split("@")[0]
        //   : `${firstName?.toLowerCase()}${lastName?.toLowerCase()}`,
        firstName,
        lastName,
        role,
      };

      if (contact.includes("@")) {
        userData.email = contact;
      } else {
        userData.phone = contact;
      }

      user = await User(userData);

      const cart = new Cart({
        owner: user._id,
      });
      const favourite = new FavouriteProduct({
        owner: user._id,
      });

      await favourite.save();
      await cart.save();
      user.favouriteProducts = favourite;
      user.cart = cart;
    }
    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    const code = await generateOTPCode();
    user.verify_OTP = {
      code,
      expires: Date.now() + 60000, // 1 minute
    };

    await user.save();
    if (contact?.includes("@")) {
      sendEmail(user, "Account Verification OTP", { emailOTP: true });
    } else {
      sendOtpMessage(contact, code);
    }

    return next(
      new OkResponse(
        `OTP sent to your ${contact?.includes("@") ? "email" : "phone number"}!`
      )
    );
  } catch (error) {
    return next(new BadRequestResponse(error.message));
  }
};

const verifyUserOTP = async (req, res, next) => {
  const { OTP, contact } = req.body;

  try {
    if (!contact) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const user = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    }).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    if (!user.verify_OTP || user.verify_OTP?.code !== OTP) {
      return next(
        new BadRequestResponse("Verification failed. Please try resending!")
      );
    }
    if (user.verify_OTP.expires < Date.now()) {
      return next(new BadRequestResponse("Validation Expired!"));
    }

    user.isVerified = true;
    user.verify_OTP = null;

    await user.save();

    return next(new OkResponse(user.toAuthJSON()));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const forgotUserPassword = async (req, res, next) => {
  const { contact } = req.body;
  try {
    if (!contact) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    let user = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    });

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    const code = await generateOTPCode();
    user.reset_OTP = {
      code,
      expires: Date.now() + 60000, // 1 minute
    };

    await user.save();
    if (contact?.includes("@")) {
      sendEmail(user, "Reset Password OTP", { emailOTP: true });
    } else {
      sendOtpMessage(contact, code);
    }

    return next(
      new OkResponse(
        `OTP sent to your ${contact?.includes("@") ? "email" : "phone number"}!`
      )
    );
  } catch (error) {
    return next(new BadRequestResponse(error.message));
  }
};

const verifyResetUserPassword = async (req, res, next) => {
  const { contact, OTP } = req.body;

  try {
    if (!contact || !OTP) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const user = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    }).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    if (!user?.reset_OTP || user?.reset_OTP?.code !== OTP) {
      return next(
        new BadRequestResponse("Verification failed. Please try resending!")
      );
    }
    if (user.reset_OTP.expires < Date.now()) {
      return next(new BadRequestResponse("Validation Expired!"));
    }
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    user.reset_token = {
      token,
      expires: Date.now() + 300000, // 5 minutes
    };

    user.reset_OTP = null;
    await user.save();
    return next(new OkResponse({ token }));
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};
const resetUserPassword = async (req, res, next) => {
  const { contact, password, token } = req.body;
  try {
    if (!contact || !password || !token?.trim()) {
      return next(new BadRequestResponse("Missing required parameters"));
    }

    const user = await User.findOne({
      $or: [{ email: contact }, { phone: contact }],
    }).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }
    if (!user.reset_token || user.reset_token?.token !== token) {
      return next(new BadRequestResponse("Invalid token!"));
    }

    if (user.reset_token?.expires < Date.now()) {
      return next(new BadRequestResponse("Token expired!"));
    }

    user.hash = password;
    user.setPassword();
    user.reset_token = null;
    user.reset_OTP = null;
    await user.save();
    if (user?.isVerified) {
      return next(new OkResponse(user.toAuthJSON()));
    } else {
      return next(new OkResponse("Password updated successfully!"));
    }
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const updateUserProfile = async (req, res, next) => {
  const { firstName, lastName, email, phone, profileImage, id, dob, gender } =
    req.body;

  try {
    const user = await User.findById(id).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    if (profileImage) user.profileImage = profileImage;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (dob) user.dob = dob;
    if (gender) user.gender = gender;

    await user.save();

    return next(
      new OkResponse({
        ...user.toJSON(),
      })
    );
  } catch (error) {
    return next(new BadRequestResponse(error));
  }
};

const sendUserContactUsFormMail = async (req, res, next) => {
  const { email, phone, name, message } = req.body;
  try {
    if (!email || !phone || !name || !message) {
      return next(new BadRequestResponse("Missing required parameters"));
    }
    const emailRegex =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!emailRegex.test(email)) {
      return next(new BadRequestResponse("invalid email format"));
    }

    sendContactUsEmail(req.body)
      .then(() => {
        return next(new OkResponse("Form submitted successfully!"));
      })
      .catch((err) => {
        return next(new BadRequestResponse("Failed to send mail"));
      });
  } catch (error) {
    return next(new BadRequestResponse(error.message));
  }
};
const changeBillingAddess = async (req, res, next) => {
  const { id } = req.params;
  const userId = req?.user?.id || req?.user?._id;
  try {
    if (!id || !userId) {
      return next(new BadRequestResponse("Missing required parameters"));
    }
    const user = await User.findById(userId);

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    let billingToUpdate;

    billingToUpdate = await Billing.findById(id);

    if (!billingToUpdate) {
      return next(new BadRequestResponse("Address not found"));
    }
    const updatedBillId = billingToUpdate?._id || billingToUpdate?.id;
    user.activeBillingAddress = updatedBillId;

    if (!user?.billingAddresses.includes(updatedBillId)) {
      user.billingAddresses.push(updatedBillId);
    }

    await user.save();

    const updatedUser = await User.findById(userId).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );

    // sendEmail(user, "Strike'O Profile Update", {
    //   updateProfile: true,
    //   newPass: password,
    // });

    return next(
      new OkResponse({
        user: updatedUser.toJSON(),
        activeBillingAddress: billingToUpdate
          ? billingToUpdate
          : updatedUser.toJSON().activeBillingAddress,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse(error));
  }
};
const deleteBillingAddress = async (req, res, next) => {
  const { id } = req.params;
  const userId = req?.user?.id || req?.user?._id;
  try {
    if (!id || !userId) {
      return next(new BadRequestResponse("Missing required parameters"));
    }
    const user = await User.findById(userId);

    if (!user) {
      return next(new BadRequestResponse("User not found"));
    }

    const billingToUpdate = await Billing.findById(id);

    if (!billingToUpdate) {
      return next(new BadRequestResponse("Address not found"));
    }
    // const updatedBillId = billingToUpdate?._id || billingToUpdate?.id;

    if (id === String(user?.activeBillingAddress)) {
      return next(
        new BadRequestResponse("The selected address couldn't be deleted.")
      );
    }

    const filtered = user?.billingAddresses?.filter((b) => String(b) !== id);
    user.billingAddresses = filtered;
    await user.save();
    await Billing.deleteOne({ _id: id });
    const updatedUser = await User.findById(userId).populate(
      "role cart activeBillingAddress billingAddresses favouriteProducts"
    );
    return next(
      new OkResponse({
        user: updatedUser.toJSON(),
        activeBillingAddress: updatedUser.toJSON().activeBillingAddress,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse(error));
  }
};

const getUserOrders = async (req, res, next) => {
  try {
    const { page, search, limit, completed } = req.query;
    const roleType = req.user.role.type;
    const orderNumber = new RegExp(search, "i");
    const userId = getProductId(req?.user);

    if (roleType === "User" && !req?.user?.id) {
      return next(new BadRequestResponse("Missing required parameters"));
    }
    //Permission based dynamic query
    const { query, populateOps, selectOps } = {
      User: {
        query: {
          customer: req.user.id,
          isConfirmed: true,
          ...(completed ? { isCompleted: completed === "true" } : {}),
          ...(search ? { orderNumber } : {}),
        },
        populateOps: [
          {
            path: "items.product",
            populate: { path: "reviews", match: { user: userId } },
            select: "reviews brand inventory variants seo.slug",
          },
          { path: "payment" },
        ],
        selectOps: {},
      },
    }[roleType];

    const offset = page ? (parseInt(page) - 1) * limit : 0;

    const options = {
      sort: { orderNumber: -1 },
      offset,
      limit,
      select: selectOps,
      populate: populateOps,
    };

    const orders = await Order.paginate(query, options);

    return next(
      new OkResponse({
        totalOrders: orders.totalDocs,
        orders: orders.docs,
        totalPages: orders.totalPages,
        hasPrevPage: orders.hasPrevPage,
        hasNextPage: orders.hasNextPage,
        currentPage: orders.page,
      })
    );
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};
const mongoose = require("mongoose");

const getUserOrderById = async (req, res, next) => {
  try {
    const orderId = req.params?.id;
    const userId = getProductId(req.user);

    // Validate order id format
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return next(new BadRequestResponse("Invalid order ID"));
    }

    // Validate user id format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new BadRequestResponse("Invalid user ID"));
    }

    // Query and population options specific to the 'User' role
    const query = {
      _id: orderId,
      customer: userId,
    };

    const populateOps = [
      {
        path: "items.product",
        populate: { path: "reviews", match: { user: userId } },
        select: "reviews brand inventory variants seo.slug",
      },
      {
        path: "payment",
        select: "method status",
      },
    ];

    // Finding the order for the 'User' role with the specified query and population options
    const order = await Order.findOne(query).populate(populateOps);
    if (!order) {
      return next(new NotFoundResponse("Order not found"));
    }

    return next(new OkResponse(order.toJSON()));
  } catch (error) {
    console.log(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const getUserOrderByQuery = async (req, res, next) => {
  try {
    const { orderId, itemId } = req.query;
    const userId = req?.user?.id || req.user?._id;

    // Validate input parameters
    if (!orderId || !itemId) {
      return next(new BadRequestResponse("orderId, and itemId are required"));
    }

    // Query to find the main order by ID
    const order = await Order.findOne({
      _id: orderId,
      customer: req?.user?.id,
      "items._id": itemId, // Filter by specific item ID within the suborder
    }).populate([
      { path: "items.review", select: "rating description reviewDate" },
      {
        path: "items.product",
        populate: { path: "reviews", match: { user: userId } },
      },
      { path: "payment" },
    ]);

    // Check if the order exists
    if (!order) {
      return next(new BadRequestResponse("Order not found"));
    }

    // Find the specific item
    const item = order?.items.find((i) => getProductId(i) === String(itemId));

    if (!item) {
      return next(new BadRequestResponse("Item not found"));
    }

    // Constructing response object
    const response = {
      ...order.toJSON(),
      item,
    };

    // Return response with the constructed object
    return next(new OkResponse(response));
  } catch (error) {
    console.error(error);
    return next(new BadRequestResponse("Something went wrong"));
  }
};

const UserController = {
  getUser,
  signup,
  login,
  getContext,
  getAllUsers,
  googleAuth,
  facebookAuth,
  authFailed,
  getFavourites,
  addToFavourites,
  removeFromFavourites,
  forgotPassword,
  resetPassword,
  verifyEmail,
  updateProfile,
  updateBillingAddess,
  deleteBillingAddress,
  // User auth V2
  userLogin,
  userSignup,
  sendUserOTP,
  verifyUserOTP,
  forgotUserPassword,
  verifyResetUserPassword,
  resetUserPassword,
  updateUserProfile,
  changeBillingAddess,
  sendUserContactUsFormMail,
  getUserOrders,
  getUserOrderById,
  getUserOrderByQuery,
};

module.exports = UserController;
