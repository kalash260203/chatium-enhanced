const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

// Import models and utilities
const User = require("../../models/User.js");
const { connectDB } = require("../../lib/db.js");
const { upsertStreamUser } = require("../../lib/stream.js");

// Helper function to handle CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*'
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
      headers: corsHeaders,
      body: '',
    };
  }

  try {
    // Connect to database
    await connectDB();
    
    const { path } = event;
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};

    // Route handling
    if (path.includes('/api/auth/signup') && method === 'POST') {
      return await handleSignup(body);
    }
    
    if (path.includes('/api/auth/login') && method === 'POST') {
      return await handleLogin(body);
    }
    
    if (path.includes('/api/auth/logout') && method === 'POST') {
      return await handleLogout();
    }

    // GET /auth/me - Get current user
    if (path.includes('/api/auth/me') && method === 'GET') {
        try {
            console.log('Auth check - headers:', JSON.stringify(headers, null, 2));
            console.log('Auth check - cookies:', headers.cookie);
            
            const token = getTokenFromCookies(headers.cookie);
            console.log('Auth check - token found:', !!token);
            
            if (!token) {
                console.log('No token found in cookies');
                return {
                    statusCode: 401,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: 'No token provided' })
                };
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('Token decoded successfully for user:', decoded.userId);
            
            const user = await User.findById(decoded.userId).select('-password');
            if (!user) {
                console.log('User not found for ID:', decoded.userId);
                return {
                    statusCode: 401,
                    headers: {
                        ...corsHeaders,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: 'User not found' })
                };
            }

            console.log('Auth check successful for user:', user.email);
            return {
                statusCode: 200,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user })
            };
        } catch (error) {
            console.error('Auth check error:', error.message);
            return {
                statusCode: 401,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: 'Invalid token' })
            };
        }
    }    if (path.includes('/api/auth/onboard') && method === 'POST') {
      const user = await authenticateUser(event);
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ message: "Unauthorized" }),
        };
      }
      return await handleOnboard(body, user);
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ message: 'Route not found' }),
    };

  } catch (error) {
    console.error('Auth function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: error.message }),
    };
  }
};

async function handleSignup(body) {
  const { email, password, fullName } = body;

  try {
    if (!email || !password || !fullName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "All fields are required" }),
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Password must be at least 6 characters" }),
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Invalid email format" }),
      };
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "Email already exists, please use a different one" }),
      };
    }

    const idx = Math.floor(Math.random() * 100) + 1;
    const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,
    });

    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    return {
      statusCode: 201,
      headers: {
        ...headers,
        'Set-Cookie': `jwt=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=${process.env.NODE_ENV === 'production' ? 'None' : 'Lax'}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`,
      },
      body: JSON.stringify({ success: true, user: newUser }),
    };
  } catch (error) {
    console.log("Error in signup:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}

async function handleLogin(body) {
  try {
    const { email, password } = body;

    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ message: "All fields are required" }),
      };
    }

    const user = await User.findOne({ email });
    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Invalid email or password" }),
      };
    }

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ message: "Invalid email or password" }),
      };
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Set-Cookie': `jwt=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=${process.env.NODE_ENV === 'production' ? 'None' : 'Lax'}; ${process.env.NODE_ENV === 'production' ? 'Secure;' : ''}`,
      },
      body: JSON.stringify({ success: true, user }),
    };
  } catch (error) {
    console.log("Error in login:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}

async function handleLogout() {
  return {
    statusCode: 200,
    headers: {
      ...headers,
      'Set-Cookie': 'jwt=; HttpOnly; Path=/; Max-Age=0',
    },
    body: JSON.stringify({ success: true, message: "Logout successful" }),
  };
}

async function handleOnboard(body, user) {
  try {
    const { fullName, bio, nativeLanguage, learningLanguage, location } = body;

    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          message: "All fields are required",
          missingFields: [
            !fullName && "fullName",
            !bio && "bio",
            !nativeLanguage && "nativeLanguage",
            !learningLanguage && "learningLanguage",
            !location && "location",
          ].filter(Boolean),
        }),
      };
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        ...body,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ message: "User not found" }),
      };
    }

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.fullName}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, user: updatedUser }),
    };
  } catch (error) {
    console.error("Onboarding error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
}
