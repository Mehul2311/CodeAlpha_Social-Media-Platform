import { Response } from 'express';
import { getDatabase } from '../db/database.ts';
import { AuthRequest } from '../middleware/auth.ts';

export async function getPostComments(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const postId = Number(req.params.postId);

    const rawComments = db.prepare(`
      SELECT 
        c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at,
        u.username, u.name, u.avatar, u.city
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `).all(postId);

    // Build threaded hierarchy
    const commentMap = new Map<number, any>();
    const topLevelComments: any[] = [];

    rawComments.forEach((c: any) => {
      c.replies = [];
      commentMap.set(c.id, c);
    });

    rawComments.forEach((c: any) => {
      if (c.parent_id && commentMap.has(c.parent_id)) {
        commentMap.get(c.parent_id).replies.push(c);
      } else {
        topLevelComments.push(c);
      }
    });

    return res.json({ comments: topLevelComments });
  } catch (err) {
    console.error('Error fetching comments:', err);
    return res.status(500).json({ error: 'Comments load nahi ho sake' });
  }
}

export async function addComment(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const userId = req.user?.id;
    const postId = Number(req.params.postId);
    const { content, parent_id } = req.body;

    if (!userId) {
      return res.status(401).json({ error: 'Comment karne ke liye login karein' });
    }

    const post = db.prepare('SELECT id FROM posts WHERE id = ?').get(postId);
    if (!post) {
      return res.status(404).json({ error: 'Yeh post exist nahi karti' });
    }

    // If parent_id specified, check it belongs to this post
    if (parent_id) {
      const parent = db.prepare('SELECT id, post_id FROM comments WHERE id = ?').get(parent_id);
      if (!parent || parent.post_id !== postId) {
        return res.status(400).json({ error: 'Invalid parent comment' });
      }
    }

    const insertResult = db.prepare(`
      INSERT INTO comments (post_id, user_id, parent_id, content)
      VALUES (?, ?, ?, ?)
    `).run(postId, userId, parent_id ? Number(parent_id) : null, content.trim());

    const newCommentId = insertResult.lastInsertRowid;

    const newComment = db.prepare(`
      SELECT 
        c.id, c.post_id, c.user_id, c.parent_id, c.content, c.created_at,
        u.username, u.name, u.avatar, u.city
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `).get(newCommentId);

    newComment.replies = [];

    const commentCount = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(postId)?.count || 0;

    return res.status(201).json({
      message: 'Comment add ho gaya!',
      comment: newComment,
      comment_count: commentCount
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    return res.status(500).json({ error: 'Comment post nahi ho paya' });
  }
}

export async function deleteComment(req: AuthRequest, res: Response) {
  try {
    const db = await getDatabase();
    const userId = req.user?.id;
    const commentId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({ error: 'Login zaroori hai' });
    }

    const comment = db.prepare('SELECT id, user_id, post_id FROM comments WHERE id = ?').get(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment nahi mila' });
    }

    // Check if user is author of comment or author of post
    const post = db.prepare('SELECT user_id FROM posts WHERE id = ?').get(comment.post_id);
    if (comment.user_id !== userId && post?.user_id !== userId) {
      return res.status(403).json({ error: 'Aap yeh comment delete nahi kar sakte' });
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);

    const commentCount = db.prepare('SELECT COUNT(*) as count FROM comments WHERE post_id = ?').get(comment.post_id)?.count || 0;

    return res.json({
      message: 'Comment delete ho gaya!',
      comment_count: commentCount
    });
  } catch (err) {
    console.error('Error deleting comment:', err);
    return res.status(500).json({ error: 'Comment delete nahi ho paya' });
  }
}
