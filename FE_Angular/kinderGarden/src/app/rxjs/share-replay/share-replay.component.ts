import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { catchError, debounceTime, distinctUntilChanged, Observable, of, shareReplay, switchMap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-share-replay',
  imports: [CommonModule, MatButtonModule, MatIconModule, MatInputModule, MatDividerModule, MatFormFieldModule, FormsModule, ReactiveFormsModule],
  templateUrl: './share-replay.component.html',
  styleUrl: './share-replay.component.scss'
})
export class ShareReplayComponent {
  searchControl = new FormControl('');
  products: any[] = []; // Array to hold search results
  sharedReplay: any[] = [];
  constructor(private http: HttpClient) {

    this.searchControl.valueChanges.pipe(
      debounceTime(300),                  // Wait for user to stop typing
      distinctUntilChanged(),             // Only trigger if value actually changed
      switchMap(query =>
        this.http.get<any[]>(`https://jsonplaceholder.typicode.com/users?username=${query}`).pipe(
          catchError(() => of([]))        // Fallback to empty list on error
        )
      ),
      shareReplay(2)                      // Cache the latest result
    ).subscribe(results => {
      this.products = results[0].name;
    });


  }

  getBretAgainNotAPICall(): Observable<any[]> {
    // This method is just to demonstrate that we can get the cached results without making another API call
    return of(this.products); // Returns the cached results from the last API call as an Observable
  }

}
