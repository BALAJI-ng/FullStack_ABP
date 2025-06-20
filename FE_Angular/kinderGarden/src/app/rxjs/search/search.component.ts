import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { debounceTime, distinctUntilChanged, switchMap, BehaviorSubject, Observable, catchError, of, startWith } from 'rxjs';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, MatInputModule, MatFormFieldModule, FormsModule, ReactiveFormsModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent {

  searchControl = new FormControl();

  // Observables for the template
  searchResults$: Observable<any[]>;
  isLoading$ = new BehaviorSubject<boolean>(false);
  error$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {

    // Set up the search stream
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      startWith(''), // Start with empty string
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (!value || value.trim().length === 0) {
          this.isLoading$.next(false);
          this.error$.next(null);
          return of([]); // Return empty array for empty search
        }

        this.isLoading$.next(true);
        this.error$.next(null);

        return this.http.get<any[]>(`https://jsonplaceholder.typicode.com/users?username=${value}`).pipe(
          catchError(error => {
            console.error('Search error:', error);
            this.error$.next('Failed to fetch search results. Please try again.');
            this.isLoading$.next(false);
            return of([]); // Return empty array on error
          })
        );
      })
    );

    // Subscribe to results to handle loading state
    this.searchResults$.subscribe(results => {
      this.isLoading$.next(false);
      console.log('Search results:', results);
    });
  }
}
