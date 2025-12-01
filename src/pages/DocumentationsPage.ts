import algorithmsDocs from '../../Documentations/ALGORITHMS.md?raw';
import faceDetectionDocs from '../../Documentations/FACE_DETECTION_VERIFICATION.md?raw';
import projectReadme from '../../README.md?raw';
import { marked } from 'marked';

export function DocumentationsPage(): string {
  return `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">GuestGo Documentation</h1>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Technical documentation for core GuestGo systems and features, including an overall platform overview, algorithms, and face detection/verification.
        </p>
      </div>

      <div>
        <!-- Tabs -->
        <div class="border-b border-gray-200 dark:border-gray-700 mb-4 overflow-x-auto">
          <nav id="docsTabs" class="flex space-x-4 text-sm" aria-label="Documentation sections">
            <button data-doc-tab="overview" class="docs-tab active border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 px-3 py-2 whitespace-nowrap">
              Platform Overview
            </button>
            <button data-doc-tab="algorithms" class="docs-tab border-b-2 border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 whitespace-nowrap">
              Algorithms
            </button>
            <button data-doc-tab="face" class="docs-tab border-b-2 border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 px-3 py-2 whitespace-nowrap">
              Face Detection & Verification
            </button>
          </nav>
        </div>

        <!-- Tab Panels -->
        <div id="docsContent" class="bg-white dark:bg-gray-800 shadow rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <div class="text-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p class="text-sm text-gray-600 dark:text-gray-400">Loading documentation...</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function setupDocumentationsPage(): void {
  const docsContent = document.getElementById('docsContent');
  const tabsContainer = document.getElementById('docsTabs');
  if (!docsContent) return;

  // Pre-render HTML for each documentation section
  const enhanceTables = (html: string): string => {
    // Wrap tables in a scroll container and apply Tailwind table styles
    let enhanced = html.replace(
      /<table>/g,
      '<div class="overflow-x-auto"><table class="min-w-full border border-gray-200 dark:border-gray-700 text-xs sm:text-sm table-auto">'
    );

    enhanced = enhanced.replace(/<\/table>/g, '</table></div>');

    // Style thead/tbody if present
    enhanced = enhanced.replace(
      /<thead>/g,
      '<thead class="bg-gray-50 dark:bg-gray-800">'
    );
    enhanced = enhanced.replace(
      /<tbody>/g,
      '<tbody class="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">'
    );

    // Add cell padding/borders
    enhanced = enhanced.replace(
      /<th>/g,
      '<th class="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">'
    );
    enhanced = enhanced.replace(
      /<td>/g,
      '<td class="px-3 py-2 align-top text-xs text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700">'
    );

    return enhanced;
  };

  const overviewHtml = enhanceTables(marked.parse(projectReadme));
  const algorithmsHtml = enhanceTables(marked.parse(algorithmsDocs));
  const faceHtml = enhanceTables(marked.parse(faceDetectionDocs));

  function setActiveTab(tabId: 'overview' | 'algorithms' | 'face') {
    // Update tab button styles
    if (tabsContainer) {
      const buttons = tabsContainer.querySelectorAll<HTMLButtonElement>('.docs-tab');
      buttons.forEach((btn) => {
        const target = btn.getAttribute('data-doc-tab');
        if (target === tabId) {
          btn.classList.add('active');
          btn.classList.remove('text-gray-600', 'dark:text-gray-400', 'border-transparent');
          btn.classList.add('text-blue-600', 'dark:text-blue-400', 'border-blue-600');
        } else {
          btn.classList.remove('active', 'text-blue-600', 'dark:text-blue-400', 'border-blue-600');
          btn.classList.add('text-gray-600', 'dark:text-gray-400', 'border-transparent');
        }
      });
    }

    // Swap content
    let innerHtml = '';
    if (tabId === 'overview') {
      innerHtml = `
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">GuestGo Platform Overview</h2>
        <div class="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-800 dark:text-gray-100 overflow-x-auto">
          ${overviewHtml}
        </div>
      `;
    } else if (tabId === 'algorithms') {
      innerHtml = `
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Algorithms</h2>
        <div class="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-800 dark:text-gray-100 overflow-x-auto">
          ${algorithmsHtml}
        </div>
      `;
    } else {
      innerHtml = `
        <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Face Detection & Verification</h2>
        <div class="prose dark:prose-invert max-w-none text-sm leading-relaxed text-gray-800 dark:text-gray-100 overflow-x-auto">
          ${faceHtml}
        </div>
      `;
    }

    docsContent.innerHTML = innerHtml;
  }

  // Attach click handlers for tabs
  if (tabsContainer) {
    tabsContainer.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('button.docs-tab') as HTMLButtonElement | null;
      if (!button) return;
      const tabId = button.getAttribute('data-doc-tab') as 'overview' | 'algorithms' | 'face' | null;
      if (!tabId) return;
      setActiveTab(tabId);
    });
  }

  // Show overview by default
  setActiveTab('overview');
}
