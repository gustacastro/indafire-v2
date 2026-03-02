import {
  IconLayoutGrid,
  IconSettings,
  IconStore,
  IconTruck,
  IconWrench,
} from '@/components/icons';
import { MenuGroup, MenuItem } from '@/types/contexts/sidebar.types';
import { NormalizedPermissions } from '@/types/contexts/auth.types';

export const menuConfig: MenuGroup[] = [
  {
    group: 'MENU',
    items: [
      {
        key: 'dashboard',
        icon: IconLayoutGrid,
        label: 'Dashboard',
        href: '/dashboard',
      },
      {
        key: 'comercial',
        icon: IconStore,
        label: 'Comercial',
        subItems: [
          {
            label: 'Painel',
            href: '/commercial-panel',
            permission: { module: 'quotes', action: 'view' },
          },
          {
            label: 'Orçamentos',
            href: '/quotes',
            permission: { module: 'quotes', action: 'view' },
          },
        ],
      },
      {
        key: 'logistics',
        icon: IconTruck,
        label: 'Logística',
        subItems: [
          {
            label: 'Painel de Retirada',
            href: '/logistics/pickup-panel',
            permission: { module: 'job_tasks', action: 'view' },
          },
          {
            label: 'Painel de Entrega',
            href: '/logistics/delivery-panel',
            permissions: [
              { module: 'job_tasks', action: 'view' },
              { module: 'product_tasks', action: 'view' },
            ],
          },
        ],
      },
      {
        key: 'workshop',
        icon: IconWrench,
        label: 'Oficina',
        subItems: [
          {
            label: 'Painel',
            href: '/workshop/panel',
            permission: { module: 'job_tasks', action: 'view' },
          },
        ],
      },
      {
        key: 'settings',
        icon: IconSettings,
        label: 'Configurações',
        subItems: [
          {
            label: 'Usuários',
            href: '/users',
            permission: { module: 'users', action: 'view' },
          },
          {
            label: 'Serviços',
            href: '/jobs',
            permission: { module: 'jobs', action: 'view' },
          },
          {
            label: 'Produtos',
            href: '/products',
            permission: { module: 'products', action: 'view' },
          },
          {
            label: 'Contas Bancárias',
            href: '/bank-accounts',
            permission: { module: 'bank_accounts', action: 'view' },
          },
          {
            label: 'Impostos',
            href: '/taxes',
            permission: { module: 'tax_categories', action: 'view' },
          },
          {
            label: 'Meios de Pagamento',
            href: '/payment-methods',
            permission: { module: 'payment_methods', action: 'view' },
          },
          {
            label: 'Clientes',
            href: '/clients',
            permission: { module: 'clients', action: 'view' },
          },
          {
            label: 'Fornecedores',
            href: '/suppliers',
            permission: { module: 'clients', action: 'view' },
          },
          {
            label: 'WhatsApp',
            href: '/whatsapp',
          },
        ],
      },
    ],
  },
];

export function filterMenuByPermissions(
  config: MenuGroup[],
  permissions: NormalizedPermissions
): MenuGroup[] {
  return config
    .map((group) => {
      const filteredItems = group.items
        .map((item) => {
          if (item.permissions) {
            const hasAny = item.permissions.some((p) => {
              const mp = permissions[p.module];
              return mp && mp[p.action as keyof typeof mp];
            });
            if (!hasAny) return null;
          } else if (item.permission) {
            const modulePerm = permissions[item.permission.module];
            const action = item.permission.action as keyof typeof modulePerm;
            if (!modulePerm || !modulePerm[action]) return null;
          }

          if (item.subItems) {
            const filteredSubItems = item.subItems.filter((sub) => {
              if (sub.permissions) {
                return sub.permissions.some((p) => {
                  const mp = permissions[p.module];
                  return mp && mp[p.action as keyof typeof mp];
                });
              }
              if (!sub.permission) return true;
              const modulePerm = permissions[sub.permission.module];
              const action = sub.permission.action as keyof typeof modulePerm;
              return modulePerm && modulePerm[action];
            });

            if (filteredSubItems.length === 0 && !item.href) return null;

            return { ...item, subItems: filteredSubItems };
          }

          return item;
        })
        .filter(Boolean) as MenuItem[];

      if (filteredItems.length === 0) return null;

      return { ...group, items: filteredItems };
    })
    .filter(Boolean) as MenuGroup[];
}

export function getActiveKey(pathname: string, config: MenuGroup[]): string | null {
  for (const group of config) {
    for (const item of group.items) {
      if (item.href && pathname === item.href) return item.key;
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (pathname.startsWith(sub.href)) return item.key;
        }
      }
    }
  }
  return null;
}

export function getActiveSubHref(pathname: string, config: MenuGroup[]): string | null {
  for (const group of config) {
    for (const item of group.items) {
      if (item.subItems) {
        for (const sub of item.subItems) {
          if (pathname.startsWith(sub.href)) return sub.href;
        }
      }
    }
  }
  return null;
}
