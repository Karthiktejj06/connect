const { createClerkClient } = require('@clerk/clerk-sdk-node');

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify the session using Clerk
    const sessionClaims = await clerkClient.verifyToken(token);
    
    // In Clerk, the user ID is in the 'sub' claim
    const userId = sessionClaims.sub;
    
    // You might want to fetch more user info from Clerk if needed
    // or just attach the userId to the request
    const user = await clerkClient.users.getUser(userId);
    
    req.user = {
      _id: user.id,
      username: user.username || `${user.firstName} ${user.lastName}`.trim() || user.emailAddresses[0].emailAddress.split('@')[0],
      email: user.emailAddresses[0].emailAddress
    };

    next();
  } catch (error) {
    console.error('Clerk Auth Error:', error.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { protect };
