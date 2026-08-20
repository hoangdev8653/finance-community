# Data Integrity & Soft Deletion Rule

Protect financial content, user history, auditability, and relational integrity across the platform.

---

## 1. Soft Delete Over Hard Delete

For core business entities:
- **Posts, Comments, User Accounts, Series, Reports**

Always prefer **Soft Deletion** (`deletedAt: Date | null` or status enum `DELETED` / `SUSPENDED` / `ARCHIVED`) over physical row deletion (`DELETE FROM table`).

Benefits:
- Prevents orphaned foreign key references (e.g. comments on deleted posts, reactions on deleted comments).
- Preserves audit trails for financial compliance and moderation review.

---

## 2. Secure Error Handling

1. **No Raw DB Stack Traces**: Never return raw database errors (e.g. PostgreSQL constraint violations, table names, SQL queries) in HTTP 500 responses to the client.
2. **Security Exception Filters**: All backend exceptions must pass through standardized exception filters to return sanitized, user-friendly error codes and messages.
