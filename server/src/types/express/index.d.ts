// src/types/express.d.ts or src/auth.d.ts

import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: { _id: string; username: string } | null;
    }
  }
}
