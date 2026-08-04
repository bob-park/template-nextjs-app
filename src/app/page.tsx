'use client';

import { useUsers } from '@/domain/users/queries/users';
import { authClient } from '@/shared/auth/auth-client';

export default function Home() {
  // hooks
  const { data, isPending } = authClient.useSession();

  // queries
  const { users } = useUsers({ page: 0, size: 10 });

  return (
    <div className="size-full">
      home
      <div>
        <a className="btn" href="/logout">
          logout
        </a>
      </div>
    </div>
  );
}
