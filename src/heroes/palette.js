import * as THREE from 'three';

/**
 * Paleta da camada 3D.
 *
 * WebGL não lê custom properties do CSS, então algum valor em JS é
 * inevitável — mas eram ~40 literais espalhados por quatro heroes, em
 * quatro notações (hex JS, token CSS, rgba() literal e float normalizado).
 * Trocar o acento da marca exigia find-and-replace em três sintaxes.
 *
 * Os valores espelham src/tokens/colors.css. `#C0282A` do radar do Globe
 * era órfão — não correspondia a token nenhum — e foi absorvido aqui.
 */
export const HERO_COLORS = {
  background: '#0a0a0a',
  crimson: '#8B1A1A',
  crimsonBright: '#F06070',
  /* Marca de dado. Com o tone mapping agora honesto, #8B1A1A chega à tela
     como #8B1A1A de verdade — 2.1:1 sobre quase-preto, abaixo do mínimo de
     3:1 para conteúdo não-textual. Estrutura (halo, equador, atmosfera)
     segue no crimson de identidade; o que codifica dado usa este passo,
     espelhando --color-data-primary no CSS. */
  dataPoint: '#d34e45',
  sweep: '#C03030',
  offwhite: '#e8e6e1',
};

/** Instâncias THREE.Color pré-construídas — nunca alocar em useFrame. */
export const HERO_THREE_COLORS = Object.fromEntries(
  Object.entries(HERO_COLORS).map(([k, v]) => [k, new THREE.Color(v)])
);

/**
 * Retarget da paleta 3D a partir do bloco `theme` do config.
 *
 * Muta os registros no lugar em vez de devolver novos: os heroes são
 * lazy-loaded e importam HERO_COLORS/HERO_THREE_COLORS por referência, e as
 * instâncias THREE.Color já estão em uso dentro de loops de frame — trocar a
 * referência não chegaria até elas.
 *
 * Chamado por applyTheme() antes do primeiro paint, portanto antes de qualquer
 * hero montar.
 */
export function retargetHeroColors(partial = {}) {
  for (const [k, v] of Object.entries(partial)) {
    if (typeof v !== 'string' || !(k in HERO_COLORS)) continue;
    HERO_COLORS[k] = v;
    HERO_THREE_COLORS[k]?.set(v);
  }
}

/**
 * Configuração compartilhada do <Canvas>.
 *
 * `flat` é o item crítico: sem ele o R3F aplica ACESFilmicToneMapping por
 * padrão, e nenhum material do projeto setava toneMapped={false}. O
 * #8B1A1A autorado aqui passava pela curva ACES e chegava à tela como
 * outro pixel — que não batia com var(--color-crimson) do Badge a 20px de
 * distância sobre o mesmo canvas. A "integração visual completa" do v1.0
 * era desmentida por um default.
 */
export const CANVAS_GL = { antialias: true, alpha: false };

/** dpr limitado: em telas 3x o custo de fragment shading triplica sem ganho. */
export const CANVAS_DPR = [1, 2];

export function applyClearColor(gl) {
  gl.setClearColor(HERO_COLORS.background, 1);
}
