import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { ToastrService } from 'ngx-toastr';

export const adminGuard: CanActivateFn = (route, state) => {
  const accountService = inject(AccountService);
  const toastr = inject(ToastrService);

  const roles = accountService.roles();
  const allowedRoles = ['Admin', 'Moderator'];

  if (roles.some((role) => allowedRoles.includes(role))) {
    return true;
  } else {
    toastr.error('You cannot enter this area');
    return false;
  }
};
