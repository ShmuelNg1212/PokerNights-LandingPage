import { readInvite, INVITE_REASONS } from '../lib/invite';
import { LOGIN } from '../lib/links';

/** The closing dialog: an invite link opens on the app's own address; an account goes to log in. */
export function initOpen() {
  const form = document.querySelector<HTMLFormElement>('form[data-open]');
  if (!form) return;
  const field = form.querySelector<HTMLElement>('[data-invite-field]')!;
  const input = form.querySelector<HTMLInputElement>('#invite-link')!;
  const error = form.querySelector<HTMLElement>('[data-invite-error]')!;
  const note = form.querySelector<HTMLElement>('[data-account-note]')!;
  const button = form.querySelector<HTMLButtonElement>('[data-open-button]')!;

  const how = () => (form.querySelector<HTMLInputElement>('input[name=how]:checked')?.value ?? 'invite');
  const sync = () => {
    const invite = how() === 'invite';
    field.hidden = !invite;
    note.hidden = invite;
    button.textContent = invite ? 'Join the group' : 'Log in';
    error.textContent = '';
    input.removeAttribute('aria-invalid');
  };
  form.addEventListener('change', (e) => {
    if ((e.target as HTMLInputElement).name === 'how') sync();
  });
  input.addEventListener('input', () => {
    if (error.textContent) {
      error.textContent = '';
      input.removeAttribute('aria-invalid');
    }
  });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (how() === 'account') {
      window.location.assign(LOGIN);
      return;
    }
    const read = readInvite(input.value);
    if (!read.ok) {
      error.textContent = INVITE_REASONS[read.reason];
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    window.location.assign(read.url);
  });
  sync();
}
