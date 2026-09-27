import { home } from '@/routes';
import { OfficeSetting } from '@/types/frontend/officeSetting';
import { Link, usePage } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';
import React from 'react';

const serif = { fontFamily: "'Playfair Display', Georgia, serif" } as const;

interface PageProps {
    officeSetting: OfficeSetting;
}

export default function Footer() {
    const { officeSetting } = usePage<PageProps>().props;

    return (
        <footer className="mx-auto w-full max-w-300 px-6 pb-9 pt-8 max-md:px-4">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-black/[0.07] pt-7 dark:border-white/[0.07]">
                <Link href={home().url} className="flex items-center gap-2.5" aria-label="home">
                    <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-[10px] bg-linear-to-br from-[#6bffb8] to-[#00d4aa] text-[18px]">
                        {officeSetting?.office_logo && (
                            <img 
                                src={officeSetting.office_logo} 
                                alt={officeSetting?.office_name || 'Logo'} 
                                className="h-full w-full object-cover" 
                            />
                        )}
                    </span>
                    <span className="flex flex-col gap-0.5">
                        <strong className="text-[18px] font-bold leading-none text-slate-900 dark:text-white" style={serif}>
                            {officeSetting?.office_name}
                        </strong>
                        <span className="text-[6px] font-medium tracking-[1.2px] text-[#00a37a] dark:text-[#6bffb8]">
                            SCAN · CHOOSE · ORDER
                        </span>
                    </span>
                </Link>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-slate-500 dark:text-slate-400">
                    {officeSetting?.office_address && (
                        <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#00a37a] dark:text-[#6bffb8]" />
                            {officeSetting.office_address}
                        </span>
                    )}
                    {officeSetting?.office_phone && (
                        <a href={`tel:${officeSetting.office_phone}`} className="flex items-center gap-1.5 transition-colors hover:text-[#00a37a]">
                            <Phone size={13} className="text-[#00a37a] dark:text-[#6bffb8]" />
                            {officeSetting.office_phone}
                        </a>
                    )}
                    {officeSetting?.office_email && (
                        <a href={`mailto:${officeSetting.office_email}`} className="flex items-center gap-1.5 transition-colors hover:text-[#00a37a]">
                            <Mail size={13} className="text-[#00a37a] dark:text-[#6bffb8]" />
                            {officeSetting.office_email}
                        </a>
                    )}
                </div>

               

                <nav className="ml-auto flex gap-6 text-[10px] text-slate-500 dark:text-slate-400 max-md:ml-0" aria-label="Footer navigation">
                    <a href="#how-it-works" className="transition-colors hover:text-[#00a37a]">How it works</a>
                    <a href="#menu" className="transition-colors hover:text-[#00a37a]">Our menu</a>
                </nav>
                
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    © {new Date().getFullYear()} {officeSetting?.office_name}
                </span>
            </div>
        </footer>
    );
}