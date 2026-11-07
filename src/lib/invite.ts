import { APP_ORIGIN } from './links';

export type InviteRead =
  | { ok: true; url: string }
  | { ok: false; reason: 'empty' | 'link' | 'site' | 'kind' };

const INVITE_PATH = /^\/(join|claim)\/([A-Za-z0-9_\-:.]+)\/?$/;

/** Reads a pasted invite or claim link. Only links on the app's own address are opened. */
export function readInvite(text: string): InviteRead {
  const raw = text.trim();
  if (!raw) return { ok: false, reason: 'empty' };
  const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return { ok: false, reason: 'link' };
  }
  if (!url.hostname.includes('.') && url.protocol === 'https:') return { ok: false, reason: 'link' };
  if (url.origin !== APP_ORIGIN) return { ok: false, reason: 'site' };
  const match = INVITE_PATH.exec(url.pathname);
  if (!match) return { ok: false, reason: 'kind' };
  return { ok: true, url: `${APP_ORIGIN}/${match[1]}/${match[2]}/` };
}

export const INVITE_REASONS: Record<'empty' | 'link' | 'site' | 'kind', string> = {
  empty: 'Paste the invite link your host sent.',
  link: 'That is not a link. Paste the whole link from the chat.',
  site: 'That link is not a PokerNights link. Ask your host to send it again.',
  kind: 'That is a PokerNights page, not an invite. Invite links contain /join/.',
};
