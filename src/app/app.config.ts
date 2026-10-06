import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideMarkdown, KATEX_OPTIONS } from 'ngx-markdown';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideMarkdown({
      katexOptions: {
        provide: KATEX_OPTIONS,
        useValue: {
          displayMode: false,
          throwOnError: false,
        },
      },
    })
  ]
};
