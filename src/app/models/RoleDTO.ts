export interface RoleDTO {
        roleId: number,
        roleName: string,
        roles_permissions: Record<string, string[]>
        // lista de tip READ (task, user);  create (task) etc;
}