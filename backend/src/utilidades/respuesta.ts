import { Response } from 'express';

export function ok(res: Response, datos: unknown, mensaje?: string) {
  return res.json({ ok: true, datos, mensaje });
}

export function creado(res: Response, datos: unknown, mensaje?: string) {
  return res.status(201).json({ ok: true, datos, mensaje });
}

export function error(res: Response, mensaje: string, codigo = 400) {
  return res.status(codigo).json({ ok: false, error: mensaje });
}

export function noEncontrado(res: Response, entidad = 'Recurso') {
  return res.status(404).json({ ok: false, error: `${entidad} no encontrado` });
}
