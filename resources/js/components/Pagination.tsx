import { Link } from "@inertiajs/react";
import React from "react";

interface Props {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
}

export default function Pagination({ links }: Props) {
    if (!links || links.length === 0) return null;

    return (
        <div className="flex justify-center mt-8">
            <div className="flex items-center gap-2">
                {links.map((link, index) => {
                    const isDisabled = link.url === null;

                    return (
                        <Link
                            key={index}
                            href={link.url || ""}
                            preserveScroll
                            className={`
                min-w-[32px] h-8 px-3 flex items-center justify-center 
                rounded-full text-sm transition-all border 
                ${link.active
                                    ? "border-green-500 bg-blue-50 text-gray-600 font-medium"
                                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                                }
                ${isDisabled ? "opacity-40 pointer-events-none" : ""}
              `}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                        />
                    );
                })}
            </div>
        </div>
    );
}
