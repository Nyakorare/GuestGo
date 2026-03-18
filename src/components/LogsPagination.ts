import { scrollToTop } from '../utils/scrollToTop';

/**
 * Enhanced Logs Pagination Component
 * Features:
 * - Page number input with ellipsis (1....[input]...last)
 * - Hover animations
 * - Smooth transitions
 */

export interface LogsPaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function createLogsPagination(config: LogsPaginationConfig): string {
  const { currentPage, totalPages, totalItems, pageSize, onPageChange } = config;

  if (totalPages <= 1) {
    return `
      <div class="logs-pagination flex items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
        <div class="flex items-center text-sm text-gray-700 dark:text-gray-300">
          <span>Page 1 of 1 (${totalItems} ${totalItems === 1 ? 'log' : 'logs'} total)</span>
        </div>
      </div>
    `;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page number display logic
  let pageNumbers: (number | string)[] = [];
  
  if (totalPages <= 7) {
    // Show all pages if 7 or fewer
    pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  } else {
    // Always show first page
    pageNumbers.push(1);
    
    if (currentPage <= 4) {
      // Near the start: 1 2 3 4 5 ... last
      pageNumbers.push(2, 3, 4, 5);
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 3) {
      // Near the end: 1 ... (n-4) (n-3) (n-2) (n-1) n
      pageNumbers.push('...');
      for (let i = totalPages - 4; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // In the middle: 1 ... (current-1) current (current+1) ... last
      pageNumbers.push('...');
      pageNumbers.push(currentPage - 1, currentPage, currentPage + 1);
      pageNumbers.push('...');
      pageNumbers.push(totalPages);
    }
  }

  return `
    <div class="logs-pagination flex items-center justify-between mt-6 px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all duration-300 hover:shadow-md">
      <div class="flex items-center text-sm text-gray-700 dark:text-gray-300">
        <span>Showing ${startItem}-${endItem} of ${totalItems} ${totalItems === 1 ? 'log' : 'logs'}</span>
      </div>
      
      <div class="flex items-center space-x-2">
        <!-- Previous Button -->
        <button 
          id="logsPrevBtn"
          class="logs-pagination-btn px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          ${currentPage <= 1 ? 'disabled' : ''}
        >
          <span class="flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Previous
          </span>
        </button>

        <!-- Page Numbers -->
        <div class="flex items-center space-x-1">
          ${pageNumbers.map((page, index) => {
            if (page === '...') {
              return `<span class="px-2 text-gray-500 dark:text-gray-400">...</span>`;
            }
            const pageNum = page as number;
            const isActive = pageNum === currentPage;
            return `
              <button
                class="logs-page-number px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out transform hover:scale-110 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 hover:shadow-lg'
                    : 'text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'
                }"
                data-page="${pageNum}"
                ${isActive ? 'aria-current="page"' : ''}
              >
                ${pageNum}
              </button>
            `;
          }).join('')}
        </div>

        <!-- Page Input -->
        <div class="flex items-center space-x-1 px-2">
          <span class="text-sm text-gray-500 dark:text-gray-400">Go to:</span>
          <input
            type="number"
            id="logsPageInput"
            min="1"
            max="${totalPages}"
            value="${currentPage}"
            class="w-16 px-2 py-1 text-sm text-center text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500"
            placeholder="Page"
          />
          <span class="text-sm text-gray-500 dark:text-gray-400">of ${totalPages}</span>
        </div>

        <!-- Next Button -->
        <button 
          id="logsNextBtn"
          class="logs-pagination-btn px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md transition-all duration-200 ease-in-out hover:bg-gray-50 dark:hover:bg-gray-600 hover:text-gray-900 dark:hover:text-gray-100 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
          ${currentPage >= totalPages ? 'disabled' : ''}
        >
          <span class="flex items-center">
            Next
            <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </span>
        </button>
      </div>
    </div>
  `;
}

export function setupLogsPaginationListeners(
  config: LogsPaginationConfig,
  onPageChange: (page: number) => void
): void {
  const { currentPage, totalPages } = config;

  // Previous button
  const prevBtn = document.getElementById('logsPrevBtn') as HTMLButtonElement;
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        scrollToTop();
        onPageChange(currentPage - 1);
      }
    });
  }

  // Next button
  const nextBtn = document.getElementById('logsNextBtn') as HTMLButtonElement;
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPage < totalPages) {
        scrollToTop();
        onPageChange(currentPage + 1);
      }
    });
  }

  // Page number buttons
  const pageButtons = document.querySelectorAll('.logs-page-number');
  pageButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const page = parseInt((btn as HTMLElement).dataset.page || '1');
      if (page >= 1 && page <= totalPages && page !== currentPage) {
        scrollToTop();
        onPageChange(page);
      }
    });
  });

  // Page input
  const pageInput = document.getElementById('logsPageInput') as HTMLInputElement;
  if (pageInput) {
    // Ensure input value matches current page
    pageInput.value = currentPage.toString();
    
    pageInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const page = parseInt(pageInput.value);
        if (page >= 1 && page <= totalPages && page !== currentPage) {
          scrollToTop();
          onPageChange(page);
        } else if (page < 1) {
          scrollToTop();
          onPageChange(1);
        } else if (page > totalPages) {
          scrollToTop();
          onPageChange(totalPages);
        }
      }
    });

    pageInput.addEventListener('blur', () => {
      const page = parseInt(pageInput.value);
      if (isNaN(page) || page < 1) {
        pageInput.value = currentPage.toString();
      } else if (page > totalPages) {
        pageInput.value = totalPages.toString();
      } else {
        pageInput.value = currentPage.toString();
      }
    });
  }
}

