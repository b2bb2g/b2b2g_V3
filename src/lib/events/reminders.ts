import 'server-only';
// 임박 행사 리마인더 발송(로드맵 13). 신청자에게 앱 알림 + 이메일. 행사당 1회(reminder_sent_at 기록).
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail } from '@/lib/email/send';

const WINDOW_HOURS = 48; // 앞으로 이 시간 이내에 시작하는 행사에 리마인더.

export async function sendEventReminders(): Promise<{ events: number; emailed: number }> {
  const admin = createAdminClient();
  const now = new Date();
  const windowEnd = new Date(now.getTime() + WINDOW_HOURS * 3600 * 1000).toISOString();

  const { data: events } = await admin
    .from('events')
    .select('id, name, starts_at')
    .eq('status', 'published')
    .eq('registration_enabled', true)
    .eq('reminder_enabled', true)
    .is('reminder_sent_at', null)
    .not('starts_at', 'is', null)
    .gte('starts_at', now.toISOString())
    .lte('starts_at', windowEnd);

  let emailed = 0;
  for (const ev of events ?? []) {
    const { data: regs } = await admin
      .from('event_registrations')
      .select('profile_id')
      .eq('event_id', ev.id)
      .in('status', ['applied', 'confirmed']);

    for (const r of regs ?? []) {
      const { data: profile } = await admin
        .from('profiles')
        .select('email, locale')
        .eq('id', r.profile_id)
        .maybeSingle();

      await admin.from('notifications').insert({
        profile_id: r.profile_id,
        type: 'event_reminder',
        payload: { eventName: ev.name, eventId: ev.id },
      });

      if (profile?.email) {
        await sendEmail({
          to: profile.email,
          template: 'event_reminder',
          locale: profile.locale ?? 'en',
          payload: { eventName: ev.name, when: (ev.starts_at ?? '').slice(0, 10) },
          profileId: r.profile_id,
        });
        emailed++;
      }
    }

    await admin.from('events').update({ reminder_sent_at: now.toISOString() }).eq('id', ev.id);
  }

  return { events: events?.length ?? 0, emailed };
}
