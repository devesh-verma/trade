# Trade API Performance Testing

## ORM Implementation Comparison

This project includes three different ORM implementations for the Trade API:

1. **Prisma ORM**: Type-safe database client with auto-generated queries
2. **Drizzle ORM**: Lightweight TypeScript ORM with raw SQL-like query builder
3. **Native PostgreSQL**: Direct database access using node-postgres

### Running Performance Tests

You can run stress tests with different ORM implementations using the following commands:

```bash
# Run tests with all implementations
pnpm stress:all

# Run tests with specific implementation
pnpm stress:prisma
pnpm stress:drizzle
pnpm stress:native
```

The test results will be saved in the `results` directory:

- Individual results: `stress-test-results-{orm}.json`
- Comparison report: `comparison-report.json`

### Switching ORM Implementation

The active ORM implementation can be switched using the `ORM_TYPE` environment variable:

```bash
ORM_TYPE=prisma pnpm start:dev  # Use Prisma ORM
ORM_TYPE=drizzle pnpm start:dev # Use Drizzle ORM
ORM_TYPE=native pnpm start:dev  # Use Native PostgreSQL
```

### Implementation Details

Each ORM implementation follows the Repository pattern and implements the same interface:

```typescript
interface ITradeRepository {
  findAll(params: {
    type?: string;
    userId?: string;
  }): Promise<{Trade[]}>;

  findById(id: string): Promise<Trade | null>;

  create(data: ITradeRequest): Promise<Trade>;
}
```

This allows for easy comparison between different implementations while maintaining consistent behavior across the application.

