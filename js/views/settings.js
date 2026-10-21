import { icon } from '../ui/html.js';
import { formatDay } from '../dates.js';

export function settings(d) {
  const { settings: s } = d.state;
  const last = s.lastBackup ? `Último backup em ${formatDay(s.lastBackup)}.` : 'Nenhum backup feito ainda.';
  return `<header class="page-head">
      <h1>Ajustes</h1>
      <p>Tudo fica salvo neste navegador. Faça backup de vez em quando, principalmente antes de trocar de aparelho.</p>
    </header>
    <div class="settings">
      <section class="setting">
        <div><h2>Som da guitarra</h2><p>Tocar na guitarra da tela Hoje solta um power chord distorcido.</p></div>
        <label class="switch"><input type="checkbox" data-sound ${s.sound ? 'checked' : ''} aria-label="Som da guitarra"><span></span></label>
      </section>
      <section class="setting">
        <div><h2>Backup</h2><p>${last} O arquivo guarda aulas, treinos, recordes e patches.</p></div>
        <div class="actions">
          <button class="btn small" type="button" data-action="export">${icon('download')} Exportar</button>
          <label class="btn small ghost">${icon('upload')} Importar<input class="sr" type="file" accept="application/json,.json" data-import></label>
        </div>
      </section>
      <section class="setting">
        <div><h2>Modo livre</h2><p>Abre todas as aulas e provas sem esperar os 3 setlists. A ofensiva e os patches continuam valendo.</p></div>
        <label class="switch"><input type="checkbox" data-free ${s.freeMode ? 'checked' : ''} aria-label="Modo livre"><span></span></label>
      </section>
      <section class="setting danger">
        <div><h2>Apagar tudo</h2><p>Zera aulas, treinos, ofensiva e patches deste navegador. Não tem volta sem um backup.</p></div>
        <button class="btn small ghost" type="button" data-action="reset">Apagar</button>
      </section>
    </div>
    <p class="credits">FORJA é um app pessoal. Fontes Chivo e Grenze Gotisch (Google Fonts, licença OFL). Animações com GSAP 3.13 (licença padrão GreenSock, gratuita). Guitarra 3D com Three.js (licença MIT).</p>`;
}
