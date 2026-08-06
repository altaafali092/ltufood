import type { Auth } from '@/types/auth';
import Echo from 'laravel-echo';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            [key: string]: unknown;
           
        };
    }
}


declare global {
  interface Window {
    Pusher: any;
    Echo: Echo<any>;
  }
}

export {};