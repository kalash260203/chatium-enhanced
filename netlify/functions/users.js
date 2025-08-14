const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

// Import models
const User = require("../../models/User.js");
const FriendRequest = require("../../models/FriendRequest.js");
const { connectDB } = require("../../lib/db.js");

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
    const body = event.body ? JSON.parse(event.body) : {};

    // Route handling
    if (path.includes('/api/users/recommended') && method === 'GET') {
      return await getRecommendedUsers(user);
    }
    
    if (path.includes('/api/users/friends') && method === 'GET') {
      return await getMyFriends(user);
    }
    
    if (path.includes('/api/users/friend-requests') && method === 'GET') {
      return await getFriendRequests(user);
    }

    if (path.includes('/api/users/outgoing-requests') && method === 'GET') {
      return await getOutgoingFriendReqs(user);
    }

    if (path.includes('/api/users/send-friend-request/') && method === 'POST') {
      const recipientId = path.split('/send-friend-request/')[1];
      return await sendFriendRequest(user, recipientId);
    }

    if (path.includes('/api/users/accept-friend-request/') && method === 'POST') {
      const requestId = path.split('/accept-friend-request/')[1];
      return await acceptFriendRequest(user, requestId);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' }),
    };

  } catch (error) {
    console.error('User function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

async function getRecommendedUsers(currentUser) {
  try {
    const recommendedUsers = await User.find({
      $and: [
        { _id: { $ne: currentUser._id } }, //exclude current user
        { _id: { $nin: currentUser.friends } }, // exclude current user's friends
        { isOnboarded: true },
      ],
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(recommendedUsers),
    };
  } catch (error) {
    console.error("Error in getRecommendedUsers:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}

async function getMyFriends(currentUser) {
  try {
    const user = await User.findById(currentUser._id)
      .select("friends")
      .populate("friends", "fullName profilePic nativeLanguage learningLanguage");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(user.friends),
    };
  } catch (error) {
    console.error("Error in getMyFriends:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}

async function sendFriendRequest(currentUser, recipientId) {
  try {
    const myId = currentUser._id.toString();

    // prevent sending req to yourself
    if (myId === recipientId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "You can't send friend request to yourself" }),
      };
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Recipient not found" }),
      };
    }

    // check if user is already friends
    if (recipient.friends.includes(myId)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "You are already friends with this user" }),
      };
    }

    // check if a req already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: recipientId },
        { sender: recipientId, recipient: myId },
      ],
    });

    if (existingRequest) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "A friend request already exists between you and this user" }),
      };
    }

    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: recipientId,
    });

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify(friendRequest),
    };
  } catch (error) {
    console.error("Error in sendFriendRequest:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}

async function acceptFriendRequest(currentUser, requestId) {
  try {
    const friendRequest = await FriendRequest.findById(requestId);

    if (!friendRequest) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "Friend request not found" }),
      };
    }

    // Verify the current user is the recipient
    if (friendRequest.recipient.toString() !== currentUser._id.toString()) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ message: "You are not authorized to accept this request" }),
      };
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // add each user to the other's friends array
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
    });

    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Friend request accepted" }),
    };
  } catch (error) {
    console.log("Error in acceptFriendRequest:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}

async function getFriendRequests(currentUser) {
  try {
    const incomingReqs = await FriendRequest.find({
      recipient: currentUser._id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: currentUser._id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ incomingReqs, acceptedReqs }),
    };
  } catch (error) {
    console.log("Error in getFriendRequests:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}

async function getOutgoingFriendReqs(currentUser) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: currentUser._id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(outgoingRequests),
    };
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs:", error.message);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}
