const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Import models and utilities
const User = require("../../models/User.js");
const { connectDB } = require("../../lib/db.js");
const { generateStreamToken } = require("../../lib/stream.js");

// Helper function to handle CORS
const headers = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Credentials': 'true',
};

// Helper function to parse cookies
function parseCookies(cookieHeader) {
  const cookies = {};
  if (cookieHeader) {
    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = value;
    });
  }
  return cookies;
}

// Helper function to authenticate user from cookie
async function authenticateUser(event) {
  const cookies = parseCookies(event.headers.cookie);
  const token = cookies.jwt;
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId).select("-password");
    return user;
  } catch (error) {
    return null;
  }
}

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    // Connect to database
    await connectDB();
    
    // Authenticate user
    const user = await authenticateUser(event);
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Unauthorized" }),
      };
    }

    const { path } = event;
    const method = event.httpMethod;

    // Route handling
    if (path.includes('/api/chat/token') && method === 'GET') {
      return await getStreamToken(user);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' }),
    };

  } catch (error) {
    console.error('Chat function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

async function getStreamToken(user) {
  try {
    const token = generateStreamToken(user._id.toString());

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ token }),
    };
  } catch (error) {
    console.log("Error in getStreamToken:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}
