# SchoolFlow Lite SaaS Architecture
### Multi-Tenant Firebase + React + TypeScript

---

# SYSTEM OVERVIEW

```
                        Internet
                            │
                    Authentication
                     Firebase Auth
                            │
            ┌───────────────┴────────────────┐
            │                                │
      Super Admin                    School Tenant
            │                                │
            │                     tenantId Isolation
            │                                │
     SaaS Management                School Operations
            │                                │
            └───────────────┬────────────────┘
                            │
                       Firestore
                            │
                Shared Infrastructure
```

---

# APPLICATION STRUCTURE

```
SchoolFlow Lite

├── Public Website
│
├── Authentication
│
├── Super Admin Platform
│
├── School Tenant Platform
│
├── Demo Tenant Platform
│
└── Shared Core
```

---

# FOLDER STRUCTURE

```
src/

├── app/
│
├── layouts/
│
├── pages/
│
├── modules/
│
├── components/
│
├── hooks/
│
├── services/
│
├── firebase/
│
├── contexts/
│
├── store/
│
├── utils/
│
├── types/
│
└── assets/
```

---

# PAGES

```
pages/

├── marketing/
│
├── auth/
│
├── super-admin/
│
├── school/
│
├── demo/
│
└── shared/
```

---

# SUPER ADMIN

```
super-admin/

Dashboard

Schools

Create School

School Details

Subscriptions

Plans

Billing

Invoices

Support

Onboarding

Handover

Announcements

Activity Logs

Audit Logs

Users

Roles

Templates

System Health

Settings

Profile
```

---

# SCHOOL TENANT

```
school/

Dashboard

Learners

Attendance

Teachers

Parents

Payments

Parent Follow-Ups

Calendar

Reports

Forms

Messages

Settings

Support
```

---

# DEMO TENANT

```
demo/

Dashboard

Learners

Attendance

Payments

Follow-Ups

Reports

Calendar

Quick Actions

Features

Pricing

Request Demo
```

Everything is read-only.

---

# SHARED COMPONENTS

```
components/

Sidebar

Topbar

DashboardCard

StatCard

ChartCard

CalendarCard

NotificationCard

QuickAction

SearchBar

DataTable

Modal

Drawer

Wizard

FormBuilder

UploadArea

Avatar

Logo

Loader

EmptyState

Toast

Button

Input

Badge

StatusChip
```

---

# MODULES

```
modules/

schools/

users/

learners/

teachers/

attendance/

payments/

reports/

followups/

forms/

calendar/

support/

billing/

subscriptions/

onboarding/

handover/

analytics/
```

---

# FIRESTORE

```
users

roles

permissions

tenants

schools

subscriptions

plans

billing

payments

teachers

learners

parents

attendance

reports

calendar

events

followups

forms

supportTickets

announcements

templates

activityLogs

auditLogs

notifications

settings
```

---

# TENANT STRUCTURE

```
tenant

id

schoolName

logo

theme

subscriptionPlan

status

createdAt

owner

storageLimit

userLimit

modules

branding

settings
```

---

# USER STRUCTURE

```
user

uid

tenantId

role

displayName

email

phone

status

permissions

photo

createdAt

lastLogin
```

---

# ROLE MATRIX

```
Super Admin

↓

Create Schools

Delete Schools

Suspend Schools

Manage Billing

Manage Plans

Manage Users

System Settings

Support

Logs

Announcements

Everything

---------------------

School Admin

↓

Learners

Attendance

Teachers

Parents

Payments

Reports

Calendar

Forms

Settings

Own School Only

---------------------

Teacher

↓

Attendance

Learners

Reports

Own Classes

---------------------

Staff

↓

Limited Access

---------------------

Demo User

↓

Read Only
```

---

# AUTHENTICATION FLOW

```
Login

↓

Firebase Auth

↓

Fetch User

↓

Read Role

↓

Super Admin

↓

/super-admin

-----------------

School Admin

↓

/school

-----------------

Teacher

↓

/school

-----------------

Demo

↓

/demo
```

---

# ROUTES

```
/

marketing

/login

/signup

------------------

/super-admin

/super-admin/dashboard

/super-admin/schools

/super-admin/create-school

/super-admin/onboarding

/super-admin/handover

/super-admin/billing

/super-admin/support

/super-admin/settings

------------------

/school

/school/dashboard

/school/learners

/school/attendance

/school/payments

/school/reports

/school/forms

/school/settings

------------------

/demo

/demo/dashboard

/demo/learners

/demo/attendance

/demo/payments

/demo/reports

/demo/features
```

---

# SERVICES

```
services/

AuthService

TenantService

SchoolService

UserService

LearnerService

AttendanceService

PaymentService

ReportService

CalendarService

SupportService

BillingService

NotificationService

StorageService
```

---

# ONBOARDING PIPELINE

```
Lead

↓

Discovery

↓

Proposal

↓

Accepted

↓

Deposit Paid

↓

Create Tenant

↓

Create School

↓

Create Admin

↓

Import Data

↓

Configure

↓

Testing

↓

Training

↓

Go Live

↓

Completed
```

---

# HANDOVER PIPELINE

```
Tenant Created

↓

School Created

↓

Admin Login

↓

Users Added

↓

Learners Imported

↓

Teachers Imported

↓

Payments Imported

↓

Attendance Working

↓

Reports Verified

↓

Training Complete

↓

Client Sign-Off
```

---

# DATA FLOW

```
Browser

↓

React

↓

Context

↓

Services

↓

Firestore

↓

Storage

↓

Firebase Auth
```

---

# SECURITY

```
Every document

↓

tenantId

↓

Firestore Rules

↓

Role Validation

↓

Permission Validation

↓

Query Filtering

↓

Response
```

---

# DEMO TENANTS

```
Tenant 001

Bright Futures Academy

↓

742 learners

38 teachers

Production-like data

----------------------------

Tenant 002

Ubuntu Excellence College

↓

913 learners

54 teachers

Different branding

Different data

Same UI
```

---

# DESIGN SYSTEM

The attached dashboard image is the master design reference.

Use it as the UI blueprint.

Replicate exactly:

- Sidebar
- Header
- Dashboard cards
- Calendar
- Quick Actions
- Colors
- Typography
- Shadows
- Border radius
- Spacing
- Icons
- Card sizes
- Grid layout
- Animations
- Hover effects

Never redesign.

Never substitute components.

Create reusable UI components so every tenant shares one design system.

---

# DEVELOPMENT ORDER

```
Phase 1
Authentication

↓

Phase 2
Role Management

↓

Phase 3
Super Admin

↓

Phase 4
Tenant Management

↓

Phase 5
Onboarding Wizard

↓

Phase 6
School Dashboard UI

↓

Phase 7
Learners

↓

Phase 8
Attendance

↓

Phase 9
Payments

↓

Phase 10
Reports

↓

Phase 11
Demo Tenants

↓

Phase 12
Support

↓

Phase 13
Billing

↓

Phase 14
Production Hardening
```

---

# END GOAL

The final solution must operate as a professional multi-tenant SaaS platform with:

- **Public Marketing Website** – Lead generation, pricing, and demo requests.
- **Super Admin Platform** – Operate the SaaS business (schools, subscriptions, onboarding, billing, support, analytics).
- **SchoolFlow Lite Tenant Platform** – Daily school operations for each client, isolated by `tenantId`.
- **Demo Tenant Platform** – Read-only, production-quality demo environments using the exact SchoolFlow Lite UI.

The codebase should be **modular, reusable, scalable, and maintainable**, with clear separation of concerns and no duplication between Super Admin and School Tenant applications.
