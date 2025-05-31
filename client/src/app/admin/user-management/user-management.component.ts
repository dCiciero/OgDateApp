import { Component, inject, OnInit } from '@angular/core';
import { AdminService } from '../../_services/admin.service';
import { User } from '../../_models/user';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RolesModalComponent } from '../../modals/roles-modal/roles-modal.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css'
})
export class UserManagementComponent implements OnInit {
  private adminService = inject(AdminService);
  private modalService = inject(BsModalService);

  users: User[] = []; // Assuming User is an interface or class defined in your models
  bsModalRef: BsModalRef<RolesModalComponent> = new BsModalRef<RolesModalComponent>(); // Assuming you will use this for modals later
  
  // constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  openRolesModal(user: User) {
    const initialState: ModalOptions = {
      class: 'modal-lg',
      initialState: {
        title: 'User Roles',
        username: user.userName,
        selectedRoles: [...user.roles],
        availableRoles: ['Admin', 'Moderator', 'Member'],
        users: this.users,
        rolesUpdated: false
        // users: this.users // Pass the users to the modal
      }
    };
    this.bsModalRef = this.modalService.show(RolesModalComponent, initialState );
    this.bsModalRef.onHide?.subscribe({
      next: () => {
        if (this.bsModalRef.content && this.bsModalRef.content.rolesUpdated) {
          const selectedRoles = this.bsModalRef.content.selectedRoles;
          this.adminService.updateUserRoles(user.userName, selectedRoles).subscribe({
            next: (roles) => user.roles = roles
          })
        }
      }
    })
  }
  
  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe({
      next: users => {this.users = users; console.log(this.users);},
      error: (error) => {
        console.error('Error fetching users with roles:', error);
      }
    });
  }

}
