
import { User } from "../auth"

export type Permission={
    id:number
    name:string

}
export interface Role {
    id: number
    name: string
    guard_name: string
    created_at: string
    updated_at: string
    permissions: Permission[]; 
}
export interface RoleWithPermissions extends Role {
    permissions: Permission[] 
}
export interface RoleWithPermissionsAndUsers extends RoleWithPermissions {
    users: User[]
}

