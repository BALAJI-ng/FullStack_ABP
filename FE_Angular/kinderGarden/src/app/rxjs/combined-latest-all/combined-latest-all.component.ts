import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { combineLatest, map, Observable, catchError, of as rxOf, forkJoin, switchMap, combineLatestAll, mergeAll } from 'rxjs';
import { of } from 'rxjs/internal/observable/of';

@Component({
  selector: 'app-combined-latest-all',
  imports: [CommonModule],
  templateUrl: './combined-latest-all.component.html',
  styleUrl: './combined-latest-all.component.scss'
})
export class CombinedLatestAllComponent implements OnInit {
  users: any[] = [];
  users$!: Observable<any[]>;
  isLoading = false;
  selectedIds$ = of([1, 2, 3]);

  // Demo properties for different approaches
  combineLatestAllResult: any = null;
  forkJoinResult: any = null;
  combineLatestResult: any = null;

  // Real-world examples of when to use combineLatestAll
  realWorldExamples: any = {
    dynamicFormFields: null,
    searchResults: null,
    stockPrices: null,
    userPermissions: null
  };

  constructor(private http: HttpClient) { }

  // Demo: Show why combineLatestAll didn't work
  demonstrateOperators() {
    console.log('\n🔍 === DEMONSTRATING DIFFERENT OPERATORS ===');

    // 1. The WRONG way with combineLatestAll (what you had before)
    console.log('\n❌ 1. Using combineLatestAll (WRONG):');
    of([1, 2, 3]).pipe(
      map(ids => {
        console.log('combineLatestAll - Creating observables for IDs:', ids);
        return ids.map(id => this.http.get(`https://jsonplaceholder.typicode.com/users/${id}`));
      }),
      combineLatestAll()
    ).subscribe(result => {
      console.log('combineLatestAll result:', result);
      this.combineLatestAllResult = result;
    });

    // 2. The RIGHT way with forkJoin
    console.log('\n✅ 2. Using forkJoin (CORRECT):');
    const ids = [1, 2, 3];
    const httpRequests = ids.map(id => this.http.get(`https://jsonplaceholder.typicode.com/users/${id}`));
    forkJoin(httpRequests).subscribe(result => {
      console.log('forkJoin result:', result);
      this.forkJoinResult = result;
    });

    // 3. Alternative with combineLatest (also works)
    console.log('\n✅ 3. Using combineLatest (ALSO CORRECT):');
    const obs1 = this.http.get(`https://jsonplaceholder.typicode.com/users/1`);
    const obs2 = this.http.get(`https://jsonplaceholder.typicode.com/users/2`);
    const obs3 = this.http.get(`https://jsonplaceholder.typicode.com/users/3`);

    combineLatest([obs1, obs2, obs3]).subscribe(result => {
      console.log('combineLatest result:', result);
      this.combineLatestResult = result;
    });
  }  // Manual trigger method for testing
  loadUsers() {
    console.log('Manual load triggered...');
    this.isLoading = true;

    // First, demonstrate why combineLatestAll didn't work
    this.demonstrateOperators();

    // Show real-world examples of combineLatestAll
    this.demonstrateRealWorldExamples();

    // Get the IDs array
    const ids = [1, 2, 3];
    console.log('Processing IDs:', ids);

    // Create array of HTTP observables
    const httpRequests = ids.map(id => {
      const url = `https://jsonplaceholder.typicode.com/users/${id}`;
      console.log('Making API call to:', url);
      return this.http.get<any>(url).pipe(
        catchError(error => {
          console.error(`Error fetching user ${id}:`, error);
          return rxOf(null);
        })
      );
    });

    // Use forkJoin to execute all requests in parallel
    forkJoin(httpRequests).subscribe({
      next: (users: any[]) => {
        console.log('Manual load - Received users:', users);
        this.users = users.filter(user => user !== null);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Manual load error:', error);
        this.isLoading = false;
      }
    });
  }
  ngOnInit() {
    console.log('Component initializing...');

    // Automatically load users on component init
    this.loadUsers();    // Method 2: Using async pipe with forkJoin (recommended approach)
    this.users$ = this.selectedIds$.pipe(
      switchMap(ids => {
        console.log('Async pipe - Processing IDs:', ids);
        const httpRequests = ids.map(id => {
          const url = `https://jsonplaceholder.typicode.com/users/${id}`;
          return this.http.get<any>(url).pipe(
            catchError(error => {
              console.error(`Async pipe - Error fetching user ${id}:`, error);
              return rxOf(null);
            })
          );
        });
        return forkJoin(httpRequests);
      }),
      // Filter out null values
      map((users: any[]) => users.filter(user => user !== null))
    );
  }

  // 🌟 REAL-WORLD EXAMPLE 1: Dynamic Form Fields
  dynamicFormFieldsExample() {
    console.log('\n🌟 REAL-WORLD EXAMPLE 1: Dynamic Form Fields');
    console.log('Use case: Form with dynamic number of search inputs, each input creates an observable');

    // Simulate dynamic form inputs (each input creates an observable)
    const searchInputs = ['angular', 'react', 'vue'];

    // Each input creates an observable that emits search results
    const searchObservables$ = of(
      searchInputs.map(term =>
        this.http.get(`https://jsonplaceholder.typicode.com/posts?title_like=${term}`)
          .pipe(map(posts => ({ term, posts })))
      )
    );

    // Use combineLatestAll to get latest results from ALL search inputs
    searchObservables$.pipe(
      combineLatestAll()
    ).subscribe(results => {
      console.log('Dynamic form results:', results);
      this.realWorldExamples.dynamicFormFields = results;
    });
  }

  // 🌟 REAL-WORLD EXAMPLE 2: Dynamic Search with Multiple APIs
  dynamicSearchExample() {
    console.log('\n🌟 REAL-WORLD EXAMPLE 2: Dynamic Search with Multiple APIs');
    console.log('Use case: Search across multiple APIs, number of APIs can change dynamically');

    // Simulate getting list of APIs to search from a service
    const searchAPIs$ = of([
      'https://jsonplaceholder.typicode.com/users?name_like=',
      'https://jsonplaceholder.typicode.com/posts?title_like=',
      'https://jsonplaceholder.typicode.com/albums?title_like='
    ]);

    const searchTerm = 'test';

    // Create observables dynamically based on available APIs
    const dynamicSearches$ = searchAPIs$.pipe(
      map(apis => apis.map(api =>
        this.http.get(`${api}${searchTerm}`)
          .pipe(
            catchError(() => rxOf([])),
            map(data => ({ api, data }))
          )
      ))
    );

    // Use combineLatestAll to combine results from all APIs
    dynamicSearches$.pipe(
      combineLatestAll()
    ).subscribe(results => {
      console.log('Multi-API search results:', results);
      this.realWorldExamples.searchResults = results;
    });
  }

  // 🌟 REAL-WORLD EXAMPLE 3: Stock Price Monitoring
  stockPriceMonitoringExample() {
    console.log('\n🌟 REAL-WORLD EXAMPLE 3: Stock Price Monitoring');
    console.log('Use case: Monitor prices for dynamic list of stocks');

    // Simulate getting watchlist from user preferences
    const userWatchlist$ = of(['AAPL', 'GOOGL', 'MSFT', 'TSLA']);

    // Create price observables for each stock (simulated with user data)
    const stockPriceStreams$ = userWatchlist$.pipe(
      map(stocks => stocks.map(symbol =>
        // In real app, this would be WebSocket or polling
        this.http.get(`https://jsonplaceholder.typicode.com/users/${Math.floor(Math.random() * 10) + 1}`)
          .pipe(
            map(user => ({
              symbol,
              price: Math.random() * 1000,
              change: (Math.random() - 0.5) * 10,
              timestamp: new Date(),
              user: user // Simulated additional data
            })),
            catchError(() => rxOf({ symbol, price: 0, change: 0, error: true }))
          )
      ))
    );

    // Use combineLatestAll to get latest prices for ALL stocks
    stockPriceStreams$.pipe(
      combineLatestAll()
    ).subscribe(prices => {
      console.log('Stock prices update:', prices);
      this.realWorldExamples.stockPrices = prices;
    });
  }

  // 🌟 REAL-WORLD EXAMPLE 4: User Permissions for Dynamic Modules
  userPermissionsExample() {
    console.log('\n🌟 REAL-WORLD EXAMPLE 4: User Permissions for Dynamic Modules');
    console.log('Use case: Check permissions for dynamically loaded modules');

    // Simulate getting user's active modules
    const userModules$ = of(['dashboard', 'reports', 'admin', 'billing']);

    // Create permission check observables for each module
    const permissionChecks$ = userModules$.pipe(
      map(modules => modules.map(module =>
        // Simulate permission API calls
        this.http.get(`https://jsonplaceholder.typicode.com/users/${Math.floor(Math.random() * 5) + 1}`)
          .pipe(
            map(user => ({
              module,
              hasAccess: Math.random() > 0.3, // Random permission
              level: ['read', 'write', 'admin'][Math.floor(Math.random() * 3)],
              user: (user as any).name
            })),
            catchError(() => rxOf({ module, hasAccess: false, error: true }))
          )
      ))
    );

    // Use combineLatestAll to wait for ALL permission checks
    permissionChecks$.pipe(
      combineLatestAll()
    ).subscribe(permissions => {
      console.log('User permissions:', permissions);
      this.realWorldExamples.userPermissions = permissions;
    });
  }

  // Method to run all real-world examples
  demonstrateRealWorldExamples() {
    console.log('\n🎯 === REAL-WORLD combineLatestAll EXAMPLES ===');

    setTimeout(() => this.dynamicFormFieldsExample(), 1000);
    setTimeout(() => this.dynamicSearchExample(), 2000);
    setTimeout(() => this.stockPriceMonitoringExample(), 3000);
    setTimeout(() => this.userPermissionsExample(), 4000);
  }
}
