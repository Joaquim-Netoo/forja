// Carrega o palco 3D uma vez só, sob demanda. Sem WebGL ou com movimento
// reduzido, devolve null e as telas ficam com a silhueta estática.
import { reduced } from './motion.js';

let pending = null;

function webglOk() {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

export function loadStage() {
  if (reduced() || !webglOk()) return Promise.resolve(null);
  pending ??= import('./guitar3d.js')
    .then((m) => m.createStage())
    .catch(() => null);
  return pending;
}
