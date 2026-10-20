export const icon = (name, cls = '') => `<svg class="icon ${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;

export const tick = () => '<span class="box"><svg viewBox="0 0 24 24" aria-hidden="true"><path class="tick" d="m4.5 12.5 5 5 10-11"/></svg></span>';

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const fmtNum = (n) => String(n).replace('.', ',');
