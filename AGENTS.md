# Architecture rules
- Reuse TasksChecklist across customer cards and detail editors so task updates share the CRM persistence path.
- CustomersGrid owns customer filtering and sorting for both views; DataTable accepts the selected records to keep results consistent when switching views.