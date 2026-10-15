import { useState } from 'react';

import Image from 'next/image';

import cx from 'classnames';

const SIZES = {
  sm: 'size-7 text-xs',
  md: 'size-8 text-sm',
  base: 'size-9 text-lg',
  lg: 'size-12 text-xl',
  xl: 'size-16 text-2xl',
};

interface UserAvatarProps {
  src?: string | false | null | undefined;
  size?: 'sm' | 'md' | 'base' | 'lg' | 'xl';
  username: string;
}

export default function UserAvatar({ src, size = 'base', username }: Readonly<UserAvatarProps>) {
  // state
  const [isError, setIsError] = useState<boolean>(false);

  return (
    <div className="avatar">
      <div className={cx('relative rounded-full', SIZES[size])}>
        {src && !isError ? (
          <Image className="size-full rounded-full" src={src} alt="user-avatar" fill onError={() => setIsError(true)} />
        ) : (
          <div className="flex size-full items-center justify-center rounded-full bg-black">
            <span className="text-white">{username.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
