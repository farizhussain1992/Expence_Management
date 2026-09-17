# Expence_Management

Act as a Full-Stack Web Developer. Build a fully functional Expense & Cash Flow Management Application with the following core requirements and technical specifications.

### 1. Core Features & Architecture
- Data Models:
  - Account: ID, Name, Type (Checking, Savings, Credit Card, Cash, Investment, Wallet).
  - Category: ID, Name, Type (Income, Expense), Icon/Color (optional). Allow user to add dynamic custom categories.
  - Transaction: ID, Date, Description, Amount (numeric), Type (Income/Output, Expense/Input), CategoryID, AccountID, Timestamp.
- Key Functionalities:
  - Add/Manage Accounts (with initial balances).
  - Add/Edit/Delete Categories (pre-populate standard defaults, allow custom additions).
  - Record Transactions with amount, directional flow (In/Out), associated Account, and Category.
  - Sorting & Filtering: Interactive data table for transaction records with column-level sorting (Date, Amount, Category, Account, Type).
  - Dashboard: Visual summary of total cash flow (Total Income, Total Expense, Net Cash Flow, Balance per Account, Expense Breakdown by Category).

### 2. Implementation Checklist
Execute the development following these sequential steps:

Step 1: Setup & Data Models
- Scaffold application structure.
- Define schema/interfaces for Accounts, Categories, and Transactions.

Step 2: State & Storage Setup
- Implement a persistent local state store (e.g., LocalStorage or SQLite/PostgreSQL depending on stack).
- Pre-seed default categories (e.g., Groceries, Rent, Salary, Utilities) and default accounts (e.g., Cash, Bank Account).

Step 3: Account & Category Management UI
- Build a form/modal to add and manage custom Accounts (including selecting account type).
- Build a form/modal to add custom Categories dynamically.

Step 4: Transaction Entry System
- Build a form to record income/expenses with inputs for: Date, Description, Amount, In/Out toggle, Account selection dropdown, Category selection dropdown.

Step 5: Interactive Transaction Data Table
- Render transactions in a tabular format showing: Date, Description, Amount, Type, Category, Account.
- Add clickable table headers to sort ascending/descending by any column.
- Include simple search/filter controls by Account or Category.

Step 6: Analytics Dashboard
- Create summary metrics cards: Net Cash Flow, Total Income, Total Expense.
- Render charts/visualizations: Expense breakdown by category (Pie/Donut chart) and Monthly cash flow trends (Bar/Line chart).
