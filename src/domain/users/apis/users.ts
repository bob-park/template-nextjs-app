import api from '@/shared/api';
import delay from '@/utils/delay';

export async function getMe() {
  return api.get('/api/users/me').json<User>();
}

export async function getUsers(params: UserSearchRequest & PageRequest) {
  return api.get('/api/users', { searchParams: params }).json<Page<User>>();
}

export async function getUser(id: string) {
  return api.get(`/api/users/${id}`).json<User>();
}

export async function register(req: UserRegisterRequest) {
  const result = await api.post('/api/users', { json: req }).json<User>();

  await delay(1_000);

  return result;
}

export async function removeUser(id: string) {
  const result = await api.delete(`/api/users/${id}`).json<User>();

  await delay(1_000);

  return result;
}

export async function restoreUser(id: string) {
  const result = await api.put(`/api/users/${id}/restore`).json<User>();

  await delay(1_000);

  return result;
}

export async function checkUserId(userId: string) {
  return api
    .get('/api/users/check', {
      searchParams: {
        userId,
      },
    })
    .json<{ exist: boolean }>();
}
