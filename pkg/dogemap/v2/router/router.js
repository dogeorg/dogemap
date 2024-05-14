import { Router } from '/vendor/@vaadin/router@1.7.5/vaadin-router.min.js';
import { showProfile } from './middleware.js'

let router;

export const getRouter = (targetElement) => {
  if (!router) {
    router = new Router(targetElement);

    // Basic Route Table
    // router.setRoutes([
    //   { path: '/', component: 'map-view' },
    //   { path: '/node/:id*', action: showProfile, component: 'map-view' },
    // ]);

    // More Advanced Route table.  Cached Components.
    router.setRoutes([
      {
        path: '/',
        component: 'map-view',
        action: async (context, commands) => {
          // Render component (ideally an existing)
          const existing = targetElement.querySelector('map-view');
          if (existing) return existing;
          return commands.component('map-view');
        }
      },
      {
        path: '/node/:id*',
        action: async (context, commands) => {
          // Ensure the profile middleware is processed
          await showProfile(context, commands);

          // Render component (ideally an existing)
          const existing = targetElement.querySelector('map-view');
          if (existing) return existing;
          return commands.component('map-view');
        }
      }
    ]);
  }
  return router;
};
