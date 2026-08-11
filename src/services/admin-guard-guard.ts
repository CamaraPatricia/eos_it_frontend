import { CanActivateFn, Router } from '@angular/router';
import LocalStorageUtils from '../app/utils/localStorageUtils';
import { LocalStorageUser } from '../app/models/localStorageUser';
import { inject } from '@angular/core';

export const AdminGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const localStorageUser: LocalStorageUser | null = JSON.parse(LocalStorageUtils.getItem(LocalStorageUtils.userKey) || 'null');
  
  if (localStorageUser?.roleName === 'ADMIN') {
    return true;
  }
  
  if(localStorageUser){
    router.navigate(['/homepage']);
  } else {
    router.navigate(['/login']);
  }
  return false;
};
