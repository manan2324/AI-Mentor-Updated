import User from '../models/User.js';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const name = `${firstName} ${lastName}`;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        purchasedCourses: user.purchasedCourses,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        purchasedCourses: user.purchasedCourses,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio,
        purchasedCourses: user.purchasedCourses,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Purchase a course
// @route   POST /api/users/purchase-course
// @access  Private
const purchaseCourse = async (req, res) => {
  try {
    const { courseId, courseTitle } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if course is already purchased
    const alreadyPurchased = user.purchasedCourses.some(course => course.courseId == courseId);
    if (alreadyPurchased) {
      return res.status(400).json({ message: 'Course already purchased' });
    }

    // Add course to purchased courses
    user.purchasedCourses.push({
      courseId: parseInt(courseId),
      courseTitle,
      purchaseDate: new Date(),
      progress: {
        completedLessons: [],
        currentLesson: null
      }
    });

    await user.save();

    res.json({
      message: 'Course purchased successfully',
      purchasedCourses: user.purchasedCourses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update course progress
// @route   PUT /api/users/course-progress
// @access  Private
const updateCourseProgress = async (req, res) => {
  try {
    const { courseId, completedLessons, currentLesson, studyHours } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the course in purchased courses
    const courseIndex = user.purchasedCourses.findIndex(course => course.courseId == courseId);
    if (courseIndex === -1) {
      return res.status(404).json({ message: 'Course not found in purchased courses' });
    }

    let newLessonsCompleted = 0;

    // Update progress
    if (completedLessons) {
      const existingCompleted = user.purchasedCourses[courseIndex].progress.completedLessons || [];
      const newCompleted = completedLessons
        .filter(lessonId => !existingCompleted.some(cl => cl.lessonId === lessonId))
        .map(lessonId => ({
          lessonId,
          completedAt: new Date()
        }));
      user.purchasedCourses[courseIndex].progress.completedLessons = [...existingCompleted, ...newCompleted];
      newLessonsCompleted = newCompleted.length;
    }

    if (currentLesson) {
      user.purchasedCourses[courseIndex].progress.currentLesson = currentLesson;
    }

    // Update analytics
    if (newLessonsCompleted > 0 || (studyHours && studyHours > 0)) {
      const today = new Date();
      const todayString = today.toDateString();

      // Check if this is a new study day
      const isNewDay = !user.analytics.lastStudyDate ||
        new Date(user.analytics.lastStudyDate).toDateString() !== todayString;

      if (isNewDay) {
        user.analytics.daysStudied += 1;
        user.analytics.lastStudyDate = today;
      }

      // Add study hours (assume 0.1667 hours per lesson if not provided)
      const hoursToAdd = studyHours || (newLessonsCompleted * 0.1667);
      user.analytics.totalHours += hoursToAdd;

      // Add study session
      user.analytics.studySessions.push({
        date: today,
        hours: hoursToAdd
      });

      // Update learning hours chart (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dateKey = today.toISOString().split('T')[0];
      const existingEntry = user.analytics.learningHoursChart.find(entry => entry.date === dateKey);

      if (existingEntry) {
        existingEntry.hours += hoursToAdd;
      } else {
        user.analytics.learningHoursChart.push({
          date: dateKey,
          hours: hoursToAdd
        });
      }

      // Keep only last 7 days
      user.analytics.learningHoursChart = user.analytics.learningHoursChart
        .filter(entry => new Date(entry.date) >= sevenDaysAgo)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      // Recalculate derived analytics
      const totalPossibleDays = 30;
      user.analytics.attendance = Math.min((user.analytics.daysStudied / totalPossibleDays) * 100, 100);
      user.analytics.dailyHours = user.analytics.daysStudied > 0 ? user.analytics.totalHours / user.analytics.daysStudied : 0;
      user.analytics.totalCourses = user.purchasedCourses.length;

      // Check if course is completed
      const Course = (await import('../models/Course.js')).default;
      const courseData = await Course.findOne({ id: courseId });
      if (courseData) {
        const totalLessons = courseData.modules?.flatMap(module => module.lessons).length || 0;
        const completedLessonsCount = user.purchasedCourses[courseIndex].progress.completedLessons.length;

        if (completedLessonsCount >= totalLessons && totalLessons > 0) {
          user.analytics.completedCourses += 1;
          user.analytics.certificates += 1;
        }
      }
    }

    await user.save();

    res.json({
      message: 'Progress updated successfully',
      purchasedCourses: user.purchasedCourses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      user.name = `${req.body.firstName || user.firstName || ''} ${req.body.lastName || user.lastName || ''}`.trim();
      user.email = req.body.email || user.email;
      user.bio = req.body.bio || user.bio;

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bio: updatedUser.bio,
        purchasedCourses: updatedUser.purchasedCourses,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get watched videos data
// @route   GET /api/users/watched-videos
// @access  Private
const getWatchedVideos = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const Course = (await import('../models/Course.js')).default;

    // Get all courses data
    const allCourses = await Course.find({});
    const courseMap = {};
    allCourses.forEach(course => {
      courseMap[course.id] = course;
    });

    const watchedVideos = [];

    // Process each purchased course
    user.purchasedCourses.forEach(purchasedCourse => {
      const courseData = courseMap[purchasedCourse.courseId];

      if (courseData && courseData.modules) {
        // Flatten all lessons from all modules
        courseData.modules.forEach(module => {
          if (module.lessons) {
            module.lessons.forEach(lesson => {
              const completedLesson = purchasedCourse.progress.completedLessons.find(
                cl => cl.lessonId === lesson.id
              );

              let progress = 0;
              let status = "not-started";
              let lastWatched = null;

              if (completedLesson) {
                // This lesson has been watched/completed
                progress = 100;
                status = "completed";
                lastWatched = completedLesson.completedAt;
              } else if (purchasedCourse.progress.currentLesson &&
                         purchasedCourse.progress.currentLesson.lessonId === lesson.id) {
                // This is the current lesson being watched
                progress = purchasedCourse.progress.currentLesson.progress || 50; // Use stored progress or default to 50%
                status = "in-progress";
                lastWatched = new Date(); // Current time
              }

              // Include all lessons from purchased courses
              watchedVideos.push({
                id: lesson.id,
                title: lesson.title,
                course: purchasedCourse.courseTitle,
                courseId: purchasedCourse.courseId,
                duration: lesson.duration || "15:00", // Default duration if not specified
                progress,
                status,
                lastWatched,
                thumbnail: lesson.thumbnail || `/course-thumbnails/${purchasedCourse.courseId}.png`,
                moduleTitle: module.title
              });
            });
          }
        });
      }
    });

    // Sort by last watched date (most recent first)
    watchedVideos.sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));

    // Calculate metrics
    const totalHours = user.analytics.totalHours || 0;
    const videosCompleted = watchedVideos.filter(v => v.status === 'completed').length;
    const avgSessionMinutes = user.analytics.dailyHours ? Math.round(user.analytics.dailyHours * 60) : 23;
    const learningStreak = calculateLearningStreak(user.analytics.studySessions);

    res.json({
      videos: watchedVideos,
      metrics: {
        totalHours: totalHours.toFixed(1),
        videosCompleted,
        avgSession: `${avgSessionMinutes}min`,
        learningStreak: `${learningStreak} days`
      },
      courses: user.purchasedCourses.map(pc => ({
        id: pc.courseId,
        title: pc.courseTitle
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user settings
// @route   PUT /api/users/settings
// @access  Private
const updateUserSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { notifications, security, appearance } = req.body;

    // Update notifications settings
    if (notifications) {
      user.settings.notifications = {
        ...user.settings.notifications,
        ...notifications
      };
    }

    // Update security settings
    if (security) {
      user.settings.security = {
        ...user.settings.security,
        ...security
      };
    }

    // Update appearance settings
    if (appearance) {
      user.settings.appearance = {
        ...user.settings.appearance,
        ...appearance
      };
    }

    const updatedUser = await user.save();

    res.json({
      message: 'Settings updated successfully',
      settings: updatedUser.settings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to calculate learning streak
const calculateLearningStreak = (studySessions) => {
  if (!studySessions || studySessions.length === 0) return 0;

  const sortedSessions = studySessions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(session => new Date(session.date).toDateString());

  const uniqueDates = [...new Set(sortedSessions)];
  let streak = 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  // Check if studied today or yesterday to continue streak
  if (uniqueDates.includes(today)) {
    streak = 1;
    let checkDate = yesterday;
    while (uniqueDates.includes(checkDate)) {
      streak++;
      checkDate = new Date(new Date(checkDate) - 86400000).toDateString();
    }
  } else if (uniqueDates.includes(yesterday)) {
    streak = 1;
    let checkDate = new Date(Date.now() - 2 * 86400000).toDateString();
    while (uniqueDates.includes(checkDate)) {
      streak++;
      checkDate = new Date(new Date(checkDate) - 86400000).toDateString();
    }
  }

  return streak;
};

export { registerUser, loginUser, getUserProfile, updateUserProfile, purchaseCourse, updateCourseProgress, getWatchedVideos, updateUserSettings };
