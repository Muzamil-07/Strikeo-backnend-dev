/** @format */

const { OkResponse, BadRequestResponse } = require("express-http-response");
const ChatbotHistory = require("../models/ChatbotHistory");
const axios = require("axios");
const apiEndpoint = process.env.CHATBOT_API_URL;
const openChatProtocol = async (req, res, next) => {
  const { type } = req.query;
  // List of random bot responses
  const openingMessages =
    "Hi there! I am Nisa, Your personal AI assistant. How can I assist you?";

  try {
    // Store chat history in MongoDB
    const chatHistory = {
      botResponse: openingMessages,
      prompt: [],
    };

    return next(new OkResponse(chatHistory));
  } catch (error) {
    // console.log(error.message);
    return next(new BadRequestResponse(error?.message));
  }
};
const sendMessage = async (req, res, next) => {
  const user = req?.user?.id || req?.user?._id;
  const email = req?.user?.email || null; // for Flask API
  const { userMessage, type } = req.body;

  try {
    // Check if user is authenticated
    if (!user) {
      return next(
        new BadRequestResponse("You don't have permission to send messages")
      );
    }

    let botPrompt = [];
    const requestObj = {
      question: userMessage,
      email,
      type,
    };

    // Send the message to the Flask API and handle the response
    const flaskResponse = await axios.post(apiEndpoint, requestObj);

    // Check Flask API status and response
    if (flaskResponse.status !== 200) {
      return next(
        new BadRequestResponse(
          `AI responded with an error: ${flaskResponse.statusText}`
        )
      );
    }

    const botResponse = flaskResponse.data; // Assuming Flask returns a JSON with 'response'

    // Validate bot response content
    if (!botResponse || !botResponse.answer) {
      return next(new BadRequestResponse("AI not responding properly!"));
    }

    // Store chat history in MongoDB
    const chatHistory = new ChatbotHistory({
      user,
      userMessage,
      botResponse: botResponse.answer, // Handle bot answer
      botPrompt, // Can be extended with more data if needed
      type, // user, vendor, others
    });

    await chatHistory.save();

    // Populate 'user' field before sending the response
    const populatedChatHistory = await ChatbotHistory.findById(
      chatHistory._id
    ).populate("user", "firstName lastName email _id profileImage");

    // Send the final response with chat history
    return next(new OkResponse(populatedChatHistory));
  } catch (error) {
    // Enhanced error handling for various cases
    if (error.response) {
      // Axios-specific error handling
      return next(
        new BadRequestResponse(
          `Error from Flask API: ${error.response.statusText || error.message}`
        )
      );
    }
    return next(
      new BadRequestResponse(error?.message || "An unknown error occurred.")
    );
  }
};

const getAllChatbotHistory = async (req, res, next) => {
  try {
    const { limit, page, userMessage, botResponse, type, user } = req.query;
    const limitPage = parseInt(limit, 10) || 10; // Ensure limit is an integer, default to 10
    const currentPage = parseInt(page, 10) || 1; // Ensure page is an integer, default to 1
    const offset = (currentPage - 1) * limitPage;

    // Build the query object dynamically based on provided filters
    const query = {};

    if (user) query.user = user; // Filter by user if logged in
    if (userMessage) query.userMessage = { $regex: userMessage, $options: "i" }; // Case-insensitive search
    if (botResponse) query.botResponse = { $regex: botResponse, $options: "i" }; // Case-insensitive search
    if (type) query.type = type; // Exact match on type

    const options = {
      offset,
      limit: limitPage,
      sort: { createdAt: -1 }, // Adjust sorting as needed
    };

    const chatbotHistory = await ChatbotHistory.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: chatbotHistory.totalDocs,
        chatbotHistory: chatbotHistory.docs,
        totalPages: chatbotHistory.totalPages,
        currentPage: chatbotHistory.page, // Correctly set current page
        hasPrevPage: chatbotHistory.hasPrevPage,
        hasNextPage: chatbotHistory.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error.message);
    return next(new BadRequestResponse(error.message));
  }
};
const getUserChatHistory = async (req, res, next) => {
  const user = req?.user?.id || req?.user?._id;
  if (!user) return next(new BadRequestResponse("You are not authenticated"));

  try {
    const { limit, page } = req.query;
    const limitPage = parseInt(limit, 10) || 10; // Ensure limit is an integer, default to 10
    const currentPage = parseInt(page, 10) || 1; // Ensure page is an integer, default to 1
    const offset = (currentPage - 1) * limitPage;

    // Build the query object dynamically based on provided filters
    const query = {};

    if (user) query.user = user; // Filter by user if logged in

    const options = {
      offset,
      limit: limitPage,
      sort: { createdAt: -1 }, // Adjust sorting as needed
    };

    const chatbotHistory = await ChatbotHistory.paginate(query, options);

    return next(
      new OkResponse({
        totalProducts: chatbotHistory.totalDocs,
        chatbotHistory: chatbotHistory.docs,
        totalPages: chatbotHistory.totalPages,
        currentPage: chatbotHistory.page, // Correctly set current page
        hasPrevPage: chatbotHistory.hasPrevPage,
        hasNextPage: chatbotHistory.hasNextPage,
      })
    );
  } catch (error) {
    console.error(error.message);
    return next(new BadRequestResponse(error.message));
  }
};

const ChatController = {
  sendMessage,
  getAllChatbotHistory,
  getUserChatHistory,
  openChatProtocol,
};

module.exports = ChatController;
