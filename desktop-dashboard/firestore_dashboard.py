from __future__ import annotations

import json
import os
import queue
import threading
import tkinter as tk
from collections import defaultdict
from datetime import date, datetime, timedelta
from pathlib import Path
from tkinter import messagebox, ttk
from typing import Any, Callable


PROJECT_ID = "scholarvee"
SITE_URL = "https://scholarverse.app"
FIREBASE_API_KEY = "AIzaSyAJzFQCl-G9bbmLbOiLd68oj743kBJUU64"
MAX_DOCS_PER_COLLECTION = 5000
POLL_INTERVAL_SECONDS = 60
REFRESH_WARNING = (
    f"Refreshes every {POLL_INTERVAL_SECONDS} seconds; each collection query is capped at "
    f"{MAX_DOCS_PER_COLLECTION:,} documents."
)
DATASETS = (
    "users",
    "transactions",
    "reports",
    "schoolEarnings",
    "generationDocuments",
    "generationJobs",
    "globalNotifications",
    "testimonials",
)


def settings_path() -> Path:
    appdata = os.environ.get("APPDATA")
    root = Path(appdata) if appdata else Path.home() / ".config"
    return root / "ScholarverseDashboard" / "settings.json"


def load_settings() -> dict[str, Any]:
    path = settings_path()
    try:
        return json.loads(path.read_text(encoding="utf-8")) if path.exists() else {}
    except (OSError, json.JSONDecodeError):
        return {}


def save_settings(settings: dict[str, Any]) -> None:
    path = settings_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(settings, indent=2), encoding="utf-8")


def as_datetime(value: Any) -> datetime | None:
    if isinstance(value, datetime):
        return value.replace(tzinfo=None) if value.tzinfo else value
    if isinstance(value, date):
        return datetime.combine(value, datetime.min.time())
    if isinstance(value, str):
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed.replace(tzinfo=None) if parsed.tzinfo else parsed
        except ValueError:
            return None
    return None


def format_datetime(value: Any) -> str:
    parsed = as_datetime(value)
    return parsed.strftime("%Y-%m-%d %H:%M") if parsed else "—"


def money(value: Any) -> str:
    try:
        return f"₦{float(value or 0):,.2f}"
    except (TypeError, ValueError):
        return "₦0.00"


def numeric_value(value: Any) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def transaction_kind(data: dict[str, Any]) -> str:
    explicit_type = str(data.get("type") or "").strip().lower()
    if explicit_type:
        normalized_type = explicit_type.replace("_", " ").replace("-", " ").strip()
        if "withdraw" in normalized_type:
            return "Withdrawal"
        if "top" in normalized_type or "deposit" in normalized_type:
            return "Top-up"
        return normalized_type.title()
    if data.get("university") or data.get("method") or data.get("reference"):
        return "Top-up"
    return "Transaction"


def decode_firestore_value(value: dict[str, Any]) -> Any:
    if "stringValue" in value:
        return value["stringValue"]
    if "integerValue" in value:
        return int(value["integerValue"])
    if "doubleValue" in value:
        return float(value["doubleValue"])
    if "booleanValue" in value:
        return value["booleanValue"]
    if "timestampValue" in value:
        return value["timestampValue"]
    if "nullValue" in value:
        return None
    if "mapValue" in value:
        return {
            key: decode_firestore_value(field_value)
            for key, field_value in value["mapValue"].get("fields", {}).items()
        }
    if "arrayValue" in value:
        return [
            decode_firestore_value(item)
            for item in value["arrayValue"].get("values", [])
        ]
    return None


def transaction_rows(documents: list[dict[str, Any]]) -> list[dict[str, Any]]:
    rows = []
    for item in documents:
        data = item["data"]
        rows.append({
            "date": format_datetime(data.get("createdAt")),
            "uid": item.get("ownerId", "—"),
            "kind": transaction_kind(data),
            "amount": money(data.get("amount")),
            "status": str(data.get("status") or "—"),
            "method": str(data.get("method") or data.get("channel") or "—"),
            "reference": str(data.get("reference") or data.get("paystackReference") or item["id"]),
        })
    return sorted(rows, key=lambda row: row["date"], reverse=True)


def bucket_label(value: datetime, period: str) -> str:
    if period == "Daily":
        return value.strftime("%Y-%m-%d")
    if period == "Weekly":
        monday = (value - timedelta(days=value.weekday())).date()
        return f"Week of {monday:%Y-%m-%d}"
    if period == "Monthly":
        return value.strftime("%Y-%m")
    return value.strftime("%Y")


def aggregate_activity(
    transactions: list[dict[str, Any]],
    reports: list[dict[str, Any]],
    period: str,
) -> list[dict[str, Any]]:
    totals: dict[str, dict[str, float | int]] = defaultdict(
        lambda: {"topups": 0.0, "withdrawals": 0.0, "transactions": 0, "reports": 0}
    )
    for item in transactions:
        data = item["data"]
        timestamp = as_datetime(data.get("createdAt"))
        if not timestamp:
            continue
        bucket = totals[bucket_label(timestamp, period)]
        bucket["transactions"] += 1
        if str(data.get("status") or "success").lower() not in {
            "success", "successful", "complete", "completed",
        }:
            continue
        try:
            amount = float(data.get("amount") or 0)
        except (TypeError, ValueError):
            amount = 0.0
        kind = transaction_kind(data).lower()
        if "withdraw" in kind:
            bucket["withdrawals"] += amount
        elif "top" in kind or data.get("university") or data.get("reference"):
            bucket["topups"] += amount

    for item in reports:
        timestamp = as_datetime(item["data"].get("createdAt"))
        if timestamp:
            totals[bucket_label(timestamp, period)]["reports"] += 1

    return [
        {"period": label, **values}
        for label, values in sorted(totals.items())
    ]


class FirebaseRestReader:
    """Reads Firestore through Firebase Auth and Security Rules; never writes."""

    def __init__(self, site_url: str, admin_path: str, password: str) -> None:
        import requests

        self._requests = requests
        self._site_url = site_url.rstrip("/")
        self._admin_path = admin_path
        self._password = password
        self._session = requests.Session()
        self._id_token: str | None = None
        self._refresh_token: str | None = None
        self._token_time = 0.0
        self._stop_event = threading.Event()
        self._definitions = (
            ("users", "users", False, [
                "fullName", "displayName", "email", "universityName", "departmentName",
                "balance", "referralBalance", "referralCount", "createdAt",
            ]),
            ("transactions", "transactions", True, [
                "amount", "type", "status", "createdAt", "reference",
                "paystackReference", "method", "channel", "university",
            ]),
            ("reports", "reports", True, [
                "reportTitle", "title", "documentType", "universityName",
                "departmentName", "createdAt", "expiresAt",
            ]),
            ("schoolEarnings", "schoolEarnings", False, [
                "universityName", "reportCount", "totalEarnings", "updatedAt",
            ]),
            ("generationDocuments", "generationDocuments", True, [
                "ownerId", "title", "documentType", "status", "createdAt", "updatedAt",
            ]),
            ("generationJobs", "generationJobs", True, [
                "slotId", "documentId", "moveId", "status", "attempts", "updatedAt",
            ]),
            ("globalNotifications", "globalNotifications", False, [
                "title", "body", "createdAt",
            ]),
            ("testimonials", "testimonials", False, [
                "authorName", "testimonialText", "university", "createdAt",
            ]),
        )

    def connect(self) -> None:
        response = self._session.post(
            f"{self._site_url}/api/desktop-dashboard/session",
            json={"adminPath": self._admin_path, "password": self._password},
            timeout=30,
        )
        self._password = ""
        response.raise_for_status()
        custom_token = response.json().get("customToken")
        if not custom_token:
            raise RuntimeError("The sign-in service did not return an admin session.")
        token_response = self._session.post(
            "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken",
            params={"key": FIREBASE_API_KEY},
            json={"token": custom_token, "returnSecureToken": True},
            timeout=30,
        )
        token_response.raise_for_status()
        tokens = token_response.json()
        self._id_token = tokens["idToken"]
        self._refresh_token = tokens["refreshToken"]
        self._token_time = datetime.now().timestamp()

    def _refresh_id_token(self) -> None:
        if datetime.now().timestamp() - self._token_time < 50 * 60:
            return
        if not self._refresh_token:
            raise RuntimeError("The admin session expired. Sign in again.")
        response = self._session.post(
            "https://securetoken.googleapis.com/v1/token",
            params={"key": FIREBASE_API_KEY},
            data={"grant_type": "refresh_token", "refresh_token": self._refresh_token},
            timeout=30,
        )
        response.raise_for_status()
        tokens = response.json()
        self._id_token = tokens["id_token"]
        self._refresh_token = tokens.get("refresh_token", self._refresh_token)
        self._token_time = datetime.now().timestamp()

    def _fetch_collection_group(
        self,
        collection_id: str,
        all_descendants: bool,
        fields: list[str],
    ) -> list[dict[str, Any]]:
        self._refresh_id_token()
        projection = [{"fieldPath": field} for field in fields]
        endpoint = (
            f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}"
            "/databases/(default)/documents:runQuery"
        )
        response = self._session.post(
            endpoint,
            headers={"Authorization": f"Bearer {self._id_token}"},
            json={
                "structuredQuery": {
                    "from": [{"collectionId": collection_id, "allDescendants": all_descendants}],
                    "select": {"fields": projection},
                    "limit": MAX_DOCS_PER_COLLECTION,
                }
            },
            timeout=60,
        )
        response.raise_for_status()

        documents = []
        for result in response.json():
            document = result.get("document")
            if not document:
                continue
            fields_data = document.get("fields", {})
            path = document["name"].split("/documents/", 1)[-1]
            path_parts = path.split("/")
            owner_id = path_parts[1] if path_parts[0] == "users" and len(path_parts) > 2 else None
            documents.append({
                "id": path_parts[-1],
                "path": path,
                "ownerId": owner_id,
                "data": {
                    key: decode_firestore_value(value)
                    for key, value in fields_data.items()
                },
            })
        return documents

    def watch(
        self,
        on_snapshot: Callable[[str, list[dict[str, Any]], bool], None],
        on_error: Callable[[str], None],
    ) -> None:
        while not self._stop_event.is_set():
            started_at = datetime.now().timestamp()
            for dataset, collection_id, all_descendants, fields in self._definitions:
                if self._stop_event.is_set():
                    break
                try:
                    documents = self._fetch_collection_group(
                        collection_id, all_descendants, fields
                    )
                    on_snapshot(
                        dataset,
                        documents,
                        len(documents) >= MAX_DOCS_PER_COLLECTION,
                    )
                except Exception as error:
                    on_error(f"{dataset}: {error}")
                    if "401" in str(error) or "403" in str(error):
                        self._stop_event.set()
                        break
            elapsed = datetime.now().timestamp() - started_at
            self._stop_event.wait(max(0, POLL_INTERVAL_SECONDS - elapsed))

    def stop(self) -> None:
        self._stop_event.set()


class SearchableTable(ttk.Frame):
    def __init__(
        self,
        master: tk.Misc,
        columns: list[tuple[str, str, int]],
        height: int = 18,
    ) -> None:
        super().__init__(master)
        self.columns = columns
        self.rows: list[dict[str, Any]] = []
        self.search_var = tk.StringVar()
        search = ttk.Entry(self, textvariable=self.search_var)
        search.pack(fill="x", padx=8, pady=(8, 4))
        search.insert(0, "Search...")
        search.bind("<FocusIn>", self._clear_placeholder)
        self.search_var.trace_add("write", lambda *_: self.render())

        tree_frame = ttk.Frame(self)
        tree_frame.pack(fill="both", expand=True, padx=8, pady=(4, 8))
        identifiers = [key for key, _label, _width in columns]
        self.tree = ttk.Treeview(
            tree_frame,
            columns=identifiers,
            show="headings",
            height=height,
            selectmode="browse",
        )
        scrollbar = ttk.Scrollbar(tree_frame, orient="vertical", command=self.tree.yview)
        horizontal = ttk.Scrollbar(tree_frame, orient="horizontal", command=self.tree.xview)
        self.tree.configure(yscrollcommand=scrollbar.set, xscrollcommand=horizontal.set)
        self.tree.grid(row=0, column=0, sticky="nsew")
        scrollbar.grid(row=0, column=1, sticky="ns")
        horizontal.grid(row=1, column=0, sticky="ew")
        tree_frame.rowconfigure(0, weight=1)
        tree_frame.columnconfigure(0, weight=1)

        for key, label, width in columns:
            self.tree.heading(key, text=label)
            self.tree.column(key, width=width, minwidth=70, anchor="w", stretch=True)

    def _clear_placeholder(self, _event: tk.Event) -> None:
        if self.search_var.get() == "Search...":
            self.search_var.set("")

    def set_rows(self, rows: list[dict[str, Any]]) -> None:
        self.rows = rows
        self.render()

    def render(self) -> None:
        query = self.search_var.get().strip().casefold()
        if query == "search...":
            query = ""
        self.tree.delete(*self.tree.get_children())
        for row in self.rows:
            values = [str(row.get(key, "—")) for key, _label, _width in self.columns]
            if not query or query in " ".join(values).casefold():
                self.tree.insert("", "end", values=values)


class Dashboard(tk.Tk):
    def __init__(self) -> None:
        super().__init__()
        self.title("Scholarverse — Read-only Firestore Dashboard")
        self.geometry("1380x850")
        self.minsize(1000, 650)
        self.protocol("WM_DELETE_WINDOW", self.close)

        self.datasets: dict[str, list[dict[str, Any]]] = {name: [] for name in DATASETS}
        self.capped: set[str] = set()
        self.reader: FirebaseRestReader | None = None
        self.message_queue: queue.Queue[tuple[str, Any]] = queue.Queue()
        self.settings = load_settings()
        self._build_header()
        self._build_tabs()
        self.after(150, self._drain_messages)

    def _build_header(self) -> None:
        header = ttk.Frame(self, padding=10)
        header.pack(fill="x")
        ttk.Label(header, text=f"Scholarverse · {PROJECT_ID}").grid(
            row=0, column=0, sticky="w", padx=(0, 14), pady=4
        )
        ttk.Label(header, text="Admin path").grid(row=0, column=1, sticky="e", padx=4)
        self.admin_path_var = tk.StringVar(value=self.settings.get("admin_path", ""))
        ttk.Entry(header, textvariable=self.admin_path_var, width=28).grid(
            row=0, column=2, sticky="ew", padx=4
        )
        ttk.Label(header, text="Admin password").grid(row=0, column=3, sticky="e", padx=4)
        self.password_var = tk.StringVar()
        ttk.Entry(header, textvariable=self.password_var, show="*", width=24).grid(
            row=0, column=4, sticky="ew", padx=4
        )
        self.connect_button = ttk.Button(header, text="Sign in and watch", command=self._connect)
        self.connect_button.grid(row=0, column=5, sticky="e", padx=(6, 0))
        header.columnconfigure(2, weight=1)
        self.status_var = tk.StringVar(value="Not connected")
        ttk.Label(self, textvariable=self.status_var, padding=(10, 0)).pack(fill="x")

    def _build_tabs(self) -> None:
        self.tabs = ttk.Notebook(self)
        self.tabs.pack(fill="both", expand=True, padx=8, pady=8)

        self.overview_tab = ttk.Frame(self.tabs)
        self.users_tab = ttk.Frame(self.tabs)
        self.transactions_tab = ttk.Frame(self.tabs)
        self.reports_tab = ttk.Frame(self.tabs)
        self.generation_tab = ttk.Frame(self.tabs)
        self.universities_tab = ttk.Frame(self.tabs)
        self.analytics_tab = ttk.Frame(self.tabs)
        self.activity_tab = ttk.Frame(self.tabs)
        for frame, title in (
            (self.overview_tab, "Overview"),
            (self.users_tab, "Users"),
            (self.transactions_tab, "Transactions & Top-ups"),
            (self.reports_tab, "Reports"),
            (self.generation_tab, "AI Generation"),
            (self.universities_tab, "Universities"),
            (self.analytics_tab, "Analytics"),
            (self.activity_tab, "Activity"),
        ):
            self.tabs.add(frame, text=title)

        self.metric_labels: dict[str, ttk.Label] = {}
        self._build_overview()
        self.users_table = SearchableTable(self.users_tab, [
            ("uid", "User ID", 190), ("name", "Name", 180), ("email", "Email", 220),
            ("university", "University", 220), ("department", "Department", 190),
            ("balance", "Wallet", 120), ("referralBalance", "Referral balance", 140),
            ("referrals", "Referrals", 90), ("joined", "Created", 150),
        ])
        self.users_table.pack(fill="both", expand=True)
        self.transactions_table = SearchableTable(self.transactions_tab, [
            ("date", "Date", 150), ("uid", "User ID", 190), ("kind", "Type", 120),
            ("amount", "Amount", 120), ("status", "Status", 100), ("method", "Method", 110),
            ("reference", "Reference", 220),
        ])
        self.transactions_table.pack(fill="both", expand=True)
        self.reports_table = SearchableTable(self.reports_tab, [
            ("created", "Created", 150), ("uid", "User ID", 190), ("title", "Title", 250),
            ("type", "Document type", 140), ("university", "University", 200),
            ("department", "Department", 180), ("expires", "Expires", 150),
        ])
        self.reports_table.pack(fill="both", expand=True)
        self.generation_table = SearchableTable(self.generation_tab, [
            ("updated", "Updated", 150), ("uid", "User ID", 180), ("title", "Document / slot", 240),
            ("type", "Type / status", 160), ("status", "Status", 160),
            ("attempts", "Attempts", 100), ("id", "ID", 220),
        ])
        self.generation_table.pack(fill="both", expand=True)
        self.universities_table = SearchableTable(self.universities_tab, [
            ("name", "University", 300), ("reports", "Reports", 120),
            ("earnings", "Report earnings", 160), ("updated", "Last updated", 170),
        ])
        self.universities_table.pack(fill="both", expand=True)
        self._build_analytics()
        self.activity_table = SearchableTable(self.activity_tab, [
            ("created", "Created", 160), ("category", "Category", 130),
            ("title", "Title / author", 240), ("detail", "Details", 480),
        ])
        self.activity_table.pack(fill="both", expand=True)

    def _build_overview(self) -> None:
        cards = ttk.Frame(self.overview_tab, padding=12)
        cards.pack(fill="x")
        for key, label in (
            ("users", "Users"),
            ("topups", "Top-up volume"),
            ("withdrawals", "Withdrawals"),
            ("reports", "Saved reports"),
            ("generation", "Generation jobs"),
            ("universities", "Universities"),
        ):
            card = ttk.LabelFrame(cards, text=label, padding=12)
            card.pack(side="left", fill="both", expand=True, padx=4)
            value = ttk.Label(card, text="—", font=("Segoe UI", 16, "bold"))
            value.pack(anchor="w")
            self.metric_labels[key] = value
        self.overview_note = tk.StringVar(
            value="Sign in with the existing admin path and password. Firestore security rules control dashboard access."
        )
        ttk.Label(
            self.overview_tab,
            textvariable=self.overview_note,
            padding=14,
            wraplength=1100,
            justify="left",
        ).pack(fill="x")
        self.recent_table = SearchableTable(self.overview_tab, [
            ("date", "Recent transaction", 160), ("uid", "User ID", 190),
            ("kind", "Type", 120), ("amount", "Amount", 130),
            ("status", "Status", 120), ("reference", "Reference", 280),
        ], height=12)
        self.recent_table.pack(fill="both", expand=True)

    def _build_analytics(self) -> None:
        controls = ttk.Frame(self.analytics_tab, padding=8)
        controls.pack(fill="x")
        ttk.Label(controls, text="Group activity by").pack(side="left")
        self.period_var = tk.StringVar(value="Monthly")
        period = ttk.Combobox(
            controls,
            textvariable=self.period_var,
            values=("Daily", "Weekly", "Monthly", "Yearly"),
            state="readonly",
            width=14,
        )
        period.pack(side="left", padx=8)
        period.bind("<<ComboboxSelected>>", lambda _event: self._render_analytics())
        self.chart = tk.Canvas(self.analytics_tab, height=230, background="white", highlightthickness=1)
        self.chart.pack(fill="x", padx=10, pady=4)
        self.analytics_table = SearchableTable(self.analytics_tab, [
            ("period", "Period", 220), ("reports", "Reports", 100),
            ("transactions", "Transactions", 130), ("topups", "Top-ups", 150),
            ("withdrawals", "Withdrawals", 150),
        ], height=12)
        self.analytics_table.pack(fill="both", expand=True)

    def _connect(self) -> None:
        site_url = SITE_URL
        admin_path = self.admin_path_var.get().strip().strip("/")
        password = self.password_var.get()
        if not admin_path or not password:
            messagebox.showerror("Sign-in required", "Enter the existing admin path and password.")
            return
        if self.reader:
            self.reader.stop()
        self.connect_button.configure(state="disabled")
        self.status_var.set("Signing in through Scholarverse...")
        self.settings["admin_path"] = admin_path
        try:
            save_settings(self.settings)
        except OSError as error:
            messagebox.showerror("Settings error", f"Could not save local settings: {error}")
            self.connect_button.configure(state="normal")
            return
        threading.Thread(
            target=self._start_reader,
            args=(site_url, admin_path, password),
            daemon=True,
        ).start()

    def _start_reader(self, site_url: str, admin_path: str, password: str) -> None:
        try:
            reader = FirebaseRestReader(site_url, admin_path, password)
            password = ""
            self.reader = reader
            reader.connect()
            self.message_queue.put(("connected", None))
            reader.watch(
                lambda name, docs, capped: self.message_queue.put(
                    ("snapshot", (name, docs, capped))
                ),
                lambda error: self.message_queue.put(("read_error", error)),
            )
        except Exception as error:
            if "reader" in locals():
                reader.stop()
            self.message_queue.put(("connect_error", str(error)))

    def _drain_messages(self) -> None:
        try:
            while True:
                event, payload = self.message_queue.get_nowait()
                if event == "snapshot":
                    name, docs, capped = payload
                    self.datasets[name] = docs
                    if capped:
                        self.capped.add(name)
                    else:
                        self.capped.discard(name)
                    self._render()
                    self.status_var.set(f"Live · last update {datetime.now():%Y-%m-%d %H:%M:%S}")
                elif event == "connected":
                    self.connect_button.configure(state="normal", text="Reconnect")
                    self.password_var.set("")
                    self.status_var.set("Signed in · loading Firestore data...")
                elif event == "connect_error":
                    self.connect_button.configure(state="normal")
                    self.status_var.set("Could not connect")
                    messagebox.showerror(
                        "Sign-in failed",
                        f"{payload}\n\nCheck the admin path, password, and deployed dashboard sign-in endpoint.",
                    )
                elif event == "read_error":
                    self.status_var.set(f"Firestore read error · {payload}")
                    if "401" in str(payload) or "403" in str(payload):
                        self.connect_button.configure(state="normal", text="Sign in and watch")
                        messagebox.showerror(
                            "Firestore access denied",
                            f"{payload}\n\nEnsure the latest Firestore rules are deployed and sign in again.",
                        )
        except queue.Empty:
            pass
        self.after(150, self._drain_messages)

    def _render(self) -> None:
        users = self.datasets["users"]
        transactions = self.datasets["transactions"]
        reports = self.datasets["reports"]
        jobs = self.datasets["generationJobs"]
        schools = self.datasets["schoolEarnings"]

        successful_transactions = [
            item for item in transactions
            if str(item["data"].get("status") or "success").lower()
            in {"success", "successful", "complete", "completed"}
        ]
        topups = sum(
            numeric_value(item["data"].get("amount"))
            for item in successful_transactions
            if transaction_kind(item["data"]).lower() == "top-up"
        )
        withdrawals = sum(
            numeric_value(item["data"].get("amount"))
            for item in successful_transactions
            if "withdraw" in transaction_kind(item["data"]).lower()
        )
        metrics = {
            "users": f"{len(users):,}",
            "topups": money(topups),
            "withdrawals": money(withdrawals),
            "reports": f"{len(reports):,}",
            "generation": f"{len(jobs):,}",
            "universities": f"{len(schools):,}",
        }
        for key, value in metrics.items():
            self.metric_labels[key].configure(text=value)
        watched_caps = sorted(self.capped)
        note = REFRESH_WARNING
        if watched_caps:
            note += " Reached the document limit in: " + ", ".join(watched_caps) + "."
        if not any(self.datasets.values()):
            note += " No documents are visible yet, or the initial snapshots are still loading."
        self.overview_note.set(note)

        user_rows = []
        for item in users:
            data = item["data"]
            user_rows.append({
                "uid": item["id"],
                "name": data.get("fullName") or data.get("displayName") or "—",
                "email": data.get("email") or "—",
                "university": data.get("universityName") or "—",
                "department": data.get("departmentName") or "—",
                "balance": money(data.get("balance")),
                "referralBalance": money(data.get("referralBalance")),
                "referrals": data.get("referralCount", 0),
                "joined": format_datetime(data.get("createdAt")),
            })
        self.users_table.set_rows(user_rows)

        tx_rows = transaction_rows(transactions)
        self.transactions_table.set_rows(tx_rows)
        self.recent_table.set_rows(tx_rows[:30])

        report_rows = []
        for item in reports:
            data = item["data"]
            report_rows.append({
                "created": format_datetime(data.get("createdAt")),
                "uid": item.get("ownerId") or "—",
                "title": data.get("reportTitle") or data.get("title") or item["id"],
                "type": data.get("documentType") or "—",
                "university": data.get("universityName") or "—",
                "department": data.get("departmentName") or "—",
                "expires": format_datetime(data.get("expiresAt")),
            })
        report_rows.sort(key=lambda row: row["created"], reverse=True)
        self.reports_table.set_rows(report_rows)

        generated_rows = []
        for item in self.datasets["generationDocuments"]:
            data = item["data"]
            generated_rows.append({
                "updated": format_datetime(data.get("updatedAt") or data.get("createdAt")),
                "uid": data.get("ownerId") or item.get("ownerId") or "—",
                "title": data.get("title") or item["id"],
                "type": data.get("documentType") or "Document",
                "status": data.get("status") or "—",
                "attempts": "—",
                "id": item["id"],
            })
        for item in jobs:
            data = item["data"]
            generated_rows.append({
                "updated": format_datetime(data.get("updatedAt")),
                "uid": item.get("ownerId") or "—",
                "title": data.get("slotId") or data.get("documentId") or "Generation job",
                "type": data.get("moveId") or "Job",
                "status": data.get("status") or "—",
                "attempts": data.get("attempts", "—"),
                "id": item["id"],
            })
        generated_rows.sort(key=lambda row: row["updated"], reverse=True)
        self.generation_table.set_rows(generated_rows)

        school_rows = []
        for item in schools:
            data = item["data"]
            school_rows.append({
                "name": data.get("universityName") or item["id"],
                "reports": data.get("reportCount", 0),
                "earnings": money(data.get("totalEarnings")),
                "updated": format_datetime(data.get("updatedAt")),
            })
        school_rows.sort(key=lambda row: numeric_value(row["reports"]), reverse=True)
        self.universities_table.set_rows(school_rows)
        self._render_activity()
        self._render_analytics()

    def _render_activity(self) -> None:
        rows = []
        for dataset in ("globalNotifications", "testimonials"):
            for item in self.datasets[dataset]:
                data = item["data"]
                rows.append({
                    "created": format_datetime(data.get("createdAt")),
                    "category": "Notification" if dataset == "globalNotifications" else "Testimonial",
                    "title": data.get("title") or data.get("authorName") or item["id"],
                    "detail": data.get("body") or data.get("testimonialText") or data.get("university") or "—",
                })
        rows.sort(key=lambda row: row["created"], reverse=True)
        self.activity_table.set_rows(rows)

    def _render_analytics(self) -> None:
        rows = aggregate_activity(
            self.datasets["transactions"],
            self.datasets["reports"],
            self.period_var.get(),
        )
        self.analytics_table.set_rows([
            {
                **row,
                "topups": money(row["topups"]),
                "withdrawals": money(row["withdrawals"]),
            }
            for row in reversed(rows)
        ])
        self._draw_chart(rows)

    def _draw_chart(self, rows: list[dict[str, Any]]) -> None:
        canvas = self.chart
        canvas.delete("all")
        width = max(canvas.winfo_width(), 500)
        height = max(canvas.winfo_height(), 200)
        canvas.create_text(14, 14, anchor="nw", text="Top-up volume by period (₦)", font=("Segoe UI", 10, "bold"))
        displayed = rows[-12:]
        if not displayed:
            canvas.create_text(width / 2, height / 2, text="No dated transaction data to chart.")
            return
        max_value = max(float(row["topups"]) for row in displayed) or 1.0
        chart_top, chart_bottom = 48, height - 34
        chart_left, chart_right = 50, width - 18
        canvas.create_line(chart_left, chart_bottom, chart_right, chart_bottom, fill="#7a7a7a")
        slot = (chart_right - chart_left) / len(displayed)
        for index, row in enumerate(displayed):
            value = float(row["topups"])
            bar_height = (chart_bottom - chart_top) * value / max_value
            x1 = chart_left + index * slot + slot * 0.16
            x2 = chart_left + (index + 1) * slot - slot * 0.16
            canvas.create_rectangle(x1, chart_bottom - bar_height, x2, chart_bottom, fill="#24845b", outline="")
            label = str(row["period"])
            if len(label) > 12:
                label = label[-12:]
            canvas.create_text((x1 + x2) / 2, chart_bottom + 12, text=label, font=("Segoe UI", 8))
            if value:
                canvas.create_text((x1 + x2) / 2, chart_bottom - bar_height - 10, text=f"{value:,.0f}", font=("Segoe UI", 8))

    def close(self) -> None:
        if self.reader:
            self.reader.stop()
        self.destroy()


def main() -> None:
    Dashboard().mainloop()


if __name__ == "__main__":
    main()
