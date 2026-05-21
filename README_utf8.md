# Clinic Management System Master Spec

## 1. Overview
Build a comprehensive clinic management system using a React, Express, Node.js, and MongoDB stack that supports secure access, user and role administration, doctor and patient lifecycle management, appointment booking, clinical records, tests, billing, reporting, notifications, documents, and audit tracking.

## 2. Technical Stack
### 2.1 Frontend
- React for the web application
- TypeScript for type safety
- Vite for fast local development and builds
- React Context or Zustand for state management
- React Query for server state
- React Hook Form with schema validation
- PrimeReact for the component library

### 2.2 Backend
- Node.js with Express for API and service orchestration
- TypeScript for API consistency and safer refactoring
- RESTful API endpoints for core modules
- GraphQL only if complex querying becomes necessary later
- WebSocket or Socket.IO endpoints for live notifications and workflow updates

### 2.3 Validation and Security
- Zod or Joi for payload validation
- Middleware for authentication and role-based authorization
- RBAC, clinic scoping, and ownership checks for sensitive endpoints
- Rate limiting, CORS controls, helmet, and input sanitization

### 2.4 Data Storage
- MongoDB as the primary document database
- Mongoose or the native MongoDB driver for collections, schemas, and indexes
- ObjectId identifiers and cross-document references where needed
- Embedded documents for small child records such as medication items, reminders, invoice items, and audit snapshots
- Redis for caching, session management, rate limiting, and queue metadata
- Elasticsearch, ClickHouse, or MongoDB aggregation pipelines for reporting and analytics if needed
- S3-compatible object storage for attachments and documents

### 2.5 Platform Services
- Secure session or refresh-token handling with rotation on logout or privilege changes
- Password reset, MFA, and optional OAuth/OpenID Connect integration
- Email, SMS, and in-app notifications for reminders, approvals, and result delivery
- Background jobs for reminders, report generation, and retryable workflows

### 2.6 Deployment and Operations
- Docker for containerization
- Docker Compose for local development
- Kubernetes or managed container services for production
- Managed MongoDB and object storage services
- CDN for frontend assets
- Load balancer and auto-scaling for API services
- GitHub Actions, GitLab CI, or similar for CI/CD
- Type-checking, linting, tests, and security scans on pull requests

### 2.7 Monitoring and Testing
- Structured JSON logs
- Metrics and health checks
- Prometheus/Grafana or cloud monitoring dashboards
- Alerts for errors, latency, failed jobs, and resource issues
- Unit, integration, end-to-end, and security testing

## 3. Core Product Modules
### 3.1 Auth
- Sign in / sign up
- Multi-factor authentication
- Session management
- Password reset / recovery
- Token-based API access
- SSO / OAuth optional integration

### 3.2 User and Permission Management
- User profiles
- Roles and permissions
- Role assignment
- Permission groups
- User activity status
- Organization and clinic-level scoping

### 3.3 Clinic and Location Management
- Clinic profiles and operating details
- Locations, rooms, and service areas
- Working hours and clinic-level settings
- Multi-clinic scoping and assignment rules

### 3.4 Doctors
- Doctor profiles
- Specialties
- Availability
- Schedules
- Qualifications and licensing
- Clinic locations and rooms

### 3.5 Patient Management
- Patient registration
- Demographics
- Medical history
- Family and emergency contacts
- Patient documents

### 3.6 Appointment Scheduling
- Appointment creation and modification
- Doctor and room availability
- Recurring appointments
- Appointment status and reminders
- Walk-in and emergency scheduling
- Patient waitlist

### 3.7 Clinical Records and Digital Prescription
- Encounter notes
- Visit summaries
- Vital signs
- Diagnoses
- Treatment plans
- Prescriptions
- Medication history

### 3.8 Tests
- Lab orders
- Imaging orders
- Test results
- Test status tracking
- Sample collection
- Integration with lab systems

### 3.9 Billing
- Invoices
- Payments
- Refunds
- Discount handling

### 3.10 Reports
- Financial reports
- Appointment utilization
- Patient demographics
- Doctor productivity
- Clinical quality metrics
- Audit reports

### 3.11 Notifications and Messaging
- Email, SMS, and in-app notifications
- Appointment reminders and follow-up alerts
- Critical test result escalation
- Invoice and payment reminders

### 3.12 Audit
- Auditable action history
- Change logs for sensitive records
- Time-stamped events
- Actor identity tracking
- Immutable audit trails

### 3.13 Documents and Attachments
- Patient-uploaded documents
- Scan and image attachments
- Prescription and report exports
- Secure file access by clinic and role

## 4. Core Personas
### 4.1 Clinic Administrator
- Responsible for user onboarding, permission management, clinic configuration, and oversight
- Needs access to reports, audit logs, and role management tools
- Primary goals: security, compliance, and operational continuity

### 4.2 Receptionist / Front Desk Staff
- Manages patient registration, appointment scheduling, check-in, and basic patient communication
- Requires quick access to patient records, available slots, and billing summaries
- Primary goals: maximize throughput, reduce wait times, and keep patient data accurate

### 4.3 Doctor / Clinician
- Performs consultations, documents encounters, prescribes treatment, and orders tests
- Needs access to patient records, appointment lists, lab orders, and digital prescription tools
- Primary goals: deliver safe, efficient care with complete clinical documentation

### 4.4 Lab Technician
- Receives and processes test orders, updates result status, and uploads results
- Needs access to test orders, sample tracking, and result entry interfaces
- Primary goals: accelerate turnaround and ensure data quality

### 4.5 Accountant / Billing Specialist
- Manages invoicing, payments, and financial reconciliation
- Requires billing dashboards and transaction history
- Primary goals: keep revenue flowing and minimize billing disputes

## 5. Key Workflows
### 5.1 User Onboarding
1. Admin creates user account
2. User receives activation email
3. User sets password and optionally enables MFA
4. Admin assigns role and clinic access

### 5.2 Clinic Setup
1. Admin creates clinic profile, locations, and rooms
2. Operating hours and service areas are configured
3. Staff are assigned to one or more locations
4. Scoped access is enforced by clinic and location

### 5.3 Patient Registration
1. Receptionist searches for an existing patient using name, DOB, and contact
2. System suggests possible matches to avoid duplicates
3. Receptionist creates a new patient record with demographics and emergency contacts
4. Patient record is linked to the next available appointment or visit

### 5.4 Appointment Booking and Management
1. Receptionist selects a patient and chooses a provider, date, and time
2. System validates doctor availability and room conflict
3. Appointment confirmation is sent via email or SMS
4. Check-in and appointment status updates occur on arrival

### 5.5 Clinical Encounter and Digital Prescription
1. Doctor opens the patient encounter from the scheduled appointment
2. Doctor records symptoms, vitals, diagnosis, and treatment plan
3. Prescriptions are authored, validated, and signed digitally
4. Encounter is saved, and clinical records are updated for follow-up

### 5.6 Test Ordering and Result Tracking
1. Doctor orders lab or imaging tests during an encounter
2. Lab technician receives the request and updates collection status
3. Technician enters results and marks the order complete
4. Completed results are visible to the ordering doctor and attached to the patient record

### 5.7 Billing Lifecycle
1. Generate invoice after a consultation, visit, or test
2. Apply service charges and payment rules
3. Send invoice to patient
4. Record payments, refunds, and adjustments
5. Close invoice when fully paid

### 5.8 Reporting
1. Clinic manager selects report type
2. Set date range and filters
3. Generate report and export as PDF or CSV
4. Schedule recurring reports for stakeholders

### 5.9 Notifications and Documents
1. System sends reminders, critical alerts, and payment notices
2. Patient documents and attachments are uploaded to object storage
3. Relevant notifications and document events are recorded in audit logs

## 6. Data Model
### 6.1 Auth
- User: id, email, passwordHash, status, roleId, mfaEnabled, lastLoginAt
- Session: id, userId, token, issuedAt, expiresAt, ipAddress, deviceInfo

### 6.2 User and Permission Management
- Role: id, name, description, permissions[]
- Permission: id, key, description
- UserRole: id, userId, roleId, assignedAt

### 6.3 Clinic and Location Management
- Clinic: id, name, code, status, address, phone, email, settings
- Location: id, clinicId, name, type, status, capacity
- Room: id, locationId, name, roomNumber, type, active

### 6.4 Doctors
- Doctor: id, userId, name, specialtyId, qualifications[], licenseNumber, active
- Specialty: id, name, description
- DoctorAvailability: id, doctorId, dayOfWeek, startTime, endTime, locationId

### 6.5 Patient Management
- Patient: id, firstName, lastName, dob, gender, phone, email, address
- PatientMedicalHistory: id, patientId, condition, notes, startDate, endDate, status
- Contact: id, patientId, name, relationship, phone, email, type
- Attachment: id, patientId, fileName, storageKey, mimeType, size, uploadedAt

### 6.6 Appointment Scheduling
- Appointment: id, patientId, doctorId, scheduledAt, duration, status, locationId, reason, createdBy
- AppointmentStatus: id, code, label
- AppointmentReminder: id, appointmentId, reminderAt, type, sentAt
- WaitlistEntry: id, patientId, requestedFor, locationId, specialtyId, priority, status

### 6.7 Clinical Records and Digital Prescription
- Encounter: id, appointmentId, patientId, doctorId, encounterDate, notes, diagnosisCode[], treatmentPlan
- Prescription: id, encounterId, patientId, doctorId, medication[], dosage, frequency, duration, instructions
- Medication: id, prescriptionId, name, strength, route, quantity

### 6.8 Tests
- TestOrder: id, encounterId, patientId, doctorId, testTypeId, requestedAt, status, priority
- TestResult: id, testOrderId, resultData, unit, normalRange, status, completedAt
- TestType: id, name, category, defaultInstructions

### 6.9 Billing
- Invoice: id, patientId, appointmentId, createdAt, dueDate, totalAmount, status
- InvoiceItem: id, invoiceId, description, quantity, unitPrice, totalPrice
- Payment: id, invoiceId, patientId, amount, paidAt, method, reference
- Refund: id, paymentId, invoiceId, amount, reason, issuedAt

### 6.10 Reports
- Report: id, name, type, generatedAt, generatedBy, filterCriteria, fileUrl
- ReportSchedule: id, name, frequency, nextRunAt, recipients

### 6.11 Notifications and Messaging
- Notification: id, userId, type, title, body, status, scheduledAt, sentAt

### 6.12 Audit
- AuditLog: id, entityType, entityId, action, userId, timestamp, sourceIp, changes
- AuditSnapshot: id, auditLogId, beforeData, afterData

### 6.13 Supporting Security Collections
- PasswordResetToken: id, userId, tokenHash, expiresAt, usedAt

## 7. Validation Matrix
| Entity | Required Fields | Format / Constraints | Business Rules |
|---|---|---|---|
| User | email, password, roleId | valid email, password min 8 chars | unique email |
| Role | name | non-empty, unique | only admins can create roles |
| Clinic | name, code | non-empty, unique code | clinic settings apply to all scoped users |
| Doctor | name, specialtyId, licenseNumber | license format, active boolean | license required for active doctors |
| Patient | firstName, lastName, dob, gender | dob <= today, gender in allowed list | duplicate detection by name + dob + contact |
| Appointment | patientId, doctorId, scheduledAt, duration, status | future date, duration > 0 | no double-booking for doctor or location |
| Encounter | appointmentId, doctorId, patientId | notes max length 5000 | encounter required for prescriptions |
| Prescription | encounterId, medication[] | medication name required, dosage positive | validate medication interactions |
| TestOrder | encounterId, testTypeId, status | status in open, in-progress, completed | priority only within defined values |
| Invoice | patientId, createdAt, totalAmount, status | totalAmount >= 0 | cannot close invoice if unpaid amount remains |
| Payment | invoiceId, amount, method | amount > 0 | payment cannot exceed invoice balance |
| Attachment | patientId, fileName, storageKey | mime type allowed, file size limit | access restricted by clinic scope and role |
| WaitlistEntry | patientId, requestedFor, status | valid requested date, priority in allowed list | duplicate waitlist entries should be prevented for the same slot |

## 8. Permission and Access Control
### 8.1 Permission Types
- CRUD permissions for core entities
- Workflow permissions for actions such as schedule_appointment, complete_encounter, issue_invoice
- Admin permissions for system configuration, audit access, and role management
- Scope permissions for clinic and location access

### 8.2 Example Permission Keys
- users.create
- clinics.manage
- locations.manage
- patients.read
- appointments.update
- encounters.create
- prescriptions.sign
- tests.update_results
- billing.payments.manage
- reports.generate
- audit.view
- attachments.upload
- notifications.send

### 8.3 Role Definitions
- Admin: full access to all modules, roles, permissions, audit history, and all clinic data
- Clinic Manager: manages schedules, users, operational reports, clinics, locations, and rooms within scope
- Doctor: accesses own appointments, patient encounters, prescriptions, and lab orders
- Receptionist: creates and updates patient records, schedules appointments, and handles patient documents within clinic scope
- Lab Technician: accesses assigned test orders, updates results, and attaches lab result documents
- Accountant: manages invoices and payments, views billing history, and financial reports

### 8.4 Scope Rules
- Users are limited to clinics and locations explicitly assigned to them
- Administrative users may switch scope when managing multiple clinics
- Documents, notifications, and audit records inherit clinic scope

### 8.5 Enforcement
- Check permissions at the API gateway and service layer
- Use role-based permission mapping for decision-making
- Evaluate contextual constraints such as clinic scope and doctor ownership
- Enforce ownership checks for patient documents, notifications, and audit access

### 8.6 Permission Matrix
| Role | Patient | Appointment | Encounter | Prescription | Billing | Audit |
|---|---|---|---|---|---|---|
| Admin | CRUD | CRUD | CRUD | CRUD | CRUD | VIEW/EXPORT |
| Clinic Manager | READ | CRUD | READ | READ | READ | VIEW |
| Doctor | READ | READ | CRUD | CREATE | READ | VIEW OWN |
| Receptionist | CRUD | CRUD | NONE | NONE | CREATE READ | NONE |
| Lab Tech | READ | NONE | NONE | NONE | NONE | NONE |
| Accountant | READ | NONE | NONE | NONE | CRUD | NONE |

| Permission Area | Admin | Clinic Manager | Doctor | Receptionist | Lab Tech | Accountant |
|---|---|---|---|---|---|---|
| Clinic / Location Management | CRUD | CRUD | READ | READ | NONE | NONE |
| Documents / Attachments | CRUD | READ | READ | CRUD | READ | READ |
| Notifications | CRUD | CRUD | READ | SEND | READ | READ |

## 9. Billing Scope
### 9.1 Billing Overview
- Generate, manage, and reconcile invoices for clinical services
- Capture payments and apply adjustments
- Support refunds, discounts, and billing status tracking
- Maintain accurate, auditable billing records

### 9.2 Billing Process Flow
#### Invoice Creation
- Create invoice after a consultation, test, or service
- Capture patient and appointment associations
- Add invoice items with description, quantity, unit price, and totals
- Calculate totals, taxes, and adjustments
- Save invoice in draft or issued state

#### Invoice Issuance
- Validate invoice totals and required fields
- Issue invoice to patient via portal, email, or print
- Change invoice status from draft to issued
- Store issuance metadata and delivery record

#### Payment Recording
- Record payments linked to invoices
- Support multiple payments against a single invoice
- Track payment method and reference
- Update invoice status to partially_paid or paid

#### Refunds and Adjustments
- Create refund transactions tied to invoices or payments
- Support negative invoice items for discounts or corrections
- Record reason and source for every adjustment
- Update balances and payment status

### 9.3 Billing Workflows
1. Create draft invoice for service
2. Review and validate services and amounts
3. Issue invoice to patient
4. Record payments and update balance
5. Close invoice when fully paid

### 9.4 Billing Validation
- Required fields: patientId, createdAt, totalAmount
- Invoice total must equal sum of invoice items minus discounts plus taxes
- Payment amount must be positive and cannot exceed outstanding balance
- Refund amount cannot exceed captured payment amount
- Due date must be on or after createdAt

### 9.5 Billing Access Control
- Billing roles should have view and edit permissions scoped to allowed clinics
- Restrict cancellation and refund creation to senior billing or admin roles
- Mask sensitive patient billing data in exports if necessary
- Log all billing actions in the audit trail

## 10. Reporting Scope
### 10.1 Reporting Goals
- Deliver operational visibility across appointments, patients, providers, and billing
- Provide financial insight into revenue, collections, and outstanding balances
- Enable audit and compliance reporting
- Support decision-making with scheduled and ad hoc analysis

### 10.2 Reporting Categories
#### Operational Reports
- Appointment utilization by provider, location, and time period
- Daily patient volume and visit status
- Provider workload and clinic capacity
- No-show and cancellation rates

#### Financial Reports
- Revenue summary by period, provider, and service category
- Collections and payment status trend
- Invoice aging and outstanding balances
- Refund and adjustment history

#### Patient Insights
- Patient demographics by age group, gender, and location
- New versus returning patient mix
- Visit frequency and encounter trends

#### Clinical Quality Reports
- Encounter completion and documentation timeliness
- Test order turnaround and completion rates
- Prescription issuance and review metrics

#### Audit and Compliance Reports
- Audit log activity summaries
- Role and permission changes
- Record access and export history

### 10.3 Reporting Data Elements
- Appointment metadata: status, date/time, provider, location, duration
- Patient metadata: demographics, registration date, visit count
- Encounter metadata: diagnoses, treatment status, completion date
- Billing metadata: invoice status, total amount, paid amount, balance
- Audit metadata: user, action, entity, timestamp, sourceIp

### 10.4 Report Definitions
#### Appointment Utilization
- Purpose: measure how effectively appointment capacity is used
- Key metrics: total appointments, confirmed rate, utilization percentage, average duration
- Filters: date range, provider, location, appointment status
- Output: table and summary metrics with trend lines

#### Revenue Summary
- Purpose: provide a revenue snapshot for a business period
- Key metrics: total revenue, paid amount, outstanding amount, average invoice value
- Filters: date range, provider, service type, location
- Output: summary table by dimension and total aggregates

#### Patient Demographics
- Purpose: describe the patient population
- Key metrics: patient counts by age group, gender, region, new versus returning
- Filters: registration date range, visit date range, location
- Output: demographic distribution tables and charts

#### Provider Productivity
- Purpose: track provider performance and capacity
- Key metrics: encounter count, appointment count, billed amount, cancellation rate
- Filters: provider, date range, service category
- Output: provider performance dashboard and ranked list

#### Audit Summary
- Purpose: monitor system behavior and compliance
- Key metrics: audit entries by action, user, entity type, and date
- Filters: date range, user, action type, entity type
- Output: detailed activity log with filtering and export

### 10.5 Delivery Modes
- On-demand generation in the application UI
- Scheduled report delivery via email
- Export formats: PDF, CSV, XLSX
- Dashboard widgets for key metrics
- API access for integration with analytics tools

### 10.6 Reporting Access Control
- Apply role-based controls to report availability
- Restrict clinical quality and audit reports to authorized roles
- Limit report exports when PHI exposure is a concern
- Track report generation and export actions in audit logs

### 10.7 Scheduling and Quality Assurance
- Schedule reports daily, weekly, monthly, or quarterly
- Configure recipient lists by role or email
- Notify stakeholders when reports are generated
- Allow cloning and modification of report schedules
- Validate report totals against source records
- Check filter requirements and boundary values
- Ensure date ranges and aggregations are applied correctly
- Log generation errors and notify administrators of issues

## 11. Audit and Validation
### 11.1 Audit Scope
- User activity tracking
- Sensitive data changes
- Role and permission updates
- Appointment and encounter modifications
- Billing and payment adjustments

### 11.2 Audit Data Model
- AuditLog: id, entityType, entityId, action, userId, timestamp, sourceIp, changes
- AuditSnapshot: id, auditLogId, beforeData, afterData

### 11.3 Audit Requirements
- Audit records must be immutable once written
- Record actor identity, timestamp, and source IP for all auditable events
- Capture before and after state for updates to sensitive entities
- Provide search and filtering by user, entity, action, and date
- Enable export of audit trails for compliance reviews

### 11.4 Audit Workflow
1. Capture audit metadata for every create, update, delete, and sensitive read action
2. Store audit entries immediately after the operation
3. Link audit entries to entity identifiers and user accounts
4. Allow authorized users to query and review audit history
5. Retain audit data according to configurable retention policies

### 11.5 Validation Principles
- Validate required fields at both UI and API layers
- Enforce field formats, ranges, and business rules
- Ensure referential integrity for linked entities
- Reject invalid state transitions and business rule violations

### 11.6 Validation Checklist
- User email format and uniqueness
- Patient demographics and date of birth rules
- Appointment times and doctor availability checks
- Encounter completeness and status transitions
- Prescription dosage and medication data validation
- Invoice amounts and payment balance checks

### 11.7 Validation Workflow
1. Define validation rules in the domain model and service layer
2. Apply validation before persisting data
3. Return informative error messages for invalid input
4. Log validation failures for troubleshooting
5. Use automated tests to cover key validation paths

### 11.8 Compliance Notes
- Keep audit logs for the period required by clinic policy
- Secure audit and validation logs from unauthorized access
- Regularly review audit records for unusual or suspicious activity
- Document validation requirements and update them as policies evolve

## 12. Wireframe Inventory
1. Dashboard with appointment highlights, provider utilization, billing snapshot, and alerts
2. Patient registration screen with demographics, emergency contact, and clinical summary sections
3. Appointment scheduling interface with provider availability, filters, and selected appointment details
4. Clinical encounter screen with symptoms, notes, prescriptions, and test orders
5. Billing invoice screen showing invoice header, line items, totals, and payment history
6. Reporting overview with filters, scheduled reports, exports, and summary widgets
7. Patient listing page with search, filters, table results, and quick actions
8. Appointment listing page with time range filters, status tabs, and appointments table
9. Invoice listing page with search, status categories, listing table, and summary cards
10. Report listing page with saved reports, scheduling UI, and run or export actions

## 13. Post-Action Workflow Suggestions
- After appointment booking: send SMS or email confirmation and auto-create follow-up task for pre-visit forms
- After encounter completion: trigger digital prescription delivery and schedule follow-up visit or teleconsultation
- After test result entry: notify ordering clinician and patient, and escalate critical results immediately
- After invoice generation: send payment link and add overdue reminder schedule
- After role changes: send notification to affected user and require re-login if permissions changed

## 14. Success Criteria
- Secure access and role-based permissions across all modules
- Smooth patient and appointment lifecycle
- Complete medical records with prescription and test tracking
- Accurate billing and payment reconciliation
- Actionable reporting for operations and finance
- Reliable audit trail with searchable history

## 15. Recommended Next Steps
1. Define core user personas and high-priority workflows
2. Build data schema for users, patients, appointments, encounters, billing, audit
3. Implement permissions and access control first
4. Develop appointment and patient management flows
5. Add clinical records, prescriptions, and test integrations
6. Layer billing and reporting
7. Validate audit logging on all sensitive operations