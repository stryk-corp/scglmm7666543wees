import sys
import unittest
from datetime import datetime
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from firestore_dashboard import aggregate_activity, decode_firestore_value, transaction_kind


class DashboardAnalyticsTests(unittest.TestCase):
    def test_detects_paystack_topup_and_withdrawal(self):
        self.assertEqual(transaction_kind({"reference": "paystack-ref"}), "Top-up")
        self.assertEqual(transaction_kind({"type": "withdrawal"}), "Withdrawal")
        self.assertEqual(transaction_kind({"type": "top_up"}), "Top-up")

    def test_groups_transactions_and_reports_by_month(self):
        transactions = [
            {
                "data": {
                    "createdAt": datetime(2026, 4, 10, 12),
                    "amount": 1200,
                    "reference": "ref-1",
                }
            },
            {
                "data": {
                    "createdAt": datetime(2026, 4, 12, 12),
                    "amount": 300,
                    "type": "withdrawal",
                }
            },
            {
                "data": {
                    "createdAt": datetime(2026, 4, 14, 12),
                    "amount": 500,
                    "reference": "failed-ref",
                    "status": "failed",
                }
            },
        ]
        reports = [
            {"data": {"createdAt": datetime(2026, 4, 13, 12)}},
            {"data": {"createdAt": datetime(2026, 5, 1, 12)}},
        ]
        rows = aggregate_activity(transactions, reports, "Monthly")
        self.assertEqual(rows[0], {
            "period": "2026-04",
            "topups": 1200.0,
            "withdrawals": 300.0,
            "transactions": 3,
            "reports": 1,
        })
        self.assertEqual(rows[1]["period"], "2026-05")
        self.assertEqual(rows[1]["reports"], 1)

    def test_ignores_records_without_dates_in_period_analytics(self):
        rows = aggregate_activity(
            [{"data": {"amount": 100, "reference": "ref-without-date"}}],
            [{"data": {}}],
            "Daily",
        )
        self.assertEqual(rows, [])

    def test_decodes_firestore_values(self):
        decoded = decode_firestore_value({
            "mapValue": {
                "fields": {
                    "name": {"stringValue": "Ada"},
                    "count": {"integerValue": "3"},
                    "tags": {
                        "arrayValue": {
                            "values": [{"stringValue": "student"}],
                        }
                    },
                }
            }
        })
        self.assertEqual(decoded, {"name": "Ada", "count": 3, "tags": ["student"]})


if __name__ == "__main__":
    unittest.main()
