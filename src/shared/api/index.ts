import delay from '@/utils/delay';

import ky from 'ky';

const index = ky.extend({
  hooks: {
    afterResponse: [
      ({ response }) => {
        // 401 Unauthorized 인 경우 로그인 페이지로 이동
        if (response.status === 401) {
          location.href = '/api/oauth2/authorization/keyflow-auth';
        }
      },
    ],
  },
});

export function getNextPageParams<T>(lastPage: PagedModel<T>, sort?: string) {
  const { totalPages, number, size } = lastPage.page;

  const nextPage = number + 1;

  if (nextPage > totalPages - 1) {
    return null;
  }

  return {
    size,
    page: nextPage,
    sort,
  };
}

export async function waitForDelay<T>(req: Promise<T>, delayTime: number = 1_000) {
  const result = Promise.allSettled([req, delay(delayTime)]);

  return result.then(([item]) => {
    if (item.status === 'rejected') {
      throw new Error(item.reason);
    }

    return item.value;
  });
}

export default index;
