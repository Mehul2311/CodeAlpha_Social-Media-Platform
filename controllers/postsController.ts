import { Response } from 'express';
import { getDatabase } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function getFeed(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const currentUserId = req.user?.id || 0;
    const type = req.query.type as string || (currentUserId ? 'following' : 'all');
    const tag = req.query.tag as string;
    const search = req.query.search as string;

    let baseQuery = `
      SELECT 
        p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
        u.username, u.name, u.avatar, u.city,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) > 0 as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
    `;

    const whereClauses: string[] = [];
    const queryParams: any[] = [currentUserId];

    if (tag) {
      whereClauses.push(`p.content LIKE ?`);
      queryParams.push(`%#${tag.replace('#', '')}%`);
    } else if (search) {
      whereClauses.push(`(p.content LIKE ? OR u.name LIKE ? OR u.username LIKE ?)`);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    } else if (type === 'following' && currentUserId > 0) {
      whereClauses.push(`(p.user_id = ? OR p.user_id IN (SELECT following_id FROM followers WHERE follower_id = ?))`);
      queryParams.push(currentUserId, currentUserId);
    }

    if (whereClauses.length > 0) {
      baseQuery += ` WHERE ` + whereClauses.join(' AND ');
    }

    if (type === 'trending') {
      baseQuery += ` ORDER BY ((like_count * 2) + comment_count) DESC, p.created_at DESC LIMIT 50`;
    } else {
      baseQuery += ` ORDER BY p.created_at DESC LIMIT 50`;
    }

    let posts = db.prepare(baseQuery).all(...queryParams);

    // If following feed was selected but produced 0 posts (e.g. brand new user with no follows),
    // provide community posts so the screen is never a blank dead-end
    if (type === 'following' && posts.length === 0 && !search && !tag) {
      const fallbackQuery = `
        SELECT 
          p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
          u.username, u.name, u.avatar, u.city,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
          (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) > 0 as is_liked
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT 30
      `;
      posts = db.prepare(fallbackQuery).all(currentUserId);
    }

    return res.json({ posts });
  } catch (err) {
    console.error('Error fetching feed:', err);
    return res.status(500).json({ error: 'Feed load karne me dikkat aayi' });
  }
}

export async function getPostById(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const postId = Number(req.params.id);
    const currentUserId = req.user?.id || 0;

    const post = db.prepare(`
      SELECT 
        p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
        u.username, u.name, u.avatar, u.city,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) > 0 as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(currentUserId, postId);

    if (!post) {
      return res.status(404).json({ error: 'Yeh post nahi mila' });
    }

    return res.json({ post });
  } catch (err) {
    console.error('Error fetching post:', err);
    return res.status(500).json({ error: 'Post load nahi ho paya' });
  }
}

export async function createPost(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Login zaroori hai' });
    }

    const { content, image_url } = req.body;

    const insertResult = db.prepare(`
      INSERT INTO posts (user_id, content, image_url)
      VALUES (?, ?, ?)
    `).run(userId, content.trim(), image_url ? image_url.trim() : null);

    const newPostId = insertResult.lastInsertRowid;

    const post = db.prepare(`
      SELECT 
        p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
        u.username, u.name, u.avatar, u.city,
        0 as like_count,
        0 as comment_count,
        0 as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(newPostId);

    return res.status(201).json({
      message: 'Post safalta se publish ho gaya!',
      post
    });
  } catch (err) {
    console.error('Error creating post:', err);
    return res.status(500).json({ error: 'Post create karne me dikkat aayi' });
  }
}

export async function updatePost(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const userId = req.user?.id;
    const postId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Login zaroori hai' });
    }

    const post = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post nahi mila' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ error: 'Aap sirf apni post edit kar sakte hain' });
    }

    const { content, image_url } = req.body;
    db.prepare(`
      UPDATE posts 
      SET content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(content.trim(), image_url ? image_url.trim() : null, postId);

    const updatedPost = db.prepare(`
      SELECT 
        p.id, p.user_id, p.content, p.image_url, p.created_at, p.updated_at,
        u.username, u.name, u.avatar, u.city,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) as like_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?) > 0 as is_liked
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `).get(userId, postId);

    return res.json({
      message: 'Post update ho gaya!',
      post: updatedPost
    });
  } catch (err) {
    console.error('Error updating post:', err);
    return res.status(500).json({ error: 'Post update me dikkat aayi' });
  }
}

export async function deletePost(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const userId = req.user?.id;
    const postId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Login zaroori hai' });
    }

    const post = db.prepare('SELECT id, user_id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post nahi mila' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ error: 'Aap sirf apni post delete kar sakte hain' });
    }

    db.prepare('DELETE FROM posts WHERE id = ?').run(postId);

    return res.json({ message: 'Post safalta se delete ho gaya!' });
  } catch (err) {
    console.error('Error deleting post:', err);
    return res.status(500).json({ error: 'Post delete karne me dikkat aayi' });
  }
}

export async function toggleLike(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const userId = req.user?.id;
    const postId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Like karne ke liye login karein' });
    }

    const existingLike = db.prepare('SELECT id FROM likes WHERE post_id = ? AND user_id = ?').get(postId, userId);

    let isLiked = false;
    if (existingLike) {
      db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(postId, userId);
      isLiked = false;
    } else {
      db.prepare('INSERT INTO likes (post_id, user_id) VALUES (?, ?)').run(postId, userId);
      isLiked = true;
    }

    const likeCount = db.prepare('SELECT COUNT(*) as count FROM likes WHERE post_id = ?').get(postId)?.count || 0;

    return res.json({
      is_liked: isLiked,
      like_count: likeCount
    });
  } catch (err) {
    console.error('Error toggling like:', err);
    return res.status(500).json({ error: 'Like update me dikkat aayi' });
  }
}
