'use client';

import { use, useContext } from 'react';

import { useUser } from '@/domain/users/queries/users';
import { authClient } from '@/shared/auth/auth-client';
import { ToastContext } from '@/shared/components/toast/ToastProvider';

export default function Home() {
  // context
  const { push } = use(ToastContext);

  // hooks
  const { data, isPending } = authClient.useSession();

  // queries
  const { user } = useUser(data?.user.sub || '', isPending);

  console.log(user);

  // handle
  const handlePushClick = () => {
    push('username:' + user?.username, 'info');
  };

  return (
    <div className="size-full">
      home
      <div>
        <a className="btn" href="/logout">
          logout
        </a>
      </div>
      <div>
        <button className="btn" onClick={handlePushClick}>
          push
        </button>
      </div>
    </div>
  );
}
