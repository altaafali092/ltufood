type FeatureStatCardProps = {
    icon: string;
    title: string;
    description: string;
};

export function FeatureStatCard({ icon, title, description }: FeatureStatCardProps) {
    return (
        <div className="rounded-[22px] max-md:rounded-[18px] p-5 max-md:p-[18px] bg-black/[0.03] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.07] flex flex-col gap-2.5">
            <div className="w-[42px] h-[42px] rounded-[12px] bg-[#6bffb8]/10 flex items-center justify-center text-[22px]">
                {icon}
            </div>
            <p className="font-bold text-slate-900 dark:text-white text-base">{title}</p>
            <p className="text-xs text-slate-500 leading-[1.6]">{description}</p>
        </div>
    );
}
