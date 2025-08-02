import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  

  try {
    const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: No token provided.' });
  }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    req.userId = decoded.userId;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
  }
};
