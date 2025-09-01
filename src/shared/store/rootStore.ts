import createDeviceSlice from '@/domain/devices/store/slice';
import createUserSlice from '@/domain/users/store/slice';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export const useStore = create<BoundState>()(
  devtools(
    immer((...a) => ({
      ...createUserSlice(...a),
      ...createDeviceSlice(...a),
    })),
    { name: 'smart-scoreboard-manager', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export type BoundState = UserState & DeviceState;
