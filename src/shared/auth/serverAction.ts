'use server';

import { headers } from 'next/headers';

import { auth } from '@/shared/auth/index';

export async function getAccessToken() {
  const accessToken = await auth.api.getAccessToken({
    body: {
      useAccountCookie: true,
    },
    headers: await headers(),
  });

  return accessToken.accessToken;
}

export async function getUserinfo() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return session?.user;
}
