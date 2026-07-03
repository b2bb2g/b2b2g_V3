// 관리자 영역 공통 레이아웃. 좌측 사이드바 네비 + 콘텐츠. 접근은 proxy(admin) + RLS 이중.
import { getTranslations } from 'next-intl/server';
import { AdminSidebar, type SidebarGroup } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations('admin');
  const tn = await getTranslations('nav');
  const tc = await getTranslations('content');
  const te = await getTranslations('events');
  const tp = await getTranslations('epc');
  const tr = await getTranslations('requests');
  const tm = await getTranslations('menu');
  const tsv = await getTranslations('services');
  const tmk = await getTranslations('marketing');
  const tcat = await getTranslations('categories');

  const groups: SidebarGroup[] = [
    { heading: t('overview'), links: [{ href: '/admin', label: t('dashboard') }] },
    {
      heading: t('groupMembers'),
      links: [
        { href: '/admin/members', label: t('manageMembers') },
        { href: '/admin/suppliers', label: t('pendingSuppliers') },
      ],
    },
    {
      heading: t('groupCatalog'),
      links: [
        { href: '/admin/products', label: t('manageProducts') },
        { href: '/admin/categories', label: tcat('manage') },
      ],
    },
    {
      heading: t('groupContent'),
      links: [
        { href: '/admin/notices', label: tc('manageNotices') },
        { href: '/admin/faq', label: tc('manageFaq') },
        { href: '/admin/events', label: te('manage') },
        { href: '/admin/epc', label: tp('manage') },
        { href: '/admin/services', label: tsv('manage') },
        { href: '/admin/legal', label: t('legal') },
      ],
    },
    {
      heading: t('groupSourcing'),
      links: [
        { href: '/admin/requests', label: tr('manage') },
        { href: '/admin/inquiries', label: t('manageInquiries') },
      ],
    },
    {
      heading: t('groupSite'),
      links: [
        { href: '/admin/menu', label: tm('manage') },
        { href: '/admin/banners', label: tmk('banners') },
        { href: '/admin/popups', label: tmk('popups') },
        { href: '/admin/links', label: t('links') },
      ],
    },
    {
      heading: t('groupSystem'),
      links: [
        { href: '/admin/audit', label: t('audit') },
        { href: '/admin/emails', label: t('emails') },
      ],
    },
  ];

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:gap-8 md:px-6">
      <AdminSidebar
        title={t('title')}
        home={{ href: '/admin', label: t('dashboard') }}
        groups={groups}
        menuLabel={tn('menu')}
      />
      <main className="flex min-w-0 flex-1 flex-col gap-6">{children}</main>
    </div>
  );
}
