import { Request, Response, NextFunction } from 'express';

export function validateSignup(req: Request, res: Response, next: NextFunction) {
  const { username, name, email, password } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username kam se kam 3 characters ka hona chahiye (Username must be at least 3 characters)' });
  }

  // Allow letters, numbers, underscores, and dots (Indian social username format)
  const usernameRegex = /^[a-zA-Z0-9_.]+$/;
  if (!usernameRegex.test(username.trim())) {
    return res.status(400).json({ error: 'Username me sirf letters, numbers, dots aur underscores allowed hain' });
  }

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return res.status(400).json({ error: 'Kripya apna poora naam likhein (Please enter your full name)' });
  }

  if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
    return res.status(400).json({ error: 'Sahi email address dalein (Please enter a valid email address)' });
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: 'Password kam se kam 6 characters ka hona chahiye (Password must be at least 6 characters)' });
  }

  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { identifier, password } = req.body;

  if (!identifier || typeof identifier !== 'string' || identifier.trim().length === 0) {
    return res.status(400).json({ error: 'Username ya email dalna zaroori hai (Username or email is required)' });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({ error: 'Password dalna zaroori hai (Password is required)' });
  }

  next();
}

export function validatePost(req: Request, res: Response, next: NextFunction) {
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Post me kuch likhna zaroori hai (Post content cannot be empty)' });
  }

  if (content.trim().length > 1500) {
    return res.status(400).json({ error: 'Post 1500 characters se chhota hona chahiye (Post exceeds 1500 characters)' });
  }

  next();
}

export function validateComment(req: Request, res: Response, next: NextFunction) {
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.trim().length === 0) {
    return res.status(400).json({ error: 'Comment me kuch likhna zaroori hai (Comment cannot be empty)' });
  }

  if (content.trim().length > 500) {
    return res.status(400).json({ error: 'Comment 500 characters se chhota hona chahiye (Comment exceeds 500 characters)' });
  }

  next();
}
