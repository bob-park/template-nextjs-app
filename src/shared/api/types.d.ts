type SearchPageParams = {
  page: number;
  size: number;
};

/**
 * Page Response
 */
interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

interface PagedModel<T> {
  page: PageMetadata;
  content: T[];
}

/**
 * Page Request
 */
type PageRequest = {
  page: number;
  size: number;
  sort?: string;
};
