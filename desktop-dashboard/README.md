# Scholarverse Firestore Dashboard

A Windows desktop dashboard for read-only monitoring of the Scholarverse Firestore database.
Open the app, enter the existing admin path and password, and sign in. No service-account JSON
file is needed. It watches users, top-ups and withdrawals, purchased reports, university earnings,
AI generation documents and jobs, global notifications, and testimonials. The dashboard has
searchable tables, summary cards, and daily, weekly, monthly, and yearly activity views.

## Sign-in and permissions

The app uses the public Firebase web configuration already used by Scholarverse, then signs in
through the deployed `/api/desktop-dashboard/session` endpoint using the existing admin path and
password. Firebase issues a short-lived `dashboardReader` session, and all database reads go
through Firestore Security Rules. This is not a full admin claim and the rules explicitly deny
dashboard-reader sessions all client writes. The password is not saved; only the admin path is
stored in `%APPDATA%\ScholarverseDashboard\settings.json`.

The session endpoint runs on the production server and requires Firebase Admin SDK credentials.
For Vercel, configure `FIREBASE_ADMIN_CLIENT_EMAIL` and `FIREBASE_ADMIN_PRIVATE_KEY` as encrypted
server environment variables for every deployed environment. Use the service account assigned to
the Scholarverse server, grant only the project-level permissions needed by the existing server
actions, and store the private key in Vercel's encrypted environment settings. Do not put these
values in the desktop app, source code, or a committed `.env` file. The Admin SDK uses these
variables when present and falls back to Application Default Credentials on Google-managed hosts.

Deploy both the Firestore rule changes in the repository's `firestore.rules` and the website API
route before using the dashboard. Enter the same admin path used in the existing admin login URL
(only the path segment, without slashes) and the existing admin password. Keep the app on a
trusted PC because it displays account and transaction information. It does not show bank details
or download report chapters.

The public client rule for `admin/config` has been removed; the existing admin login checks that
document through the trusted server-side Admin SDK. Since it was previously publicly readable,
rotate the admin password and secret path before deploying/using this sign-in flow.

## Build the Windows executable

Install Python 3.10 or later on Windows, then double-click `build_windows.bat` or run:

```powershell
cd desktop-dashboard
.\build_windows.bat
```

The executable is created at `dist\ScholarverseDashboard-ReadOnly.exe`. Open it, enter the admin
path and password, and choose **Sign in and watch**. The app connects to
`https://scholarverse.app` and project `scholarvee`.

## What is monitored

- **Overview:** user count, top-up and withdrawal totals, saved report count, generation job count,
  university count, and recent transactions.
- **Users:** user ID, name, email (if present in the Firestore profile), school, department, balances,
  referral count, and account creation date when recorded.
- **Transactions & Top-ups:** nested `users/{uid}/transactions` records. Records marked as withdrawals
  are separated from top-ups; records from Paystack top-ups are identified by their reference,
  university, or method fields.
- **Reports:** saved `users/{uid}/reports` documents.
- **AI Generation:** `generationDocuments` and `generationJobs` under users.
- **Universities:** report counts and earnings in `schoolEarnings`.
- **Analytics:** transaction volume and reports grouped by day, week, month, or year.
- **Activity:** global notifications and testimonials.

The app refreshes the Firestore views every 60 seconds and watches up to 5,000 documents per
collection/group. Reads are authorized by Firestore Security Rules, and each query selects only
the fields displayed by the dashboard. Refreshes can incur Firestore read charges; larger limits
or shorter intervals increase usage. Documents without a `createdAt` timestamp remain visible in
tables but cannot be placed in time-based analytics.

The app does not read Firebase Authentication's separate user directory or the private
`admin/config` document, and contains no Firestore write requests.
