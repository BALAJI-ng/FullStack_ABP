import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./rxjs/merge-map-merge-all/merge-map-merge-all.component').then(m => m.MergeMapMergeAllComponent) },
    { path: 'rxjs-search', loadComponent: () => import('./rxjs/search/search.component').then(m => m.SearchComponent) },
    { path: 'rxjs-share-replay', loadComponent: () => import('./rxjs/share-replay/share-replay.component').then(m => m.ShareReplayComponent) },
    { path: 'rxjs-combined-latest-all', loadComponent: () => import('./rxjs/combined-latest-all/combined-latest-all.component').then(m => m.CombinedLatestAllComponent) }

];
