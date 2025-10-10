const ChatMessage = require('../../../models/ChatMessage');
const connectDB = require('../../../config/database');
const { setCorsHeaders, handleOptions, protect } = require('../_utils');

module.exports = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    return handleOptions(res);
  }

  try {
    // Connect to database
    await connectDB();

    // Protect route
    const user = await protect(req);

    if (req.method === 'GET') {
      // Get user's conversations
      const conversations = await ChatMessage.aggregate([
        {
          $match: {
            $or: [
              { sender: user._id },
              { receiver: user._id }
            ]
          }
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $group: {
            _id: {
              $cond: [
                { $eq: ['$sender', user._id] },
                '$receiver',
                '$sender'
              ]
            },
            lastMessage: { $first: '$$ROOT' },
            unreadCount: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ['$receiver', user._id] },
                      { $eq: ['$isRead', false] }
                    ]
                  },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: '$user'
        },
        {
          $project: {
            user: {
              _id: '$user._id',
              name: '$user.name',
              email: '$user.email',
              role: '$user.role'
            },
            lastMessage: 1,
            unreadCount: 1
          }
        },
        {
          $sort: { 'lastMessage.createdAt': -1 }
        }
      ]);

      res.json(conversations);
    } else {
      res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Conversations error:', error);
    if (error.message.includes('Not authorized')) {
      return res.status(401).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

