// Mock user data (replace with database in production)
const userProfiles = new Map();

// Initialize with demo user
userProfiles.set(1, {
  id: 1,
  username: 'demo',
  email: 'demo@example.com',
  name: 'Demo User',
  preferences: {
    language: 'en',
    currency: '₹',
    theme: 'dark',
    notifications: true
  },
  bookmarks: [
    { symbol: 'AAPL', name: 'Apple Inc.', smartAlertEnabled: true },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', smartAlertEnabled: false },
    { symbol: 'MSFT', name: 'Microsoft Corp.', smartAlertEnabled: true }
  ],
  alerts: [
    {
      id: '1',
      stock: 'AAPL',
      change: '+5%',
      trend: 'Up',
      action: 'Buy',
      message: 'Apple stock showing strong momentum',
      timestamp: new Date().toISOString(),
      priceAtAlert: 175.50,
      recipient: 'demo@example.com'
    },
    {
      id: '2',
      stock: 'TSLA',
      change: '-3%',
      trend: 'Down',
      action: 'Sell',
      message: 'Tesla facing production challenges',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      priceAtAlert: 240.30,
      recipient: 'demo@example.com'
    }
  ]
});

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = userProfiles.get(parseInt(userId));

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { language, currency, theme, notifications } = req.body;

    const profile = userProfiles.get(parseInt(userId));
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Update preferences
    profile.preferences = {
      ...profile.preferences,
      language: language || profile.preferences.language,
      currency: currency || profile.preferences.currency,
      theme: theme || profile.preferences.theme,
      notifications: notifications !== undefined ? notifications : profile.preferences.notifications
    };

    userProfiles.set(parseInt(userId), profile);

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: profile.preferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = userProfiles.get(parseInt(userId));

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: profile.bookmarks || []
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks',
      error: error.message
    });
  }
};

exports.addBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol, name, smartAlertEnabled = false } = req.body;

    const profile = userProfiles.get(parseInt(userId));
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Check if bookmark already exists
    const existingBookmark = profile.bookmarks?.find(b => b.symbol === symbol);
    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: 'Stock already bookmarked'
      });
    }

    // Add new bookmark
    if (!profile.bookmarks) {
      profile.bookmarks = [];
    }

    const newBookmark = { symbol, name, smartAlertEnabled };
    profile.bookmarks.push(newBookmark);
    userProfiles.set(parseInt(userId), profile);

    res.status(201).json({
      success: true,
      message: 'Bookmark added successfully',
      data: newBookmark
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add bookmark',
      error: error.message
    });
  }
};

exports.removeBookmark = async (req, res) => {
  try {
    const userId = req.user.id;
    const { symbol } = req.params;

    const profile = userProfiles.get(parseInt(userId));
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Remove bookmark
    profile.bookmarks = profile.bookmarks?.filter(b => b.symbol !== symbol) || [];
    userProfiles.set(parseInt(userId), profile);

    res.json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark',
      error: error.message
    });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = userProfiles.get(parseInt(userId));

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.json({
      success: true,
      data: profile.alerts || []
    });
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
};

exports.createAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { stock, change, trend, action, message, priceAtAlert } = req.body;

    const profile = userProfiles.get(parseInt(userId));
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Create new alert
    const newAlert = {
      id: Date.now().toString(),
      stock,
      change,
      trend,
      action,
      message,
      priceAtAlert,
      timestamp: new Date().toISOString(),
      recipient: profile.email
    };

    if (!profile.alerts) {
      profile.alerts = [];
    }
    
    profile.alerts.unshift(newAlert); // Add to beginning
    userProfiles.set(parseInt(userId), profile);

    res.status(201).json({
      success: true,
      message: 'Alert created successfully',
      data: newAlert
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create alert',
      error: error.message
    });
  }
};

exports.updateAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const updates = req.body;

    const profile = userProfiles.get(parseInt(userId));
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Find and update alert
    const alertIndex = profile.alerts?.findIndex(a => a.id === id);
    
    if (alertIndex === -1 || alertIndex === undefined) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    profile.alerts[alertIndex] = {
      ...profile.alerts[alertIndex],
      ...updates,
      id // Ensure ID doesn't change
    };

    userProfiles.set(parseInt(userId), profile);

    res.json({
      success: true,
      message: 'Alert updated successfully',
      data: profile.alerts[alertIndex]
    });
  } catch (error) {
    console.error('Update alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: error.message
    });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const profile = userProfiles.get(parseInt(userId));
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    // Remove alert
    profile.alerts = profile.alerts?.filter(a => a.id !== id) || [];
    userProfiles.set(parseInt(userId), profile);

    res.json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete alert',
      error: error.message
    });
  }
};