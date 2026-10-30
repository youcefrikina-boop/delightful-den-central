# Architecture rules
- Reuse TasksChecklist across customer cards and detail editors so task updates share the CRM persistence path.
- Customer edit forms pass draft task changes to TasksChecklist; persist the complete draft only on Save so closing discards unsaved changes.
- CustomersGrid owns customer filtering and sorting for both views; DataTable accepts the selected records to keep results consistent when switching views.