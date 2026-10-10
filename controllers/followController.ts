import { Response } from 'express';
import { getDatabase } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function toggleFollow(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const followerId = req.user?.id;
    const targetUserId = Number(req.params.userId || req.body.userId);

    if (!followerId) {
      return res.status(401).json({ error: 'Follow karne ke liye login karein' });
    }

    if (followerId === targetUserId) {
      return res.status(400).json({ error: 'Aap khud ko follow nahi kar sakte' });
    }

    const targetUser = db.prepare('SELECT id, name, username FROM users WHERE id = ?').get(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User nahi mila' });
    }

    const existingFollow = db.prepare('SELECT id FROM followers WHERE follower_id = ? AND following_id = ?').get(followerId, targetUserId);

    let isFollowing = false;
    if (existingFollow) {
      db.prepare('DELETE FROM followers WHERE follower_id = ? AND following_id = ?').run(followerId, targetUserId);
      isFollowing = false;
    } else {
      db.prepare('INSERT INTO followers (follower_id, following_id) VALUES (?, ?)').run(followerId, targetUserId);
      isFollowing = true;
    }

    const followerCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE following_id = ?').get(targetUserId)?.count || 0;
    const followingCount = db.prepare('SELECT COUNT(*) as count FROM followers WHERE follower_id = ?').get(followerId)?.count || 0;

    return res.json({
      message: isFollowing ? `Ab aap @${targetUser.username} ko follow kar rahe hain!` : `Aapne @${targetUser.username} ko unfollow kar diya`,
      is_following: isFollowing,
      target_follower_count: followerCount,
      my_following_count: followingCount
    });
  } catch (err) {
    console.error('Error toggling follow:', err);
    return res.status(500).json({ error: 'Follow update me dikkat aayi' });
  }
}
