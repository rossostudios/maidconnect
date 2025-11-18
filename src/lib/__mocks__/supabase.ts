/**
 * Supabase Mock Factory
 *
 * Provides comprehensive mocks for Supabase client operations in tests.
 * Use these mocks to test service layer logic without hitting real database.
 *
 * @example
 * ```ts
 * import { createMockSupabaseClient, mockSupabaseQuery } from '@/lib/__mocks__/supabase';
 *
 * describe('UserService', () => {
 *   it('should fetch user by id', async () => {
 *     const mockClient = createMockSupabaseClient();
 *     mockSupabaseQuery(mockClient.from('users').select('*').eq('id', '123'), {
 *       data: [{ id: '123', email: 'test@example.com' }],
 *       error: null,
 *     });
 *
 *     const result = await getUserById(mockClient, '123');
 *     expect(result).toEqual({ id: '123', email: 'test@example.com' });
 *   });
 * });
 * ```
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// TYPES
// ============================================================================

export type MockQueryBuilder = {
  select: (columns?: string) => MockQueryBuilder;
  insert: (data: unknown) => MockQueryBuilder;
  update: (data: unknown) => MockQueryBuilder;
  delete: () => MockQueryBuilder;
  eq: (column: string, value: unknown) => MockQueryBuilder;
  neq: (column: string, value: unknown) => MockQueryBuilder;
  gt: (column: string, value: unknown) => MockQueryBuilder;
  gte: (column: string, value: unknown) => MockQueryBuilder;
  lt: (column: string, value: unknown) => MockQueryBuilder;
  lte: (column: string, value: unknown) => MockQueryBuilder;
  in: (column: string, values: unknown[]) => MockQueryBuilder;
  is: (column: string, value: unknown) => MockQueryBuilder;
  like: (column: string, pattern: string) => MockQueryBuilder;
  ilike: (column: string, pattern: string) => MockQueryBuilder;
  contains: (column: string, value: unknown) => MockQueryBuilder;
  containedBy: (column: string, value: unknown) => MockQueryBuilder;
  rangeGt: (column: string, range: string) => MockQueryBuilder;
  rangeLt: (column: string, range: string) => MockQueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => MockQueryBuilder;
  limit: (count: number) => MockQueryBuilder;
  range: (from: number, to: number) => MockQueryBuilder;
  single: () => MockQueryBuilder;
  maybeSingle: () => MockQueryBuilder;
  // Result methods
  then: <TResult1 = unknown, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: unknown; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) => Promise<TResult1 | TResult2>;
};

export type MockAuthResponse = {
  data: {
    user: {
      id: string;
      email: string;
      role?: string;
      [key: string]: unknown;
    } | null;
    session: {
      access_token: string;
      refresh_token: string;
      expires_at: number;
      [key: string]: unknown;
    } | null;
  };
  error: Error | null;
};

export type MockStorageResponse = {
  data: {
    path?: string;
    id?: string;
    fullPath?: string;
    [key: string]: unknown;
  } | null;
  error: Error | null;
};

// ============================================================================
// MOCK QUERY BUILDER
// ============================================================================

/**
 * Creates a chainable mock query builder that mimics Supabase's PostgREST API
 */
export function createMockQueryBuilder(
  tableName: string,
  mockResponse?: { data: unknown; error: Error | null }
): MockQueryBuilder {
  const queryState = {
    table: tableName,
    operation: "",
    filters: [] as string[],
    data: null as unknown,
    response: mockResponse || { data: null, error: null },
  };

  const builder: MockQueryBuilder = {
    select: (columns = "*") => {
      queryState.operation = `select(${columns})`;
      return builder;
    },
    insert: (data) => {
      queryState.operation = "insert";
      queryState.data = data;
      return builder;
    },
    update: (data) => {
      queryState.operation = "update";
      queryState.data = data;
      return builder;
    },
    delete: () => {
      queryState.operation = "delete";
      return builder;
    },
    eq: (column, value) => {
      queryState.filters.push(`eq(${column}, ${JSON.stringify(value)})`);
      return builder;
    },
    neq: (column, value) => {
      queryState.filters.push(`neq(${column}, ${JSON.stringify(value)})`);
      return builder;
    },
    gt: (column, value) => {
      queryState.filters.push(`gt(${column}, ${JSON.stringify(value)})`);
      return builder;
    },
    gte: (column, value) => {
      queryState.filters.push(`gte(${column}, ${JSON.stringify(value)})`);
      return builder;
    },
    lt: (column, value) => {
      queryState.filters.push(`lt(${column}, ${JSON.stringify(value)})`);
      return builder;
    },
    lte: (column, value) => {
      queryState.filters.push(`lte(${column}, ${JSON.stringify(value)})`);
      return builder;
    },
    in: (column, values) => {
      queryState.filters.push(
        `in(${column}, [${values.map((v) => JSON.stringify(v)).join(", ")}])`
      );
      return builder;
    },
    is: (column, value) => {
      queryState.filters.push(`is(${column}, ${JSON.stringify(value)})`);
      return builder;
    },
    like: (column, pattern) => {
      queryState.filters.push(`like(${column}, ${JSON.stringify(pattern)})`);
      return builder;
    },
    ilike: (column, pattern) => {
      queryState.filters.push(`ilike(${column}, ${JSON.stringify(pattern)})`);
      return builder;
    },
    contains: (column, value) => {
      queryState.filters.push(`contains(${column}, ${JSON.stringify(value)})`);
      return builder;
    },
    containedBy: (column, value) => {
      queryState.filters.push(`containedBy(${column}, ${JSON.stringify(value)})`);
      return builder;
    },
    rangeGt: (column, range) => {
      queryState.filters.push(`rangeGt(${column}, ${JSON.stringify(range)})`);
      return builder;
    },
    rangeLt: (column, range) => {
      queryState.filters.push(`rangeLt(${column}, ${JSON.stringify(range)})`);
      return builder;
    },
    order: (column, options = {}) => {
      const direction = options.ascending === false ? "desc" : "asc";
      queryState.filters.push(`order(${column}, ${direction})`);
      return builder;
    },
    limit: (count) => {
      queryState.filters.push(`limit(${count})`);
      return builder;
    },
    range: (from, to) => {
      queryState.filters.push(`range(${from}, ${to})`);
      return builder;
    },
    single: () => {
      queryState.filters.push("single()");
      return builder;
    },
    maybeSingle: () => {
      queryState.filters.push("maybeSingle()");
      return builder;
    },
    then: (onfulfilled) => Promise.resolve(queryState.response).then(onfulfilled),
  };

  return builder;
}

/**
 * Helper to set mock response for a query builder
 *
 * @example
 * ```ts
 * const query = mockClient.from('users').select('*');
 * mockSupabaseQuery(query, { data: [{ id: '123' }], error: null });
 * ```
 */
export function mockSupabaseQuery(
  queryBuilder: MockQueryBuilder,
  response: { data: unknown; error: Error | null }
): void {
  // Override the then method to return the mocked response
  queryBuilder.then = (onfulfilled) => Promise.resolve(response).then(onfulfilled);
}

// ============================================================================
// MOCK SUPABASE CLIENT
// ============================================================================

export type MockSupabaseClient = SupabaseClient & {
  __mockData: Map<string, { data: unknown; error: Error | null }>;
  __setMockResponse: (table: string, response: { data: unknown; error: Error | null }) => void;
};

/**
 * Creates a mock Supabase client with common operations
 *
 * @example
 * ```ts
 * const mockClient = createMockSupabaseClient();
 *
 * // Set default response for a table
 * mockClient.__setMockResponse('users', {
 *   data: [{ id: '123', email: 'test@example.com' }],
 *   error: null,
 * });
 *
 * // Use in service tests
 * const users = await mockClient.from('users').select('*');
 * ```
 */
export function createMockSupabaseClient(): MockSupabaseClient {
  const mockData = new Map<string, { data: unknown; error: Error | null }>();

  return {
    __mockData: mockData,
    __setMockResponse: (table, response) => {
      mockData.set(table, response);
    },

    // Database operations
    from: (table: string) => {
      const response = mockData.get(table) || { data: null, error: null };
      return createMockQueryBuilder(table, response);
    },

    // Auth operations
    auth: {
      signUp: async () => ({
        data: { user: null, session: null },
        error: null,
      }),
      signInWithPassword: async () => ({
        data: { user: null, session: null },
        error: null,
      }),
      signInWithOAuth: async () => ({
        data: { provider: "", url: "" },
        error: null,
      }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({
        data: { user: null },
        error: null,
      }),
      getSession: async () => ({
        data: { session: null },
        error: null,
      }),
      refreshSession: async () => ({
        data: { session: null, user: null },
        error: null,
      }),
      updateUser: async () => ({
        data: { user: null },
        error: null,
      }),
      resetPasswordForEmail: async () => ({
        data: {},
        error: null,
      }),
      onAuthStateChange: () => ({
        data: { subscription: { unsubscribe: () => {} } },
      }),
    } as any,

    // Storage operations
    storage: {
      from: (bucket: string) => ({
        upload: async () => ({
          data: { path: `${bucket}/mock-file` },
          error: null,
        }),
        download: async () => ({
          data: new Blob(),
          error: null,
        }),
        list: async () => ({
          data: [],
          error: null,
        }),
        remove: async () => ({
          data: [],
          error: null,
        }),
        createSignedUrl: async () => ({
          data: { signedUrl: `https://example.com/${bucket}/mock-file` },
          error: null,
        }),
        getPublicUrl: () => ({
          data: { publicUrl: `https://example.com/${bucket}/mock-file` },
        }),
      }),
    } as any,

    // Realtime
    channel: () =>
      ({
        on: () => ({}),
        subscribe: () => ({}),
        unsubscribe: async () => {},
      }) as any,

    // RPC (Remote Procedure Call)
    rpc: async () => ({
      data: null,
      error: null,
    }),

    // Functions not commonly used but needed for type compatibility
    removeChannel: () => {},
    getChannels: () => [],
  } as MockSupabaseClient;
}

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

/**
 * Creates mock user data
 */
export function createMockUser(
  overrides?: Partial<{
    id: string;
    email: string;
    role: string;
    created_at: string;
    [key: string]: unknown;
  }>
) {
  return {
    id: "mock-user-123",
    email: "test@example.com",
    role: "user",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates mock professional data
 */
export function createMockProfessional(overrides?: Record<string, unknown>) {
  return {
    id: "mock-pro-456",
    user_id: "mock-user-123",
    first_name: "Jane",
    last_name: "Doe",
    hourly_rate: 50_000,
    services: ["cleaning", "cooking"],
    rating: 4.8,
    total_reviews: 24,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/**
 * Creates mock booking data
 */
export function createMockBooking(overrides?: Record<string, unknown>) {
  return {
    id: "mock-booking-789",
    user_id: "mock-user-123",
    professional_id: "mock-pro-456",
    service_type: "cleaning",
    status: "pending",
    start_time: new Date().toISOString(),
    end_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    total_amount: 100_000,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Creates a mock error for testing error handling
 */
export function createMockSupabaseError(message: string, code?: string) {
  const error = new Error(message);
  if (code) {
    (error as any).code = code;
  }
  return error;
}

/**
 * Creates a mock auth response
 */
export function createMockAuthResponse(
  user?: Record<string, unknown> | null,
  error?: Error | null
): MockAuthResponse {
  return {
    data: {
      user: user
        ? {
            id: (user.id as string) || "mock-user-123",
            email: (user.email as string) || "test@example.com",
            ...user,
          }
        : null,
      session: user
        ? {
            access_token: "mock-access-token",
            refresh_token: "mock-refresh-token",
            expires_at: Date.now() + 3_600_000,
          }
        : null,
    },
    error: error || null,
  };
}
