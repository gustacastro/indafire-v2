'use client';

import Link from 'next/link';
import { IconChevronDown } from '@/components/icons';
import { SidebarItemProps } from '@/types/contexts/sidebar.types';

export function SidebarItem({
  item,
  isExpanded,
  isActive,
  openMenus,
  onToggleMenu,
  pathname,
}: SidebarItemProps) {
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const isOpen = openMenus[item.key];

  const content = (
    <>
      <div className="flex items-center">
        <span className={`shrink-0 ${isActive ? 'text-brand' : ''}`}>
          <item.icon size={20} />
        </span>
        <span
          className={`font-medium transition-all duration-300 whitespace-nowrap overflow-hidden ${
            isExpanded ? 'opacity-100 w-auto ml-3' : 'opacity-0 w-0 ml-0'
          }`}
        >
          {item.label}
        </span>
      </div>

      <div
        className={`flex items-center transition-all duration-300 overflow-hidden ${
          isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
        }`}
      >
        {hasSubItems && (
          <IconChevronDown
            size={18}
            className={`shrink-0 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        )}
      </div>
    </>
  );

  const buttonClasses = `w-full flex items-center py-2.5 rounded-lg transition-colors duration-200 group ${
    isExpanded ? 'justify-between px-4' : 'justify-center px-0'
  } ${
    isActive
      ? 'bg-sidebar-active text-sidebar-fg-active'
      : 'text-sidebar-fg hover:bg-sidebar-hover hover:text-sidebar-fg-active'
  }`;

  return (
    <li>
      {hasSubItems ? (
        <button onClick={() => onToggleMenu(item.key)} className={buttonClasses}>
          {content}
        </button>
      ) : item.href ? (
        <Link href={item.href} className={buttonClasses}>
          {content}
        </Link>
      ) : (
        <button className={buttonClasses}>{content}</button>
      )}

      {hasSubItems && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen && isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'
          }`}
        >
          <ul className="flex flex-col gap-2 ml-6 pl-4 border-l border-sidebar-border">
            {item.subItems!.map((subItem, subIdx) => {
              const isSubActive = pathname.startsWith(subItem.href);
              return (
                <li key={subIdx}>
                  <Link
                    href={subItem.href}
                    className={`block text-sm transition-colors duration-200 ${
                      isSubActive
                        ? 'text-brand font-medium'
                        : 'text-sidebar-muted hover:text-sidebar-fg-active'
                    }`}
                  >
                    {subItem.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </li>
  );
}
