import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { MembersService } from '../../_services/members.service';
import { ActivatedRoute } from '@angular/router';
import { Member } from '../../_models/member';
import { TabDirective, TabsetComponent, TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryItem, GalleryModule, ImageItem } from 'ng-gallery';
import { TimeagoModule } from 'ngx-timeago';
import { DatePipe } from '@angular/common';
import { MemberMessagesComponent } from "../member-messages/member-messages.component";
import { MessageService } from '../../_services/message.service';
import { Message } from '../../_models/message';

@Component({
  selector: 'app-member-detail',
  standalone: true,
  imports: [TabsModule, GalleryModule, TimeagoModule, DatePipe, MemberMessagesComponent],
  templateUrl: './member-detail.component.html',
  styleUrl: './member-detail.component.css'
})
export class MemberDetailComponent implements OnInit {
  @ViewChild('memberTabs', {static: true}) memberTabs?: TabsetComponent
  private messageService = inject(MessageService);
  private memberService = inject(MembersService);
  private route = inject(ActivatedRoute);
  member: Member = {} as Member;
  images: GalleryItem[] = [];
  activeTab?: TabDirective;
  messages: Message[] = [];
  
  
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.route.data.subscribe({
      next: data => {
        this.member = data['member'];
        this.member && this.member.photos.map((photo) => {
          this.images.push(new ImageItem({ src: photo?.url, thumb: photo?.url }));

        })
        
      }
    })

    this.route.queryParams.subscribe({
      next: params => {
        params['tab'] && this.selectTab(params['tab']);
      }
    })
  }

  onUpdateMessages(message: Message) {
    this.messages.push(message);
    this.member && this.member.photos.map((photo) => {
      this.images.push(new ImageItem({ src: photo?.url, thumb: photo?.url }));
    })
  }


  selectTab(heading: string) {
    console.log(heading);
    
    if (this.memberTabs) {
      const messageTab = this.memberTabs.tabs.find(tab => tab.heading === heading);
      console.log(messageTab );
      
      if (messageTab) {
        messageTab.active = true;
      }
    }
    
  }

  onTabActivated(data: TabDirective) {
    this.activeTab = data;
    if (this.activeTab.heading === 'Messages' && this.messages.length === 0 && this.member) {
      this.messageService.getMessageThread(this.member.username).subscribe({
        next: messages => this.messages = messages,
        error: error => {
          console.error(error);
        }
      });
    }
  }

  // loadMember() {
  //   const username = this.route.snapshot.paramMap.get('username');
  //   if (!username) return;
  //   this.memberService.getMember(username).subscribe({
  //     next: (member) => {
  //       this.member = member;
  //       member.photos.map((photo) => {
  //         this.images.push(new ImageItem({ src: photo?.url, thumb: photo?.url }));

  //       })
  //     },
  //   });
  // } 
}
