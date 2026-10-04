import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from './subject';

@Service()
export class SubjectService {
  private http = inject(HttpClient);

  getSubjects() {
    return this.http.get<Subject[]>('/api/subjects');
  }

  setSubject(request: Partial<Subject>) {
    return this.http.patch<{message: string}>('/api/subjects', request);
  }

  getContent(contentFile: string): Observable<string | null> {
    return this.http.get(`/${contentFile}.md`, { responseType: 'text' });
  }
}
