# Chaupal 🪔

> *Apni baat, apno ke saath.*

Chaupal is a mini social media web app where people can create a profile, share posts, comment, like and follow each other. The name comes from the *chaupal*, the open meeting place in Indian villages where everyone gathers to talk.

I built this as part of my internship (Task 2: Social Media Platform).

![Home feed](screenshots/feed.png)

## Features

- **User profiles:** signup, login, logout, bio, city, avatar, follower/following counts, edit profile
- **Posts:** create, edit and delete posts with optional images
- **Comments:** comment on any post and view the full thread
- **Likes:** like/unlike posts with instant UI updates
- **Follow system:** follow/unfollow users, followers and following lists, suggested people to follow
- **Feed:** shows posts from the people you follow
- **UI:** responsive layout, light/dark mode, smooth animations and Hindi + English greetings
- **Seeded data:** sample users and posts so the app doesn't look empty on first run

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| Auth | bcrypt, JWT |
| Animations | CSS animations, GSAP, AOS |
| Icons / Fonts | Font Awesome, Google Fonts (Poppins, Hind) |

## Database Design

Five tables: `users`, `posts`, `comments`, `likes` and `followers`, linked with foreign keys. Deleting a post also removes its comments and likes.

## Project Structure

```
chaupal/
├── public/          # frontend (html, css, js)
├── routes/          # API route definitions
├── controllers/     # request handling logic
├── middleware/      # auth and validation
├── db/              # database setup and queries
├── seed/            # sample data script
├── server.js
└── package.json
```

## Getting Started

**Prerequisites:** Node.js 18 or above

```bash
# clone the repo
git clone https://github.com/Mehul2311/chaupal.git
cd chaupal

# install dependencies
npm install

# add sample users and posts
npm run seed

# start the server
npm start
```

The app runs at `http://localhost:3000`.

### Environment variables

Create a `.env` file in the root folder:

```
PORT=3000
JWT_SECRET=your_secret_key_here
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login and get a token |
| GET | `/api/users/:username` | Get a user's profile |
| PUT | `/api/users/me` | Update your profile |
| GET | `/api/posts` | Get your feed |
| POST | `/api/posts` | Create a post |
| PUT | `/api/posts/:id` | Edit a post |
| DELETE | `/api/posts/:id` | Delete a post |
| POST | `/api/posts/:id/like` | Like or unlike a post |
| GET | `/api/posts/:id/comments` | Get comments on a post |
| POST | `/api/posts/:id/comments` | Add a comment |
| POST | `/api/follow/:userId` | Follow or unfollow a user |

## Screenshots

| Home | Profile | Mobile |
|------|---------|--------|
| ![Home](screenshots/home.png) | ![Profile](screenshots/profile.png) | ![Mobile](screenshots/mobile.png) |

## What I Learned

- Designing a relational schema for users, posts and followers
- Securing routes with JWT and hashing passwords with bcrypt
- Building a responsive layout with CSS Grid and Flexbox
- Adding animations without hurting performance

## Future Improvements

- Direct messaging
- Notifications
- Image upload to cloud storage
- Search for users and hashtags
- Hindi/regional language toggle

## Author

**Mehul Sharma**
Computer Science Student at SRM Institute of Science and Technology

Made with ❤️ in India
