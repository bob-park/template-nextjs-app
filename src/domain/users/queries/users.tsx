import { InfiniteData, QueryKey, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { checkUserId, getMe, getUser, getUsers, register, removeUser, restoreUser } from '@/domain/users/apis/users';
import { getNextPageParams } from '@/shared/api';

export function useMe() {
  const { data } = useQuery<User>({
    queryKey: ['me'],
    queryFn: () => getMe(),
    staleTime: 1_000 * 60 * 5,
    gcTime: 1_000 * 60 * 10,
  });

  return { me: data };
}

export function useUsers(params: UserSearchRequest & PageRequest) {
  const { data, fetchNextPage, isLoading, refetch } = useInfiniteQuery<
    Page<User>,
    unknown,
    InfiniteData<Page<User>>,
    QueryKey,
    PageRequest
  >({
    queryKey: ['users', params.isDeleted],
    queryFn: () => getUsers(params),
    initialPageParam: {
      size: 25,
      page: 0,
    },
    getNextPageParam: (lastPage) => getNextPageParams<User>(lastPage),
  });

  const users = (data?.pages || ([] as Page<User>[])).reduce(
    (current, value) => current.concat(value.content),
    [] as User[],
  );

  const page: Pick<Page<User>, 'total' | 'pageable'> = {
    total: data?.pages[0]?.total ?? 0,
    pageable: {
      pageSize: 25,
      pageNumber: data?.pages[0]?.pageable?.pageNumber ?? 0,
    },
  };

  return { isLoading, fetchNextPage, refetch, users, page };
}

export function useUser(id: string) {
  const { data, isLoading } = useQuery<User>({
    queryKey: ['users', id],
    queryFn: () => getUser(id),
  });

  return { user: data, isLoading };
}

export function useUserRegister({ onSuccess, onError }: QueryMutationHandle<User>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', 'register'],
    mutationFn: (req: UserRegisterRequest) => register(req),
    onSuccess: async (data) => {
      onSuccess?.(data);

      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  return { register: mutate, isLoading: isPending };
}

export function useUserRemove({ onSuccess, onError }: QueryMutationHandle<User>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', 'remove'],
    mutationFn: (id: string) => removeUser(id),
    onSuccess: (data) => {
      queryClient.removeQueries({ queryKey: ['users', data.id] });

      onSuccess?.(data);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  return { removeUser: mutate, isLoading: isPending };
}

export function useUserRestore({ onSuccess, onError }: QueryMutationHandle<User>) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationKey: ['users', 'restore'],
    mutationFn: (id: string) => restoreUser(id),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['users'] });

      onSuccess?.(data);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  return { restoreUser: mutate, isLoading: isPending };
}

export function useUserExistId(userId: string) {
  const { data, isPending } = useQuery<{ exist: boolean }>({
    queryKey: ['users', 'check', userId],
    queryFn: () => checkUserId(userId),
    enabled: !!userId,
  });

  return { exist: data?.exist || false, isLoading: isPending };
}
