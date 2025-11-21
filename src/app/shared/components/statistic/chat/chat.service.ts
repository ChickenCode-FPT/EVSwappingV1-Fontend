import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';

export interface ChatHistoryItem {
  role: 'user' | 'model';
  text: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBase}/Chatbot`;

  getAnswer(history: ChatHistoryItem[]): Observable<string> {
    const body = {
      history: history,
    };
    return this.http.post<{ response: string }>(this.apiUrl, body).pipe(map((res) => res.response));
  }
}
