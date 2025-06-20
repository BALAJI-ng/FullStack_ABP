import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { from, map, mergeAll, mergeMap, of, delay, timer, interval, take, combineLatestAll, forkJoin, switchMap } from 'rxjs';

@Component({
  selector: 'app-merge-map-merge-all',
  imports: [CommonModule],
  templateUrl: './merge-map-merge-all.component.html',
  styleUrl: './merge-map-merge-all.component.scss'
})
export class MergeMapMergeAllComponent implements OnInit {
  // Basic comparison results
  mergeMap: any[] = [];
  mergeAll: any[] = [];

  // Detailed comparison results
  comparisonResults: any = {
    timing: { forkJoin: [], combineLatestAll: [], mergeMap: [], mergeAll: [] },
    streaming: { forkJoin: [], combineLatestAll: [], mergeMap: [], mergeAll: [] },
    errors: { forkJoin: [], combineLatestAll: [], mergeMap: [], mergeAll: [] }
  };

  constructor(private http: HttpClient) { } ngOnInit() {
    console.log('🚀 Starting operator comparisons...\n');

    // Basic comparison (what you already have)
    this.basicComparison();

    // Advanced comparisons showing the differences
    setTimeout(() => this.timingComparison(), 2000);
    setTimeout(() => this.streamingComparison(), 4000);
    setTimeout(() => this.errorHandlingComparison(), 6000);
  }

  // 📊 BASIC COMPARISON - They look the same!
  basicComparison() {
    console.log('📊 BASIC COMPARISON - HTTP Requests');

    // mergeMap approach
    from([1, 2, 3]).pipe(
      mergeMap(id => this.http.get(`https://jsonplaceholder.typicode.com/users/${id}`))
    ).subscribe(product => {
      console.log('mergeMap result:', product);
      this.mergeMap.push(product);
    });

    // map + mergeAll approach  
    from([1, 2, 3]).pipe(
      map(id => this.http.get(`https://jsonplaceholder.typicode.com/users/${id}`)),
      mergeAll()
    ).subscribe(product => {
      console.log('mergeAll result:', product);
      this.mergeAll.push(product);
    });
  }

  // ⏱️ TIMING COMPARISON - Here's where differences show!
  timingComparison() {
    console.log('\n⏱️ TIMING COMPARISON - Different emission patterns');

    // forkJoin - waits for ALL to complete
    const forkJoinStart = Date.now();
    forkJoin([
      of('A').pipe(delay(1000)),
      of('B').pipe(delay(2000)),
      of('C').pipe(delay(500))
    ]).subscribe(results => {
      const elapsed = Date.now() - forkJoinStart;
      console.log(`forkJoin: ${elapsed}ms - ALL AT ONCE:`, results);
      this.comparisonResults.timing.forkJoin = { elapsed, results, pattern: 'ALL_AT_ONCE' };
    });

    // combineLatestAll - also waits for ALL
    const combineLatestStart = Date.now();
    of([
      of('A').pipe(delay(1000)),
      of('B').pipe(delay(2000)),
      of('C').pipe(delay(500))
    ]).pipe(
      combineLatestAll()
    ).subscribe(results => {
      const elapsed = Date.now() - combineLatestStart;
      console.log(`combineLatestAll: ${elapsed}ms - ALL AT ONCE:`, results);
      this.comparisonResults.timing.combineLatestAll = { elapsed, results, pattern: 'ALL_AT_ONCE' };
    });    // mergeMap - emits as each completes
    const mergeMapStart = Date.now();
    from([1000, 2000, 500]).pipe(
      mergeMap(delayMs => of(`Result-${delayMs}`).pipe(delay(delayMs)))
    ).subscribe(result => {
      const elapsed = Date.now() - mergeMapStart;
      console.log(`mergeMap: ${elapsed}ms - AS AVAILABLE:`, result);
      this.comparisonResults.timing.mergeMap.push({ elapsed, result, pattern: 'AS_AVAILABLE' });
    });

    // map + mergeAll - also emits as each completes  
    const mergeAllStart = Date.now();
    from([1000, 2000, 500]).pipe(
      map(delayMs => of(`Result-${delayMs}`).pipe(delay(delayMs))),
      mergeAll()
    ).subscribe(result => {
      const elapsed = Date.now() - mergeAllStart;
      console.log(`mergeAll: ${elapsed}ms - AS AVAILABLE:`, result);
      this.comparisonResults.timing.mergeAll.push({ elapsed, result, pattern: 'AS_AVAILABLE' });
    });
  }

  // 🌊 STREAMING COMPARISON - Continuous vs Batch
  streamingComparison() {
    console.log('\n🌊 STREAMING COMPARISON - Continuous data');

    // mergeMap with streaming data
    interval(800).pipe(
      take(3),
      mergeMap(i => timer(Math.random() * 1000).pipe(map(() => `Stream-${i}`)))
    ).subscribe(result => {
      console.log('mergeMap streaming:', result);
      this.comparisonResults.streaming.mergeMap.push(result);
    });

    // mergeAll with streaming data
    interval(800).pipe(
      take(3),
      map(i => timer(Math.random() * 1000).pipe(map(() => `Stream-${i}`))),
      mergeAll()
    ).subscribe(result => {
      console.log('mergeAll streaming:', result);
      this.comparisonResults.streaming.mergeAll.push(result);
    });

    // forkJoin CAN'T handle infinite streams!
    try {
      // This would never emit because interval never completes
      // forkJoin([interval(1000), interval(2000)]) // DON'T DO THIS!
      console.log('forkJoin: ❌ Cannot handle infinite streams!');
      this.comparisonResults.streaming.forkJoin = ['❌ Cannot handle infinite streams'];
    } catch (e) {
      console.log('forkJoin error with streams:', e);
    }

    // combineLatestAll with finite streams
    of([
      timer(500).pipe(map(() => 'Timer-A')),
      timer(1000).pipe(map(() => 'Timer-B'))
    ]).pipe(
      combineLatestAll()
    ).subscribe(results => {
      console.log('combineLatestAll streaming:', results);
      this.comparisonResults.streaming.combineLatestAll = results;
    });
  }

  // 🚨 ERROR HANDLING COMPARISON
  errorHandlingComparison() {
    console.log('\n🚨 ERROR HANDLING COMPARISON');

    // forkJoin - ONE error kills everything
    forkJoin([
      of('Success-1'),
      of('Success-2').pipe(delay(500)),
      timer(1000).pipe(switchMap(() => { throw new Error('API Error!'); }))
    ]).subscribe({
      next: results => console.log('forkJoin success:', results),
      error: error => {
        console.log('forkJoin: ❌ ONE error kills ALL results:', error.message);
        this.comparisonResults.errors.forkJoin = '❌ One error kills all';
      }
    });

    // mergeMap - errors are isolated per stream
    from([1, 2, 3]).pipe(
      mergeMap(id => {
        if (id === 2) {
          return timer(500).pipe(switchMap(() => { throw new Error(`Error for ${id}`); }));
        }
        return of(`Success-${id}`).pipe(delay(300));
      })
    ).subscribe({
      next: result => {
        console.log('mergeMap success:', result);
        this.comparisonResults.errors.mergeMap.push(result);
      },
      error: error => {
        console.log('mergeMap: ❌ Error stops stream:', error.message);
        this.comparisonResults.errors.mergeMap.push(`❌ ${error.message}`);
      }
    });
  }

}
