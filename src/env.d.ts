/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL: string;
	readonly VITE_SUPABASE_ANON_KEY: string;
	readonly VITE_EMAILJS_PUBLIC_KEY: string;
	readonly VITE_EMAILJS_SERVICE_ID: string;
	readonly VITE_EMAILJS_TEMPLATE_ID: string;
	readonly VITE_BREVO_API_KEY?: string;
	readonly VITE_BREVO_FROM_EMAIL?: string;
	readonly VITE_BREVO_FROM_NAME?: string;
	readonly VITE_EMAIL_API_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}


declare global {
	interface Window {
		openScheduleModal: () => void;
		navigateToPage: (path: string) => void;
	}
}

export {};

