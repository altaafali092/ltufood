import { Link } from '@inertiajs/react';
import { BookOpen, Cable, CakeIcon, FolderGit2, LayoutGrid, Shield, Table2 } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import type { NavItem } from '@/types';
import { dashboard } from '@/routes/admin';
import { index  as foodCategoryIndex } from '@/routes/admin/food-categories';
import { index as foodItemIndex } from '@/routes/admin/food-items';
import { index as tableIndex } from '@/routes/admin/tables';
import { index as subCategoryIndex } from '@/routes/admin/sub-categories';
import { index as permissionIndex } from '@/routes/admin/permission';
import { index as roleIndex } from '@/routes/admin/role';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Tables',
        href: tableIndex(),
        icon: Table2,
    },
    {
        title: 'FoodCategory',
        href: foodCategoryIndex(),
        icon: CakeIcon,
    },
    {
        title: 'SubCategory',
        href: subCategoryIndex(),
        icon: Cable,
    },
    {
        title: 'FoodItem',
        href: foodItemIndex(),
        icon:CakeIcon,
    },

    {
        title: 'Permission',
        href:permissionIndex(),
        icon:CakeIcon,
    },
    {
        title:'Role',
        href: roleIndex(),
        icon: Shield
    }
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                {/* <NavFooter items={footerNavItems} className="mt-auto" /> */}
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
