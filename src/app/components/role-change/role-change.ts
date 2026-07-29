import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { RolesService } from '../../../services/roles-service';
import { RoleDTO } from '../../models/RoleDTO';
import { CommonModule } from '@angular/common';
import { User } from '../../models/User';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-role-change',
  imports: [CommonModule, FormsModule],
  templateUrl: './role-change.html',
  styleUrl: './role-change.css',
  standalone: true
})
export class RoleChange {
  @Input() user: User | null = null;
  @Output() roleChanged = new EventEmitter<number>();
  @Output() closed = new EventEmitter<void>();

  private rolesService = inject(RolesService);
  protected roles = signal<RoleDTO[]>([]);
  protected selectedRoleId = signal<number | null>(null);
  
  ngOnInit(): void {
    this.rolesService.getRoles().subscribe(res => {
      this.roles.set(res);
      console.log('Roles fetched:', this.roles());

      this.selectedRoleId.set(res.find(role => role.roleName === this.user?.roleName)?.roleId || null);
    });

    console.log('User in RoleChange:', this.user);
  }

  protected selectedRole(roleId: number): void {
    this.selectedRoleId.set(roleId);
  }

  protected changeRole(): void {
    const roleId = this.selectedRoleId();

    if (roleId !== null) {
      this.roleChanged.emit(roleId);
    }
  }

  protected closeModal(): void {
    this.closed.emit();
  }
}
