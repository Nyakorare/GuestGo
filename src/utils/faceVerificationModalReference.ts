type ReferenceConfig = {
  imageDataUrl?: string | null;
  title?: string;
  subtitle?: string;
};

const REFERENCE_CARD_ID = 'faceVerificationReferenceCard';

export function clearFaceVerificationReference(): void {
  const existing = document.getElementById(REFERENCE_CARD_ID);
  if (existing) {
    existing.remove();
  }
}

export function renderFaceVerificationReference(config: ReferenceConfig): void {
  clearFaceVerificationReference();

  if (!config.imageDataUrl || !config.imageDataUrl.startsWith('data:image/')) {
    return;
  }

  const statusEl = document.getElementById('faceStatus');
  if (!statusEl || !statusEl.parentElement) {
    return;
  }

  const card = document.createElement('div');
  card.id = REFERENCE_CARD_ID;
  card.className = 'mt-2 rounded-md border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-3 py-2';
  card.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="h-14 w-14 overflow-hidden rounded-md border border-blue-300 dark:border-blue-700 bg-white">
        <img src="${config.imageDataUrl}" alt="Saved entrance face reference" class="h-full w-full object-cover" />
      </div>
      <div class="min-w-0">
        <div class="text-xs font-semibold text-blue-800 dark:text-blue-200">${config.title || 'Verification Reference'}</div>
        <div class="text-xs text-blue-700 dark:text-blue-300 truncate">${config.subtitle || 'Comparing against saved entrance face.'}</div>
      </div>
    </div>
  `;

  statusEl.insertAdjacentElement('afterend', card);
}
