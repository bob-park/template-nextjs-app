type SearchPageParams = {
  page: number;
  size: number;
};

interface Order {
  direction: 'ASC' | 'DESC';
  property: string;
}

interface Sort {
  orders: Order[];
}

interface Pageable {
  pageNumber: number;
  pageSize: number;
  sort: Sort;
}

/**
 * Page Response
 */
interface Page<T> {
  content: T[];
  pageable: Pageable;
  total: number;
}

/**
 * Page Request
 */
type PageRequest = {
  page: number;
  size: number;
  sort?: string;
};
