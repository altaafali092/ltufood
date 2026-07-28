import { SharedData } from "@/types";
import { usePage } from "@inertiajs/react";

export function useCan(){
    const{auth}=usePage<SharedData>().props
    
    return(permission:string):boolean => {
        return auth.user?.can?.[permission] ?? false;
    };
}