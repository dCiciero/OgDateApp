import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Member } from '../../_models/member';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TimeagoModule } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { MemberMessagesComponent } from '../member-messages/member-messages.component';
import { MessageService } from '../../_services/message.service';
import { Message } from '../../_models/message';
import { PresenceService } from '../../_services/presence.service';
import { AccountService } from '../../_services/account.service';
import { HubConnectionState } from '@microsoft/signalr';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [
    TabsModule,
    GalleryModule,
    TimeagoModule,
    DatePipe,
    MemberMessagesComponent,
  ],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css',
})
export class MemberDetailComponent implements OnInit, OnDestroy {
  @ViewChild('memberTabs', { static: true }) memberTabs?: TabsetComponent;
  private messageService = inject(MessageService);
  private accountService = inject(AccountService);
  presenceService = inject(PresenceService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  member: Member = {} as Member;
  images: GalleryItem[] = [];
  activeTab?: TabDirective;

  ngOnInit(): void {
    // this.messageService.createHubConnection(this.accountService.currentUser()!, this.route.snapshot.paramMap.get('username')!);

    this.route.data.subscribe({
      next: (data) => {
        this.member = data['member'];
        this.member &&
          this.member.photos.map((photo) => {
            this.images.push(
              new ImageItem({ src: photo?.url, thumb: photo?.url })
            );
          });

        // this.messageService.stopHubConnection();
        // this.messageService.messageThread.set([]);
        // this.messageService.createHubConnection(
        //   this.accountService.currentUser()!,
        //   this.member.username
        // );

        this.route.paramMap.subscribe({
          next: (_) => {
            this.onRouteParamsChanged();
          },
        });
      },
    });

    this.route.queryParams.subscribe({
      next: (params) => {
        params['tab'] && this.selectTab(params['tab']);
      },
    });
  }

  ngOnDestroy(): void {
    this.messageService.stopHubConnection();
  }

  selectTab(heading: string) {
    console.log(heading);

    if (this.memberTabs) {
      const messageTab = this.memberTabs.tabs.find(
        (tab) => tab.heading === heading
      );
      console.log(messageTab);

      if (messageTab) {
        messageTab.active = true;
      }
    }
  }

  onRouteParamsChanged() {
    const user = this.accountService.currentUser();
    if (!user) return;
    if (this.messageService.hubConnection?.state === HubConnectionState.Connected) {
      this.messageService.hubConnection.stop().then(() => {
        this.messageService.createHubConnection(user, this.member.username);
      });
    }
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: data.heading },
      queryParamsHandling: 'merge',
      // replaceUrl: true
    });
    // if (this.activeTab.heading === 'Messages' && this.member) {
    //   const user = this.accountService.currentUser();
    //   if (!user) return;
    //   console.log(user);
    //   console.log(this.member.username);
    //   this.messageService.createHubConnection(user, this.member.username);
    // }

    if (this.activeTab.heading === 'Messages' && this.member) {
      const user = this.accountService.currentUser();
      if (!user) return;
      console.log(user);
      this.messageService.createHubConnection(user, this.member.username);
    } else {
      this.messageService.stopHubConnection();
    }
  }
}
