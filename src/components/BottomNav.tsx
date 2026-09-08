"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Home } from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const tabs = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/bca", label: "BCA", icon: Activity },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-divider bg-background/90 shadow-[0_-1px_12px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="flex h-[64px] items-center justify-around px-[24px]">
        {tabs.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex min-h-[44px] min-w-[64px] flex-col items-center justify-center gap-[4px] transition-colors ${
                isActive
                  ? "font-semibold text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
              <span className="text-label-caps">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}