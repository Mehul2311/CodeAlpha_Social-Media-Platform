import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase } from '../db/database.ts';
import { AuthRequest, JWT_SECRET } from '../middleware/auth.ts';

export async function signup(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const { username, name, email, password, city, avatar } = req.body;

    const trimmedUsername = username.trim().toLowerCase();
    const trimmedEmail = email.trim().toLowerCase();

    // Check duplicate username or email
    const existing = db.prepare('SELECT id, username, email FROM users WHERE username = ? OR email = ?').get(trimmedUsername, trimmedEmail);
    if (existing) {
      if (existing.username === trimmedUsername) {
        return res.status(409).json({ error: 'Yeh username pehle se kisi aur ka hai (Username already taken)' });
      }
      return res.status(409).json({ error: 'Yeh email pehle se registered hai (Email already registered)' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const defaultAvatar = avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${trimmedUsername}`;

    const insertResult = db.prepare(`
      INSERT INTO users (username, name, email, password_hash, avatar, bio, city)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      trimmedUsername,
      name.trim(),
      trimmedEmail,
      passwordHash,
      defaultAvatar,
      (req.body.bio || 'Chaupal pe naye sadasya!').trim(),
      (city || 'India').trim()
    );

    const newUserId = insertResult.lastInsertRowid;

    // Follow a couple of default community ambassadors so new users have a feed immediately
    const ambassadors = db.prepare('SELECT id FROM users WHERE username IN (?, ?, ?)').all('aarav_sharma', 'priya.nair', 'tanvi_k');
    ambassadors.forEach((amb: any) => {
      if (amb.id !== newUserId) {
        db.prepare('INSERT OR IGNORE INTO followers (follower_id, following_id) VALUES (?, ?)').run(newUserId, amb.id);
      }
    });

    const userPayload = {
      id: newUserId,
      username: trimmedUsername,
      email: trimmedEmail,
      name: name.trim()
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const createdUser = db.prepare('SELECT id, username, name, email, avatar, bio, city, created_at FROM users WHERE id = ?').get(newUserId);

    return res.status(201).json({
      message: 'Chaupal par aapka swaagat hai! (Welcome to Chaupal)',
      user: createdUser,
      token
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Kuch gadbad ho gayi, dobara try karo (Server error during signup)' });
  }
}

export async function login(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const { identifier, password } = req.body;
    const cleanIdentifier = identifier.trim().toLowerCase();

    const user = db.prepare(`
      SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?
    `).get(cleanIdentifier, cleanIdentifier);

    if (!user) {
      return res.status(401).json({ error: 'Galat username ya password (Incorrect username or password)' });
    }

    const isValid = bcrypt.compareSync(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Galat username ya password (Incorrect username or password)' });
    }

    const userPayload = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name
    };

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const { password_hash, ...safeUser } = user;

    return res.json({
      message: `Namaste ${safeUser.name}! Aapka swaagat hai.`,
      user: safeUser,
      token
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Kuch gadbad ho gayi, dobara try karo (Server error during login)' });
  }
}

export async function logout(req: AuthRequest, res: Response) {
  res.clearCookie('token');
  return res.json({ message: 'Safalta se logout ho gaya (Logged out successfully)' });
}

export async function getCurrentUser(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.json({ user: null });
    }

    const db = await getDatabase();
    const user = db.prepare(`
      SELECT id, username, name, email, avatar, bio, city, created_at
      FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) {
      return res.json({ user: null });
    }

    // Get counts
    const followerCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(user.id)?.count || 0;
    const followingCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?').get(user.id)?.count || 0;
    const postCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(user.id)?.count || 0;

    return res.json({
      user: {
        ...user,
        follower_count: followerCount,
        following_count: followingCount,
        post_count: postCount
      }
    });
  } catch (err: any) {
    console.error('Get current user error:', err);
    return res.status(500).json({ error: 'User data load karne me dikkat aayi' });
  }
}
