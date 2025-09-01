interface QueryMutationHandle<T> {
  onSuccess?: (data: T) => void;
  onError?: (err?: unknown) => void;
}
