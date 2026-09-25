import AppLogoIcon from '@/components/app-logo-icon';
import { officeSettingStore } from '@/routes/admin';
import { OfficeSetting } from '@/types/admin/OfficeSetting';
import { usePage } from '@inertiajs/react';

interface pageProps{
    officeSetting:OfficeSetting
}
export default function AppLogo() {
    const { officeSetting } = usePage<PageProps>().props;
    return (

        <>
            <div className="flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    {officeSetting?.office_name}
                </span>
            </div>
        </>
    );
}
