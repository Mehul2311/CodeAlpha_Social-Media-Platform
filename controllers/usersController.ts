import { Response } from 'express';
import { getDatabase } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function getUserProfile(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const identifier = req.params.username;
    const currentUserId = req.user?.id;

    // Check if identifier is numeric ID or username
    let user;
    if (/^\d+$/.test(identifier)) {
      user = db.prepare('SELECT id, username, name, email, avatar, bio, city, created_at FROM users WHERE id = ?').get(Number(identifier));
    } else {
      user = db.prepare('SELECT id, username, name, email, avatar, bio, city, created_at FROM users WHERE LOWER(username) = ?').get(identifier.toLowerCase());
    }

    if (!user) {
      return res.status(404).json({ error: 'Yeh sadasya nahi mila (User not found)' });
    }

    const followerCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(user.id)?.count || 0;
    const followingCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?').get(user.id)?.count || 0;
    const postCount = db.prepare('SELECT COUNT(*) as count FROM posts WHERE user_id = ?').get(user.id)?.count || 0;

    let isFollowing = false;
    if (currentUserId && currentUserId !== user.id) {
      const followCheck = db.prepare('SELECT id FROM followers WHERE follower_id = ? AND following_id = ?').get(currentUserId, user.id);
      isFollowing = !!followCheck;
    }

    return res.json({
      user: {
        ...user,
        follower_count: followerCount,
        following_count: followingCount,
        post_count: postCount,
        is_following: isFollowing,
        is_self: currentUserId === user.id
      }
    });
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return res.status(500).json({ error: 'Profile load karne me dikkat aayi' });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Login zaroori hai' });
    }

    const { name, bio, city, avatar } = req.body;

    if (!name || name.trim().length < 2) {
      return res.status(400).json({ error: 'Naam kam se kam 2 akshar ka hona chahiye' });
    }

    db.prepare(`
      UPDATE users
      SET name = ?, bio = ?, city = ?, avatar = COALESCE(?, avatar)
      WHERE id = ?
    `).run(
      name.trim(),
      (bio || '').trim(),
      (city || '').trim(),
      avatar ? avatar.trim() : null,
      userId
    );

    const updatedUser = db.prepare('SELECT id, username, name, email, avatar, bio, city, created_at FROM users WHERE id = ?').get(userId);

    return res.json({
      message: 'Profile safalta se update ho gayi! (Profile updated successfully)',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    return res.status(500).json({ error: 'Profile update me gadbad ho gayi' });
  }
}

export async function getUserPosts(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const identifier = req.params.username;
    const currentUserId = req.user?.id || 0;

    let targetUserId: number;
    if (/^\d+$/.test(identifier)) {
      targetUserId = Number(identifier);
    } else {
      const u = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?').get(identifier.toLowerCase());
      if (!u) {
        return res.status(404).json({ error: 'User nahi mila' });
      }
      targetUserId = u.id;
    }

    const posts = db.prepare(`
      SELECT 
        p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
        u.username, u.name, u.avatar, u.city,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) > 0 as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `).all(currentUserId, targetUserId);

    return res.json({ posts });
  } catch (err) {
    console.error('Error fetching user posts:', err);
    return res.status(500).json({ error: 'Posts load karne me dikkat aayi' });
  }
}

export async function getSuggestions(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const currentUserId = req.user?.id || 0;

    // Get 6 users not followed by current user, ordered by total follower count
    const suggestions = db.prepare(`
      SELECT 
        u.id, u.username, u.name, u.avatar, u.bio, u.city,
        (SELECT COUNT(*) FROM followers f WHERE f.following_id = u.id) as follower_count
      FROM users u
      WHERE u.id != ? 
        AND u.id NOT IN (SELECT following_id FROM followers WHERE follower_id = ?)
      ORDER BY follower_count DESC, RANDOM()
      LIMIT 6
    `).all(currentUserId, currentUserId);

    return res.json({ suggestions });
  } catch (err) {
    console.error('Error fetching suggestions:', err);
    return res.status(500).json({ error: 'Suggestions load karne me dikkat aayi' });
  }
}

export async function getFollowers(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const identifier = req.params.username;
    const currentUserId = req.user?.id || 0;

    let targetUserId: number;
    if (/^\d+$/.test(identifier)) {
      targetUserId = Number(identifier);
    } else {
      const u = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?').get(identifier.toLowerCase());
      if (!u) {
        return res.status(404).json({ error: 'User nahi mila' });
      }
      targetUserId = u.id;
    }

    const followers = db.prepare(`
      SELECT 
        u.id, u.username, u.name, u.avatar, u.bio, u.city,
        (SELECT COUNT(*) FROM followers f2 WHERE f2.follower_id = ? AND f2.following_id = u.id) > 0 as is_following
      FROM followers f
      JOIN users u ON f.follower_id = u.id
      WHERE f.following_id = ?
      ORDER BY f.created_at DESC
    `).all(currentUserId, targetUserId);

    return res.json({ followers });
  } catch (err) {
    console.error('Error fetching followers:', err);
    return res.status(500).json({ error: 'Followers list load nahi ho payi' });
  }
}

export async function getFollowing(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const identifier = req.params.username;
    const currentUserId = req.user?.id || 0;

    let targetUserId: number;
    if (/^\d+$/.test(identifier)) {
      targetUserId = Number(identifier);
    } else {
      const u = db.prepare('SELECT id FROM users WHERE LOWER(username) = ?').get(identifier.toLowerCase());
      if (!u) {
        return res.status(404).json({ error: 'User nahi mila' });
      }
      targetUserId = u.id;
    }

    const following = db.prepare(`
      SELECT 
        u.id, u.username, u.name, u.avatar, u.bio, u.city,
        (SELECT COUNT(*) FROM followers f2 WHERE f2.follower_id = ? AND f2.following_id = u.id) > 0 as is_following
      FROM followers f
      JOIN users u ON f.following_id = u.id
      WHERE f.follower_id = ?
      ORDER BY f.created_at DESC
    `).all(currentUserId, targetUserId);

    return res.json({ following });
  } catch (err) {
    console.error('Error fetching following:', err);
    return res.status(500).json({ error: 'Following list load nahi ho payi' });
  }
}
