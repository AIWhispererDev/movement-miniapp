'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Layers, Wallet } from 'lucide-react';

const navItems = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/validators', icon: Layers, label: 'Validators' },
  { href: '/my-stakes', icon: Wallet, label: 'My Stakes' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-lg border-t border-gray-800 safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-emerald-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'scale-110' : ''}`} />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
