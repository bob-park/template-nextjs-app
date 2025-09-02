import ky from 'ky';

const index = ky.extend({
  hooks: {
    afterResponse: [
      (request, options, response) => {
        // 401 Unauthorized 인 경우 로그인 페이지로 이동
        if (response.status === 401) {
          location.href = '/api/oauth2/authorization/keyflow-auth';
        }
      },
    ],
  },
});

export function getNextPageParams<T>(lastPage: Page<T>) {
  let totalPage = Math.floor(lastPage.total / lastPage.pageable.pageSize);

  if (lastPage.total % lastPage.pageable.pageSize > 0) {
    totalPage = totalPage + 1;
  }

  const page = {
    size: lastPage.pageable.pageSize,
    page: lastPage.pageable.pageNumber,
    sort: `${lastPage.pageable.sort.orders[0].property},${lastPage.pageable.sort.orders[0].direction}`,
  };

  const nextPage = page.page + 1;

  if (nextPage > totalPage - 1) {
    return null;
  }

  return {
    size: page.size,
    page: nextPage,
    sort: page.sort,
  };
}

export default index;
