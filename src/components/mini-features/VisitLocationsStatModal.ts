import supabase from '../../config/supabase';

type PlaceToVisit = {
  name: string | null;
  location: string | null;
};

const CARD_ID = 'visit-locations-stat-card';
const MODAL_ID = 'visit-locations-modal';
const STYLE_ID = 'visit-locations-modal-style';

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return ch;
    }
  });
}

function ensureStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media (prefers-reduced-motion: reduce) {
      .visit-locations-card--hint,
      .visit-locations-card--active,
      .visit-locations-hint-badge,
      .visit-locations-hint-arrow {
        animation: none !important;
        transition: none !important;
      }
      .visit-locations-card--hint::after {
        display: none !important;
      }
    }

    /* Always-on "interactive" hint (subtle) */
    @keyframes visitLocationsHintGlow {
      0%, 100% { box-shadow: 0 14px 35px rgba(168, 85, 247, 0.10); }
      50% { box-shadow: 0 20px 50px rgba(236, 72, 153, 0.14); }
    }
    @keyframes visitLocationsHintSweep {
      0% { transform: translateX(-120%) skewX(-18deg); opacity: 0; }
      12% { opacity: 0.65; }
      35% { opacity: 0; }
      100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
    }
    @keyframes visitLocationsHintBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-2px); }
    }
    .visit-locations-card--hint {
      position: relative;
      border-color: rgba(168, 85, 247, 0.35) !important;
      animation: visitLocationsHintGlow 2.2s ease-in-out infinite;
    }
    .visit-locations-card--hint::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0) 0%,
        rgba(236,72,153,0.08) 35%,
        rgba(168,85,247,0.10) 50%,
        rgba(255,255,255,0) 75%
      );
      animation: visitLocationsHintSweep 4.25s ease-in-out infinite;
      border-radius: 1rem;
      mix-blend-mode: normal;
    }
    .visit-locations-card--hint:hover {
      border-color: rgba(168, 85, 247, 0.60) !important;
    }
    .visit-locations-hint-badge {
      animation: visitLocationsHintBounce 1.6s ease-in-out infinite;
    }
    .visit-locations-hint-arrow {
      display: inline-block;
      animation: visitLocationsHintBounce 1.1s ease-in-out infinite;
    }

    @keyframes visitLocationsCardGlow {
      0%, 100% { transform: translateY(-6px) scale(1); box-shadow: 0 20px 45px rgba(168, 85, 247, 0.22); }
      50% { transform: translateY(-10px) scale(1.03); box-shadow: 0 28px 60px rgba(236, 72, 153, 0.28); }
    }
    .visit-locations-card--active {
      border-color: rgba(168, 85, 247, 0.65) !important;
      animation: visitLocationsCardGlow 1.25s ease-in-out infinite;
    }
    #${MODAL_ID}.show {
      display: flex;
      animation: visitLocationsModalFadeIn 0.25s ease-out forwards;
    }
    #${MODAL_ID}.show > .visit-locations-modal-panel {
      animation: visitLocationsModalPopIn 0.35s cubic-bezier(.2,.9,.2,1) forwards;
    }
    @keyframes visitLocationsModalFadeIn {
      from { background-color: rgba(0,0,0,0); }
      to { background-color: rgba(0,0,0,0.55); }
    }
    @keyframes visitLocationsModalPopIn {
      from { transform: translateY(20px) scale(0.96); opacity: 0; }
      to { transform: translateY(0) scale(1); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

function ensureModal(): HTMLElement {
  let modal = document.getElementById(MODAL_ID);
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = MODAL_ID;
  modal.className =
    'fixed inset-0 hidden items-start justify-center z-[9999] overflow-y-auto pt-4 sm:pt-8 md:pt-12 px-4 backdrop-blur-sm bg-black/0';

  modal.innerHTML = `
    <div class="visit-locations-modal-panel relative w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transform opacity-0">
      <div class="bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 p-5 sm:p-6">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h3 class="text-xl sm:text-2xl font-bold text-white">Active Visit Locations</h3>
            <p class="text-white/90 text-sm sm:text-base">Places currently available to select in GuestGo</p>
          </div>
          <button id="visit-locations-modal-close" type="button" class="text-white/90 hover:text-white text-2xl leading-none w-10 h-10 rounded-lg hover:bg-white/10 transition-colors" aria-label="Close">
            &times;
          </button>
        </div>
      </div>

      <div class="p-4 sm:p-6">
        <div id="visit-locations-modal-status" class="text-sm text-gray-600 dark:text-gray-300 mb-4"></div>
        <div class="max-h-[60vh] overflow-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <ul id="visit-locations-modal-list" class="divide-y divide-gray-100 dark:divide-gray-800 bg-white dark:bg-gray-900"></ul>
        </div>
        <div class="mt-4 flex justify-end">
          <button id="visit-locations-modal-close-2" type="button" class="px-4 py-2 rounded-lg bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 transition-opacity">
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  return modal;
}

async function loadPlacesIntoModal() {
  const statusEl = document.getElementById('visit-locations-modal-status');
  const listEl = document.getElementById('visit-locations-modal-list');
  if (!statusEl || !listEl) return;

  statusEl.textContent = 'Loading locations...';
  listEl.innerHTML = '';

  const { data, error } = await supabase
    .from('places_to_visit')
    .select('name, location')
    .order('name');

  if (error) {
    statusEl.textContent = 'Unable to load visit locations right now.';
    listEl.innerHTML = `
      <li class="p-4 sm:p-5 text-sm text-red-600 dark:text-red-400">
        ${escapeHtml(error.message || 'Unknown error')}
      </li>
    `;
    return;
  }

  const places = (data || []) as PlaceToVisit[];
  const activePlaces = places.filter((p) => (p?.name || '').trim().length > 0);

  statusEl.textContent = `${activePlaces.length.toLocaleString()} location${activePlaces.length === 1 ? '' : 's'}`;

  if (activePlaces.length === 0) {
    listEl.innerHTML = `
      <li class="p-4 sm:p-5 text-sm text-gray-600 dark:text-gray-300">
        No active visit locations found.
      </li>
    `;
    return;
  }

  listEl.innerHTML = activePlaces
    .map((p) => {
      const name = escapeHtml((p.name || '').trim());
      const addressRaw = (p.location || '').trim();
      const address = addressRaw ? escapeHtml(addressRaw) : 'No address provided';
      return `
        <li class="p-4 sm:p-5 hover:bg-purple-50/60 dark:hover:bg-purple-900/10 transition-colors">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="font-semibold text-gray-900 dark:text-white">${name}</div>
              <div class="text-sm text-gray-600 dark:text-gray-300 mt-0.5 break-words">${address}</div>
            </div>
            <div class="shrink-0 mt-0.5">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Active
              </span>
            </div>
          </div>
        </li>
      `;
    })
    .join('');
}

export function VisitLocationsStatCard() {
  return `
    <!-- Visit Locations (clickable) -->
    <button id="${CARD_ID}" type="button" class="stat-card visit-locations-card--hint group relative bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl shadow-lg p-6 sm:p-8 text-center hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-500 ease-out border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-700 overflow-hidden cursor-pointer focus:outline-none focus:ring-4 focus:ring-purple-300/40 dark:focus:ring-purple-700/30" aria-haspopup="dialog" aria-controls="${MODAL_ID}">
      <div class="absolute top-0 right-0 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full -mr-16 -mt-16 opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
      <div class="relative z-10">
        <div class="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mx-auto mb-4 sm:mb-6 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg">
          <svg class="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
        </div>
        <div id="stat-places" class="text-3xl sm:text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400 mb-2 counter">0</div>
        <div class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">Visit Locations</div>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Active places to visit</p>
        <div class="mt-3 flex items-center justify-center gap-2">
          <span class="visit-locations-hint-badge inline-flex items-center px-2 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/70 dark:bg-white/10 text-purple-700 dark:text-purple-300 border border-purple-200/70 dark:border-purple-800/60">
            Interactive
          </span>
          <span class="text-xs sm:text-sm font-semibold text-purple-700 dark:text-purple-300">
            View locations <span class="visit-locations-hint-arrow">→</span>
          </span>
        </div>
      </div>
    </button>
  `;
}

export function setupVisitLocationsStatModal() {
  const card = document.getElementById(CARD_ID) as HTMLElement | null;
  if (!card) return;

  // Prevent duplicate setup on the same DOM node
  if (card.dataset.initialized === 'true') return;
  card.dataset.initialized = 'true';

  ensureStyles();

  const open = async () => {
    const modal = ensureModal();

    // Visual emphasis on the card while modal is open
    card.classList.add('visit-locations-card--active');
    card.classList.remove('visit-locations-card--hint');

    document.body.style.overflow = 'hidden';
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('show'), 10);

    await loadPlacesIntoModal();
  };

  const close = () => {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.classList.remove('show');
    card.classList.remove('visit-locations-card--active');
    card.classList.add('visit-locations-card--hint');
    document.body.style.overflow = '';

    setTimeout(() => {
      modal.classList.add('hidden');
    }, 350);
  };

  const onCardClick = () => {
    // Quick click feedback
    card.style.transform = 'scale(0.98)';
    setTimeout(() => {
      card.style.transform = '';
    }, 140);
    open();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById(MODAL_ID);
      if (modal && !modal.classList.contains('hidden')) {
        close();
      }
    }
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === card) {
      e.preventDefault();
      open();
    }
  };

  card.addEventListener('click', onCardClick);
  document.addEventListener('keydown', onKeyDown);

  // Modal close interactions (delegated)
  const onDocumentClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.id === 'visit-locations-modal-close' || target.id === 'visit-locations-modal-close-2') {
      close();
      return;
    }

    const modal = document.getElementById(MODAL_ID);
    if (modal && target === modal) {
      close();
    }
  };
  document.addEventListener('click', onDocumentClick);

  // Chain cleanup into About page cleanup so we don't leak listeners/modals
  const prevCleanup = (window as any).cleanupAboutPage;
  (window as any).cleanupAboutPage = () => {
    try {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onDocumentClick);
      card.removeEventListener('click', onCardClick);

      const modal = document.getElementById(MODAL_ID);
      if (modal && document.body.contains(modal)) {
        modal.remove();
      }
      document.body.style.overflow = '';
    } finally {
      if (typeof prevCleanup === 'function') {
        prevCleanup();
      }
    }
  };
}

