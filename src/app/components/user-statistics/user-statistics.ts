import { Component, inject, signal } from '@angular/core';
import { StatisticsService } from '../../../services/statistics-service';
import { StatisticsForUsers } from '../../models/statisticsForUsers';
import { LocalStorageUser } from '../../models/localStorageUser';
import { User } from '../../models/User';
import { CommonModule } from '@angular/common';
import { RoleChange } from '../role-change/role-change';
import { UserService } from '../../../services/user-service';
import { RolesService } from '../../../services/roles-service';
import { RoleDTO } from '../../models/RoleDTO';
import { FormsModule } from '@angular/forms';
import { PermissionReq } from '../../models/permissionReq';

@Component({
  selector: 'app-user-statistics',
  imports: [CommonModule, FormsModule, RoleChange],
  templateUrl: './user-statistics.html',
  styleUrl: './user-statistics.css',
  standalone: true
})
export class UserStatistics {
  private statisticsService = inject(StatisticsService);
  private userService = inject(UserService);
  private rolesService = inject(RolesService);

  protected usersStatistics = signal<StatisticsForUsers[]>([]);
  protected localStorageUser = signal<LocalStorageUser | null>(null);
  protected roles = signal<RoleDTO[]>([]);
  protected selectedUser = signal<User | null>(null);
  protected showChangeRole = signal<boolean>(false);

  protected actions: string[] = [];
  protected resources: string[] = [];
  protected selectedActions: Record<string, string> = {};

  ngOnInit(): void {
    this.localStorageUser.set(JSON.parse(localStorage.getItem('user') || 'null'));
    this.statisticsService.getStatistics().subscribe(res => {
      this.usersStatistics.set(res);
    });
    this.rolesService.getRoles().subscribe(res => {
      this.roles.set(res);

      this.resources = [
        ...new Set(
          res.flatMap(role =>
            Object.keys(role.roles_permissions)
          )
        )
      ];

      this.actions = [
        ...new Set(
          res.flatMap(role =>
            Object.values(role.roles_permissions).flat()
          )
        )
      ];

      console.log('actions:', this.actions);
      console.log('resources:', this.resources);
    }
    );
  }

  protected userSelected(userId: number): void {
    this.selectedUser.set(this.usersStatistics().find(stat => stat.user.userId === userId)?.user || null);
    if(this.localStorageUser()?.roleName === 'ADMIN') {
    this.showChangeRole.set(!this.showChangeRole());
    }
  }

  protected onRoleChanged(roleId: number): void {
    console.log(`Changing to ${roleId}`);

    this.userService.updateUserRole(this.selectedUser()?.userId || 0, roleId).subscribe({
      next: (updatedUser) => {
        console.log('User role updated successfully:', updatedUser);
        this.selectedUser.set(updatedUser);
        this.usersStatistics.set(this.usersStatistics().map(stat =>
          stat.user.userId === updatedUser.userId ? { ...stat, user: updatedUser } : stat
        ));
      },
      error: (error) => {
        console.error('Error updating user role:', error);
      }
    });

    this.closeRoleChange();
  }

  protected closeRoleChange(): void {
    this.showChangeRole.set(false);
  }

  protected addPermission(
  roleId: number,
  resource: string,
  action: string
): void {
  const key = this.getPermissionKey(roleId, resource);

  const permission: PermissionReq = {
    resourceName: resource,
    permissionAction: action,
  };

  this.rolesService.addPermission(roleId, permission).subscribe({
    next: updatedRole => {
      this.roles.update(currentRoles =>
        currentRoles.map(currentRole =>
          currentRole.roleId === roleId
            ? updatedRole
            : currentRole
        )
      );

      this.selectedActions[key] = '';
    },
    error: error => {
      console.error('Error adding permission:', error);
    },
  });
}

  protected deletePermission(
  roleId: number,
  resource: string,
  action: string,
  event: MouseEvent
) {
  event.stopPropagation();

  if (!confirm(`Delete "${action}" permission?`)) {
    return;
  }

  const permission: PermissionReq = {
    resourceName: resource,
    permissionAction: action,
  };

  this.rolesService.deletePermission(roleId, permission).subscribe({
    next: () => {
      this.roles.update(roles =>
        roles.map(currentRole => {
          if (currentRole.roleId !== roleId) {
            return currentRole;
          }

          const updatedPermissions = {
            ...currentRole.roles_permissions,
            [resource]: currentRole.roles_permissions[resource].filter(
              currentAction => currentAction !== action
            ),
          };

          if (updatedPermissions[resource].length === 0) {
            delete updatedPermissions[resource];
          }

          return {
            ...currentRole,
            roles_permissions: updatedPermissions,
          };
        })
      );
    },
    error: error => {
      console.error('Error deleting permission:', error);
    },
  });
}

  protected getPermissionKey(roleId: number, resource: string): string {
    return `${roleId}-${resource}`;
  }
}
