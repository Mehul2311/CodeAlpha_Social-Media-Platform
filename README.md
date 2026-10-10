# चौपाल (Chaupal) - "अपनी बात, अपनों के साथ"

A full-stack Indian mini social media web platform celebrating local culture, discussions, festivals, and authentic community connections across India.

---

## 🚀 Tech Stack

- **Frontend**: HTML5, CSS3 (Modular: base, layout, components, animations), Vanilla JavaScript (ES6+ Modules)
- **Backend**: Node.js & Express.js
- **Database**: SQLite with tables for users, posts, comments, likes, and followers with foreign keys & performance indexes
- **Authentication**: bcrypt password hashing, JSON Web Tokens (JWT) / HTTP-only cookies
- **Libraries & Assets**: GSAP for fluid entrance reveals and micro-interactions, Google Fonts (Poppins & Mukta/Hind), Font Awesome 6

---

## 📦 Setup & Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Seed the database**:
   Seeds 14 realistic Indian users from Delhi, Kochi, Pune, Kolkata, Ludhiana, Chennai, Hyderabad, Mumbai, Bangalore, Jaipur, Lucknow, Ahmedabad, Dehradun, and Guwahati, with 32+ posts, threaded comments, and interactions:
   ```bash
   npm run seed
   ```

3. **Start the application**:
   ```bash
   npm start
   # or for development:
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

---

## 🌐 REST API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register a new member (name, username, email, password, city, bio)
- `POST /api/auth/login` - Authenticate member with username/email and password
- `POST /api/auth/logout` - Clear session cookie
- `GET /api/auth/me` - Retrieve current logged-in user profile & metrics

### Users & Profiles (`/api/users`)
- `GET /api/users/profile/:username` - Fetch user profile with stats and follow status
- `PUT /api/users/profile` - Update profile (name, bio, city, avatar)
- `GET /api/users/posts/:username` - Fetch posts by specific user
- `GET /api/users/suggestions` - Get suggested community members to follow
- `GET /api/users/:username/followers` - List of followers for user
- `GET /api/users/:username/following` - List of members followed by user

### Posts & Feed (`/api/posts`)
- `GET /api/posts` - Retrieve feed (`type=following`, `type=all`, `type=trending`, `tag=ChaiTime`, `search=query`)
- `GET /api/posts/:id` - Fetch single post details
- `POST /api/posts` - Create new post (content, optional image URL)
- `PUT /api/posts/:id` - Edit post (author only)
- `DELETE /api/posts/:id` - Delete post (author only)
- `POST /api/posts/:id/like` - Instant like / unlike toggle

### Comments (`/api/comments`)
- `GET /api/comments/post/:postId` - Get threaded comments hierarchy
- `POST /api/comments/post/:postId` - Add top-level comment or nested reply (`parent_id`)
- `DELETE /api/comments/:id` - Delete comment (author or post owner)

### Follow System (`/api/follow`)
- `POST /api/follow/:userId` - Follow or unfollow user

---

## 🇮🇳 Special Indian Identity Features
- **Palette**: Saffron (`#FF9933`), Deep Green (`#138808`), Ashoka Navy (`#000080`), and warm Marigold
- **Time Greetings**: Automatic detection of local time (Suprabhat 🌅, Namaste ☀️, Shubh Sandhya 🌇, Shubh Ratri 🌙)
- **Indian Festival Banner**: Festive highlights (Diwali, Holi, Navratri, Azadi Ka Amrit Mahotsav)
- **Timestamps & Numbers**: Indian Standard Time (IST) formatting and Indian numerical system (e.g. 1.2K, 1.5L)
- **Interactive Micro-animations**: Heart and Diya particle bursts, button ripples, and card hover lift
