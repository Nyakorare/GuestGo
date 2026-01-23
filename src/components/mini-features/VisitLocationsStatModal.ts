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
      to { background-color: rgba(0,0,0,0.65); }
    }
    @keyframes visitLocationsModalPopIn {
      from { transform: translateY(30px) scale(0.94); opacity: 0; }
      50% { transform: translateY(-5px) scale(1.01); }
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
    <div class="visit-locations-modal-panel relative w-full max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border-2 border-blue-200 dark:border-blue-800/50 overflow-hidden transform opacity-0">
      <!-- Header with new blue/teal gradient -->
      <div class="relative bg-gradient-to-br from-blue-600 via-cyan-500 to-teal-500 p-6 sm:p-8 overflow-hidden">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div class="relative flex items-start justify-between gap-4">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <svg class="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <div>
              <h3 class="text-2xl sm:text-3xl font-extrabold text-white mb-2">Visit Locations</h3>
              <p class="text-white/95 text-sm sm:text-base font-medium">Active places available in GuestGo</p>
            </div>
          </div>
          <button id="visit-locations-modal-close" type="button" class="flex-shrink-0 text-white/90 hover:text-white w-10 h-10 rounded-xl hover:bg-white/20 backdrop-blur-sm transition-all duration-200 flex items-center justify-center border border-white/20 hover:border-white/40" aria-label="Close">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Content area -->
      <div class="p-5 sm:p-7 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div id="visit-locations-modal-status" class="flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-300 mb-5 px-2"></div>
        <div class="max-h-[60vh] overflow-auto rounded-2xl border-2 border-blue-100 dark:border-blue-900/50 bg-white dark:bg-gray-900 shadow-inner">
          <ul id="visit-locations-modal-list" class="divide-y divide-blue-50 dark:divide-blue-900/30"></ul>
        </div>
        <div class="mt-6 flex justify-end">
          <button id="visit-locations-modal-close-2" type="button" class="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold hover:from-blue-700 hover:to-cyan-700 transform hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-xl">
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

  statusEl.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>Loading locations...</span>';
  listEl.innerHTML = '';

  const { data, error } = await supabase
    .from('places_to_visit')
    .select('name, location')
    .order('name');

  if (error) {
    statusEl.innerHTML = '<span class="inline-flex items-center gap-2 text-red-600 dark:text-red-400"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>Unable to load visit locations</span>';
    listEl.innerHTML = `
      <li class="p-5 sm:p-6">
        <div class="flex items-start gap-3 text-red-600 dark:text-red-400">
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div class="text-sm font-medium">${escapeHtml(error.message || 'Unknown error occurred')}</div>
        </div>
      </li>
    `;
    return;
  }

  const places = (data || []) as PlaceToVisit[];
  const activePlaces = places.filter((p) => (p?.name || '').trim().length > 0);

  statusEl.innerHTML = `<span class="inline-flex items-center gap-2"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>${activePlaces.length.toLocaleString()} location${activePlaces.length === 1 ? '' : 's'} found</span>`;

  if (activePlaces.length === 0) {
    listEl.innerHTML = `
      <li class="p-5 sm:p-6">
        <div class="flex flex-col items-center justify-center gap-3 text-gray-500 dark:text-gray-400 py-8">
          <svg class="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          <p class="text-sm font-medium">No active visit locations found</p>
        </div>
      </li>
    `;
    return;
  }

  listEl.innerHTML = activePlaces
    .map((p, index) => {
      const name = escapeHtml((p.name || '').trim());
      const addressRaw = (p.location || '').trim();
      const address = addressRaw ? escapeHtml(addressRaw) : 'No address provided';
      return `
        <li class="p-5 sm:p-6 hover:bg-blue-50/80 dark:hover:bg-blue-900/20 transition-all duration-200 group">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-110 transition-transform duration-200">
              ${index + 1}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-4 mb-1.5">
                <h4 class="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">${name}</h4>
                <span class="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active
                </span>
              </div>
              <div class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <svg class="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span class="break-words">${address}</span>
              </div>
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

