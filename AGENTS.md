# Architecture rules
- Maintenance subscriptions are draft-edited snapshots inside CRM record JSON; save through CRMProvider and synchronize warranty and maintenance dates with existing record fields to avoid parallel persistence paths.
- Reuse TasksChecklist across customer cards and detail editors so task updates share the CRM persistence path.
- Customer edit forms pass draft task changes to TasksChecklist; persist the complete draft only on Save so closing discards unsaved changes.
- CustomersGrid owns customer filtering and sorting for both views; DataTable accepts the selected records to keep results consistent when switching views.
- CRMProvider persists changes before updating visible state, enforces workflow rules, and invalidates owner-scoped workshop queries so all views share saved data.
- Customer text remains unmodified by language changes; enum values are stable identifiers and only UI labels are translated.
- Client accounts are a read-only projection maintained by a database trigger from CRM payment fields; expense logs hold actual costs separately to avoid double billing.
- Archive restart creates a new linked intervention with cleared billing and incremented phone history; trash restoration reinstates the original record without incrementing visits.
- Workshop tables use owner-scoped access; global fault reference rows are read-only, and soft deletion precedes permanent removal.