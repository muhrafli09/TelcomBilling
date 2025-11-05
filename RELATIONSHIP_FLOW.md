# Telecom Billing System - Relationship Flow

## 📋 CONTRACTS → 💰 RATES → 📊 CDR → 📄 INVOICES

### 1. **CONTRACTS** (Company Management)
- **Fields**: company_name, accountcode, contact_person, email, phone, address, status, rate_group_id
- **Purpose**: Manage client companies and their account codes
- **Relationship**: Each contract belongs to one Rate Group

### 2. **RATE GROUPS** (Rate Management)
- **Fields**: name, memo
- **Purpose**: Group related rates together (e.g., "Domestic Rates", "International Rates")
- **Relationship**: Has many Rates, Has many Contracts

### 3. **RATES** (Individual Rate Configuration)
- **Fields**: rate_group_id, rate_prefix, area_prefix, rate_type, billing_rate, billing_cycle
- **Purpose**: Define billing rates for specific destination prefixes
- **Rate Types**: per_minute, per_second, flat_rate
- **Billing Cycles**: 1, 6, 30, 60 seconds

### 4. **CDR** (Call Detail Records)
- **Fields**: calldate, accountcode, src, dst, duration, billsec, disposition, cost
- **Purpose**: Store raw call data from Asterisk
- **Relationship**: Belongs to Contract via accountcode

### 5. **INVOICES** (Monthly Billing)
- **Fields**: accountcode, invoice_number, invoice_date, due_date, amount, status
- **Purpose**: Generate monthly bills for contracts
- **Status Flow**: draft → sent → pending_approval → paid

## 🔄 **Processing Flow**

### Step 1: Contract Setup
```
Admin creates Contract → Assigns Rate Group → Rate Group contains Rates
```

### Step 2: CDR Processing
```
Asterisk generates CDR → System imports CDR → Matches accountcode to Contract
```

### Step 3: Rate Calculation
```
CDR destination → Find matching Rate in Contract's Rate Group → Calculate cost
```

### Step 4: Invoice Generation
```
Monthly job → Sum all CDR costs per Contract → Generate Invoice
```

## 🛠 **Commands Available**

### Process CDR Billing
```bash
php artisan cdr:process-billing --date=2025-11-05
```

### Generate Monthly Invoices
```bash
php artisan invoices:generate --month=11 --year=2025
```

## 📊 **Rate Calculation Logic**

### Rate Matching
1. Clean destination number (remove quotes, convert 08xxx to 628xxx)
2. Find Rate in Contract's Rate Group with longest matching prefix
3. Apply rate based on rate_type and billing_cycle

### Cost Calculation
- **per_second**: billsec × billing_rate
- **per_minute**: ceil(billsec/60) × billing_rate  
- **flat_rate**: billing_rate (fixed cost per call)
- **billing_cycle**: Round up billsec to nearest cycle

## 🔗 **Database Relationships**

```
contracts
├── rate_group_id → rate_groups.id
├── accountcode → cdr.accountcode
└── accountcode → invoices.accountcode

rate_groups
├── id → contracts.rate_group_id
└── id → rates.rate_group_id

rates
└── rate_group_id → rate_groups.id

cdr
└── accountcode → contracts.accountcode

invoices
└── accountcode → contracts.accountcode
```

## 📈 **Complete Billing Workflow**

1. **Setup**: Create Contract → Assign Rate Group → Configure Rates
2. **Processing**: Import CDR → Calculate costs using Contract rates
3. **Billing**: Generate monthly invoices from CDR costs
4. **Payment**: Customer requests payment → Admin approves → Mark as paid

This creates a complete end-to-end billing system from raw CDR data to final invoices.