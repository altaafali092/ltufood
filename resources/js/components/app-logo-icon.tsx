import { OfficeSetting } from '@/types/admin/OfficeSetting';
import { usePage } from '@inertiajs/react';
import type { SVGAttributes } from 'react';
interface PageProps{
    officeSetting:OfficeSetting
}
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    const { officeSetting } = usePage<PageProps>().props;
    return (
        <img src={officeSetting?.office_logo||"Dashboard"} alt="" className='w-10 h-10'/>
    );
}
