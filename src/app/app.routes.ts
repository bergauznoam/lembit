import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.page').then(m => m.HomePage),
    children: [
      {
        path: 'feed',
        loadComponent: () => import('./pages/feed/feed.page').then(m => m.FeedPage)
      },
      {
        path: 'search',
        loadComponent: () => import('./pages/search/search.page').then(m => m.SearchPage)
      },
      {
        path: 'inbox',
        loadComponent: () => import('./pages/inbox/inbox.page').then(m => m.InboxPage)
      },
      {
        path: 'profile',
        loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage)
      }
    ]
  },
];
