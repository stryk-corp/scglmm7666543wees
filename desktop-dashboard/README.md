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

## Build the Android viewer

The Android client is a separate, read-only mobile dashboard with the same dark aurora palette.
It uses the same dashboard sign-in endpoint and Firestore Security Rules as the Windows client.
Passwords and Firebase session tokens are kept in memory only. The Android app does not write
Firestore data.

### Build with GitHub Actions

The recommended build does not require WSL or Android tooling on your PC:

1. Push the repository, including `desktop-dashboard/android/` and
   `.github/workflows/build-android-dashboard.yml`, to GitHub.
2. Open the repository's **Actions** tab and select **Build Android dashboard**.
3. Choose **Run workflow** and wait for the build to complete.
4. Open the successful run and download the
   `ScholarverseDashboard-Android-debug` artifact. Extract the APK from the downloaded ZIP.

The workflow builds on GitHub's Ubuntu runner and keeps the artifact for 14 days. It only runs
when manually triggered.

### Optional local WSL build

For a local build, install WSL with an Ubuntu distribution (for example, `wsl --install -d Ubuntu`),
then install Buildozer in a dedicated WSL virtual environment. Build prerequisites on Ubuntu include
Python development tools, Git, Java 17, `autoconf`, `libtool`, `pkg-config`, `zlib1g-dev`,
`libncurses-dev`, `libffi-dev`, and `libssl-dev`. For example:

```bash
sudo apt update
sudo apt install -y python3-venv python3-dev git zip unzip openjdk-17-jdk \
  autoconf libtool pkg-config zlib1g-dev libncurses-dev libffi-dev libssl-dev
python3 -m venv ~/.venvs/buildozer
~/.venvs/buildozer/bin/pip install --upgrade pip buildozer Cython
```

From Windows PowerShell, run:

```powershell
cd desktop-dashboard
python .\build_android.py
```

The launcher stages the Android project in the WSL home directory, runs `buildozer android debug`,
and copies the result to `dist\ScholarverseDashboard-Android-debug.apk`. The first build downloads
the Android SDK/NDK and can take several minutes. Install the APK on an Android device to view the
dashboard; it refreshes every 60 seconds and each collection query is capped at 5,000 documents.
If WSL reports an installation or MSI error (for example `Wsl/CallMsi/Install/0x80070641`), finish
repairing/updating WSL first, then rerun the launcher. The launcher checks WSL without accepting
the interactive repair prompt.

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
