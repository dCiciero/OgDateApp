import { Component, inject, OnInit } from '@angular/core';
import { MessageService } from '../_services/message.service';
import { FormsModule } from '@angular/forms';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { TimeagoModule } from 'ngx-timeago';
import { Message } from '../_models/message';
import { RouterLink } from '@angular/router';
import { PaginationModule } from 'ngx-bootstrap/pagination';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    FormsModule,
    ButtonsModule,
    TimeagoModule,
    RouterLink,
    PaginationModule,
  ],
  templateUrl: './messages.component.html',
  styleUrl: './messages.component.css',
})
export class MessagesComponent implements OnInit {
  //inject message service not in a constructor
  messageService = inject(MessageService);
  container = 'Inbox';
  pageNumber = 1;
  pageSize = 5;
  isOutbox = this.container === 'Outbox';

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.loadMessages();
  }

  loadMessages() {
    this.messageService.getMessages(
      this.pageNumber,
      this.pageSize,
      this.container
    );
  }

  deleteMessage(id: number) {
    // console.log('deleteMessage called with id:', id);
    // return;
    this.messageService.deleteMessage(id).subscribe({
      next: () => {
        this.messageService.paginatedResult?.update((prev) => {
          if (prev && prev.items) {
            prev.items.splice(
              prev.items.findIndex((message: Message) => message.id === id),
              1
            );
            return prev;
            // const messages = prev.items.filter((message: Message) => message.id !== id);
            // return { ...prev, result: messages };
          }
          return prev;
        });
      },
    });
  }

  getRoute(message: Message) {
    if (this.container === 'Outbox') {
      return `/members/${message.recipientUsername}`;
    }
    return `/members/${message.senderUsername}`;
  }

  pageChanged(event: any) {
    if (this.pageNumber !== event.page) {
      this.pageNumber = event.page;
      this.loadMessages();
    }
  }
}
