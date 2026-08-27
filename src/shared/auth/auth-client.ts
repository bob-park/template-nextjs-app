import type { auth } from '@/shared/auth/index';

import { inferAdditionalFields } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>()],
});
