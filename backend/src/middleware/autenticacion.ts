import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface TokenPayload {
  usuarioId: string;
  empresaId: string;
  rol: string;
  email: string;
}

export interface RequestAutenticada extends Request {
  usuario?: TokenPayload;
}

export function autenticar(req: RequestAutenticada, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token de autenticación requerido' });
    return;
  }

  const token = authHeader.substring(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'secreto') as TokenPayload;
    req.usuario = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

export function soloAdmin(req: RequestAutenticada, res: Response, next: NextFunction): void {
  if (!req.usuario || req.usuario.rol !== 'admin') {
    res.status(403).json({ error: 'Acceso restringido a administradores' });
    return;
  }
  next();
}
