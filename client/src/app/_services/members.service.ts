import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Member } from '../_models/member';
import { AccountService } from './account.service';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembersService {

  private http = inject(HttpClient);
  private accountService = inject(AccountService);
  private baseUrl = environment.apiUrl;
  members = signal<Member[]>([]);
  
  getMembers() {
    return this.http.get<Member[]>(`${this.baseUrl}users`).subscribe({
      next: members => this.members.set(members)
    })
  }

  getMember(username: string) {
    const member = this.members().find(x => x.username === username);

    if(member !== undefined) return of(member);
    return this.http.get<Member>(`${this.baseUrl}users/${username.toLocaleLowerCase()}`)
  }

  getHttpOptions() {
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.accountService.currentUser()?.token}`
      })
    }
  }

  updateMember(member: Member) {
    return this.http.put(`${this.baseUrl}users`, member).pipe(
      tap(() => {
        this.members.update(members => members.map(m => m.username === member.username ? member : m));

        // const index = this.members().findIndex(x => x.username === member.username);
        // this.members()[index] = member;
      })
    )
  }
}
