import { parsePagination, paginatedResponse } from '../pagination';

describe('parsePagination', () => {
  it('should parse page and limit from query', () => {
    const result = parsePagination({ page: '3', limit: '20' });

    expect(result.page).toBe(3);
    expect(result.limit).toBe(20);
  });

  it('should default to page 1 and limit 10', () => {
    const result = parsePagination({});

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('should enforce minimum page of 1', () => {
    const result = parsePagination({ page: '-5', limit: '10' });

    expect(result.page).toBe(1);
  });

  it('should enforce minimum limit of 1', () => {
    const result = parsePagination({ page: '1', limit: '-5' });

    expect(result.limit).toBe(1);
  });

  it('should enforce maximum limit of 100', () => {
    const result = parsePagination({ page: '1', limit: '500' });

    expect(result.limit).toBe(100);
  });

  it('should handle NaN values', () => {
    const result = parsePagination({ page: 'abc', limit: 'xyz' });

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });
});

describe('paginatedResponse', () => {
  it('should build a paginated response', () => {
    const data = [{ id: 1 }, { id: 2 }];

    const result = paginatedResponse(data, 50, { page: 2, limit: 10 });

    expect(result.data).toEqual(data);
    expect(result.total).toBe(50);
    expect(result.page).toBe(2);
    expect(result.limit).toBe(10);
    expect(result.totalPages).toBe(5);
  });

  it('should ceil totalPages', () => {
    const result = paginatedResponse([], 11, { page: 1, limit: 10 });

    expect(result.totalPages).toBe(2);
  });

  it('should handle empty data', () => {
    const result = paginatedResponse([], 0, { page: 1, limit: 10 });

    expect(result.totalPages).toBe(0);
    expect(result.data).toEqual([]);
  });
});
