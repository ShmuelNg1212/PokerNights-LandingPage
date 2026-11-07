import { readInvite, INVITE_REASONS } from '../lib/invite';

/** The close's invite field: a link on the app's own address opens there; any other text is refused in words. */
export function initOpen() {
  const form = document.querySelector<HTMLFormElement>('form[data-open]');
  if (!form) return;
  const input = form.querySelector<HTMLInputElement>('#invite-link')!;
  const error = form.querySelector<HTMLElement>('[data-invite-error]')!;
  const clear = () => {
    error.textContent = '';
    input.removeAttribute('aria-invalid');
  };
  input.addEventListener('input', () => error.textContent && clear());
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const read = readInvite(input.value);
    if (!read.ok) {
      error.textContent = INVITE_REASONS[read.reason];
      input.setAttribute('aria-invalid', 'true');
      input.focus();
      return;
    }
    window.location.assign(read.url);
  });
}
