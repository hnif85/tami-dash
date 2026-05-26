# Tami Dash — Knowledge

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Database:** Supabase (project: udupiblnzlzjmaafvdtv)
- **Styling:** Tailwind CSS v4
- **Deploy:** Vercel

## Database

### Key Tables
| Table | Purpose |
|-------|---------|
| `credit_manager_transactions` | All credit/debit events per app agent |
| `credit_manager_users` | User identity mapping |
| `transaction_details` | Purchase line items |
| `profile` | Enriched user profiles |

### CreateWhiz Agent ID
`9ba95f62-7f26-4922-9b84-3fa0822b34ac`

### Query Pattern
```sql
SELECT cmu.id, cmu.name, cmu.email,
  SUM(CASE WHEN cmt.type = 'credit' THEN cmt.amount ELSE 0 END) AS total_credits,
  SUM(CASE WHEN cmt.type = 'debit' THEN cmt.amount ELSE 0 END) AS total_debits,
  SUM(CASE WHEN cmt.type = 'credit' THEN cmt.amount ELSE -cmt.amount END) AS balance
FROM credit_manager_transactions cmt
JOIN credit_manager_users cmu ON cmt.user_id = cmu.id
WHERE cmt.agent = '9ba95f62-7f26-4922-9b84-3fa0822b34ac'
GROUP BY cmu.id, cmu.name, cmu.email
ORDER BY balance DESC;
```

## API
### CreateWhiz Deliverables
- **Endpoint:** `https://createwhiz.ai/api/ext/deliverables/{id}`
- **Header:** `x-super-token: x-super-token:...`
- **ID:** `aeed59cc-b279-4ec6-a5a2-71a9203ca40a`
