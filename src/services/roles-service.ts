import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { RoleDTO } from '../app/models/RoleDTO';
import { PermissionReq } from '../app/models/permissionReq';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private httpClient = inject(HttpClient);
  private baseUrl = 'http://localhost:8080/roles';

  getRoles() {
    return this.httpClient.get<RoleDTO[]>(this.baseUrl);
  }

   createRole(roleName: string): Observable<RoleDTO> {
    return this.httpClient.post<RoleDTO>(
      `${this.baseUrl}?roleName=${encodeURIComponent(roleName)}`,
      {}
    );
  }

  deleteRole(roleId: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.baseUrl}/${roleId}`);
  }

  addPermission(roleId:number, resource: PermissionReq) {
    return this.httpClient.post<RoleDTO>(`${this.baseUrl}/${roleId}`, resource);
  }

  deletePermission(roleId: number, permission: PermissionReq): Observable<void> {
    return this.httpClient.delete<void>(
      `${this.baseUrl}/${roleId}/permission`,
      {
        body: permission,
      }
    );
  }
}
