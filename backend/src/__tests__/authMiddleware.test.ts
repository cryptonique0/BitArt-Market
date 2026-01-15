import { authenticateToken } from '../services/achievementService';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

jest.mock('jsonwebtoken');

describe('authenticateToken middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('should return 401 if no token is provided', () => {
    authenticateToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Access token is missing or invalid' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 403 if token is invalid', () => {
    req.headers['authorization'] = 'Bearer invalidtoken';
    (jwt.verify as jest.Mock).mockImplementation((_, __, callback) => callback(new Error('Invalid token')));

    authenticateToken(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next if token is valid', () => {
    req.headers['authorization'] = 'Bearer validtoken';
    (jwt.verify as jest.Mock).mockImplementation((_, __, callback) => callback(null, { id: 1 }));

    authenticateToken(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});