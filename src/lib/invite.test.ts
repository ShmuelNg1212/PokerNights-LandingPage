import { describe, expect, it } from 'vitest';
import { readInvite } from './invite';

describe('readInvite', () => {
  it('accepts an invite or claim link on the app address', () => {
    expect(readInvite('https://pokernights-five.vercel.app/join/AbC123-x_9/')).toEqual({ ok: true, url: 'https://pokernights-five.vercel.app/join/AbC123-x_9/' });
    expect(readInvite('  https://pokernights-five.vercel.app/claim/tok3n/  ')).toEqual({ ok: true, url: 'https://pokernights-five.vercel.app/claim/tok3n/' });
  });

  it('adds the scheme and the closing slash when they are missing', () => {
    expect(readInvite('pokernights-five.vercel.app/join/abc')).toEqual({ ok: true, url: 'https://pokernights-five.vercel.app/join/abc/' });
  });

  it('keeps a query string out of the link', () => {
    expect(readInvite('https://pokernights-five.vercel.app/join/abc/?utm=x')).toEqual({ ok: true, url: 'https://pokernights-five.vercel.app/join/abc/' });
  });

  it('refuses another site, even with the same path', () => {
    expect(readInvite('https://example.com/join/abc/')).toMatchObject({ ok: false, reason: 'site' });
    expect(readInvite('https://pokernights-five.vercel.app.evil.com/join/abc/')).toMatchObject({ ok: false, reason: 'site' });
    expect(readInvite('http://pokernights-five.vercel.app/join/abc/')).toMatchObject({ ok: false, reason: 'site' });
  });

  it('refuses a page of the app that is not an invite', () => {
    expect(readInvite('https://pokernights-five.vercel.app/accounts/login/')).toMatchObject({ ok: false, reason: 'kind' });
    expect(readInvite('https://pokernights-five.vercel.app/join/')).toMatchObject({ ok: false, reason: 'kind' });
  });

  it('refuses text that is not a link', () => {
    expect(readInvite('')).toMatchObject({ ok: false, reason: 'empty' });
    expect(readInvite('my friend hana')).toMatchObject({ ok: false, reason: 'link' });
    expect(readInvite('javascript:alert(1)')).toMatchObject({ ok: false, reason: 'site' });
  });
});
