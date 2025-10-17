---
trigger: model_decision
description: Guidelines for developing backend database logic with Prisma and Postgres
---

# Prisma Development Guidelines

This document outlines the standards and best practices for using Prisma in the Maze monorepo.

## Schema Management

1. Schema Location:
   - Place schema files in the service's `prisma` directory
   - Use clear, descriptive model names
   - Follow established naming conventions
   - Document models with comments

2. Model Design:
   - Use appropriate field types
   - Implement proper relations
   - Define indexes for performance
   - Use enums where appropriate

3. Schema Validation:
   - Run `prisma format` before commits
   - Validate schema changes
   - Check for breaking changes
   - Test migrations locally

## Migration Management

1. Migration Process:
   - Use `prisma migrate dev` for development
   - Create descriptive migration names
   - Review migration SQL
   - Test migrations thoroughly

2. Production Migrations:
   - Use `prisma migrate deploy`
   - Follow the deployment process
   - Have rollback plans
   - Monitor migration execution

## Client Usage

1. Client Generation:
   - Generate after schema changes
   - Use type-safe queries
   - Keep client up to date
   - Handle client errors

2. Query Building:
   - Use proper relations
   - Implement efficient queries
   - Handle N+1 problems
   - Use transactions when needed

## Testing

1. Test Database:
   - Use test environment
   - Reset between tests
   - Mock when appropriate
   - Test edge cases

2. Migration Testing:
   - Test migration scripts
   - Verify data integrity
   - Check performance
   - Test rollbacks

## Performance

1. Query Optimization:
   - Use proper indexes
   - Implement efficient relations
   - Monitor query performance
   - Use query batching

2. Connection Management:
   - Handle connection pooling
   - Manage connection lifecycle
   - Monitor connection usage
   - Handle timeouts

## Security

1. Data Access:
   - Implement proper access control
   - Validate input data
   - Prevent SQL injection
   - Handle sensitive data

2. Environment Security:
   - Secure connection strings
   - Manage database access
   - Audit schema changes
   - Monitor access logs

## Best Practices

1. Code Organization:
   - Separate business logic
   - Use repository pattern
   - Implement proper error handling
   - Follow DRY principles

2. Development Workflow:
   - Use proper branching
   - Review schema changes
   - Document modifications
   - Test thoroughly

## Troubleshooting

1. Common Issues:
   - Migration problems
   - Performance issues
   - Connection errors
   - Type generation issues

2. Resolution Steps:
   - Check logs
   - Verify configurations
   - Test locally
   - Review documentation
