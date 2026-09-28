import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../modelos/baseDatos';
import { ok, error } from '../utilidades/respuesta';
import { RequestAutenticada } from '../middleware/autenticacion';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    error(res, 'Email y contraseña requeridos');
    return;
  }

  const usuario = db.prepare(`
    SELECT u.*, e.nombre as empresa_nombre
    FROM usuarios u
    JOIN empresas e ON e.id = u.empresa_id
    WHERE u.email = ? AND u.activo = 1
  `).get(email) as any;

  if (!usuario) {
    error(res, 'Credenciales incorrectas', 401);
    return;
  }

  const valida = await bcrypt.compare(password, usuario.password_hash);
  if (!valida) {
    error(res, 'Credenciales incorrectas', 401);
    return;
  }

  const token = jwt.sign(
    {
      usuarioId: usuario.id,
      empresaId: usuario.empresa_id,
      rol: usuario.rol,
      email: usuario.email,
    },
    process.env.JWT_SECRET || 'secreto',
    { expiresIn: '8h' }
  );

  ok(res, {
    token,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      empresaId: usuario.empresa_id,
      empresaNombre: usuario.empresa_nombre,
    },
  });
}

export function perfil(req: RequestAutenticada, res: Response): void {
  const usuario = db.prepare(`
    SELECT u.id, u.nombre, u.email, u.rol, u.empresa_id,
           e.nombre as empresa_nombre, e.logo_url
    FROM usuarios u
    JOIN empresas e ON e.id = u.empresa_id
    WHERE u.id = ?
  `).get(req.usuario?.usuarioId) as any;

  if (!usuario) {
    error(res, 'Usuario no encontrado', 404);
    return;
  }

  ok(res, usuario);
}
