import { Link } from '@inertiajs/react';
import {
    Cable,
    CakeIcon,
    KeyRound,
    LayoutGrid,
    LockKeyhole,
    Table2,
    User2,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
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

import { dashboard } from '@/routes/admin';
import permission from '@/routes/admin/permission';
import role from '@/routes/admin/role';
import user from '@/routes/admin/user';
import tables from '@/routes/admin/tables';
import foodCategories from '@/routes/admin/food-categories';
import subCategories from '@/routes/admin/sub-categories';
import foodItems from '@/routes/admin/food-items';

import { useCan } from '@/hooks/use-can';

export function AppSidebar() {
    const can = useCan();

    const mainNavItems = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
            show: true,
        },
        {
            title: 'Tables',
            href: tables.index(),
            icon: Table2,
            show: can('view table'),
           
        },
        {
            title: 'Food Category',
            href: foodCategories.index(),
            icon: CakeIcon,
            show: can('view food category'),
        },
        {
            title: 'Sub Category',
            href: subCategories.index(),
            icon: Cable,
            show: can('view sub category'),
        },
        {
            title: 'Food Item',
            href: foodItems.index(),
            icon: CakeIcon,
            show: can('view food item'),
        },
        {
            title: 'Permission',
            href: permission.index(),
            icon: KeyRound,
            show: can('view permission'),
        },
        {
            title: 'Role',
            href: role.index(),
            icon: LockKeyhole,
            show: can('view role'),
        },
        {
            title: 'Users',
            href: user.index(),
            icon: User2,
            show: can('view users'),
        },
    ].filter(item => item.show);

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
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}