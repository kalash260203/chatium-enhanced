# Chatium Enhanced - Serverless Version

A modern, real-time chat application built with React, Node.js serverless functions, and Stream Chat. This version is optimized for deployment on Netlify with serverless architecture.

## 🚀 Features

- **Real-time Chat**: Powered by Stream Chat API
- **User Authentication**: JWT-based auth with secure cookies
- **Friend System**: Send and accept friend requests
- **User Onboarding**: Complete profile setup
- **Responsive Design**: Built with Tailwind CSS
- **Serverless Architecture**: Deployed on Netlify Functions

## 🛠️ Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Stream Chat React** for real-time messaging
- **Axios** for API calls

### Backend (Serverless)
- **Netlify Functions** (Node.js)
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Stream Chat** API
- **bcryptjs** for password hashing

## 📁 Project Structure

```
serverless-version/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # API and utility functions
│   │   └── store/           # State management
│   └── package.json
├── netlify/
│   └── functions/           # Serverless functions
│       ├── auth.js          # Authentication endpoints
│       ├── users.js         # User management endpoints
│       ├── chat.js          # Chat-related endpoints
│       └── package.json
├── models/                  # MongoDB models
├── lib/                     # Shared utilities
├── netlify.toml            # Netlify configuration
└── package.json
```

## 🚀 Deployment

### Deploy to Netlify

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Serverless version ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [Netlify](https://netlify.com)
   - Click "New site from Git"
   - Choose your repository
   - Set build settings:
     - **Build command**: `cd frontend && npm install && npm run build`
     - **Publish directory**: `frontend/dist`

3. **Environment Variables**:
   Add these in Netlify dashboard:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET_KEY=your_jwt_secret
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   FRONTEND_URL=https://your-netlify-app.netlify.app
   NODE_ENV=production
   ```

## 🔧 Local Development

1. **Install dependencies**:
   ```bash
   cd frontend && npm install
   cd ../netlify/functions && npm install
   ```

2. **Set up environment variables**:
   Create `.env` file in the root:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET_KEY=your_jwt_secret
   STREAM_API_KEY=your_stream_api_key
   STREAM_API_SECRET=your_stream_api_secret
   ```

3. **Run development server**:
   ```bash
   # Frontend only (you'll need to deploy functions to test)
   cd frontend && npm run dev
   ```

## 🌟 Key Differences from Traditional Version

- **Serverless Functions**: Instead of Express.js server
- **Stateless**: Each function call is independent
- **Cold Starts**: Functions may have slight delay on first call
- **No Persistent Connections**: Database connects on each request
- **CORS Handling**: Manual CORS configuration in each function

## 📝 API Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/onboard` - Complete user onboarding
- `GET /api/users/recommended` - Get recommended users
- `GET /api/users/friends` - Get user's friends
- `POST /api/users/send-friend-request/:id` - Send friend request
- `POST /api/users/accept-friend-request/:id` - Accept friend request
- `GET /api/users/friend-requests` - Get friend requests
- `GET /api/chat/token` - Get Stream Chat token

## 🔐 Security Features

- **JWT Authentication** with secure HTTP-only cookies
- **Password Hashing** with bcryptjs
- **CORS Protection** with environment-based origins
- **Input Validation** on all endpoints

## 📱 Responsive Design

The application is fully responsive and works on:
- 📱 Mobile devices
- 📱 Tablets  
- 💻 Desktop computers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

If you encounter any issues:
1. Check the deployment logs in Netlify dashboard
2. Verify all environment variables are set
3. Ensure MongoDB connection string is correct
4. Check Stream Chat API credentials

---

**Built with ❤️ by kalash260203**
