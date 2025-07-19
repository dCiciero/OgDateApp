import { Component, inject, input, ViewChild, } from '@angular/core';
import { MessageService } from '../../_services/message.service';
import { TimeagoModule } from 'ngx-timeago';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-member-messages',
  standalone: true,
  imports: [TimeagoModule, FormsModule],
  templateUrl: './member-messages.component.html',
  styleUrl: './member-messages.component.css'
})
export class MemberMessagesComponent {
  @ViewChild('messageForm') messageForm?: NgForm
  messageService = inject(MessageService);
  username = input.required<string>();
  // messages = input.required<Message[]>();
  messageContent = '';
  // updateMessages = output<Message>();
 
  sendMessage() {
    this.messageService.sendMessage(this.username(), this.messageContent).then(() => {
      this.messageForm?.reset();
      // this.messageContent = '';
    }).catch(error => {
      console.error('Error sending message:', error);
    });
  }

}
