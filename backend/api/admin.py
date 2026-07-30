from django.contrib import admin
from django.utils.html import format_html
from django.db.models import Sum, Count
from django.utils import timezone
from datetime import timedelta
from .models import Supplier
from .models import ExpenseItem
from .models import OldExpense
from .models import PurchaseVoucher
from .models import PurchaseItem
from .models import Sale, DebtPayment
from django.db.models import (
    Sum,
    Count,
    Case,
    When,
    DecimalField,
    Value,
)
from django.db.models.functions import Coalesce
from .models import (
    Staff,
    Inventory,
    Attendance,
    ExpectedYield,
    ProductionSession,
    DailyProduction,
    YieldRecord,
    DispatchRecord,
    Customer,
    Product,
    Sale,
    SaleItem,
    DebtPayment,
    SalesDispatch,
    DispatchStock,
    CustomerDispatch,
    Dispatch,
    DispatchItem,
    CustomerBreadOwed,
)

# ==========================================================
# ADMIN SITE
# ==========================================================

admin.site.site_header = "Bakery Management System"

admin.site.site_title = " Bakery ERP"

admin.site.index_title = "Bakery Administration"


# ==========================================================
# STAFF
# ==========================================================


@admin.register(Staff)
class StaffAdmin(admin.ModelAdmin):

    list_display = (
        "photo",
        "first_name",
        "last_name",
        "position",
        "phone",
        "email",
        "is_verified",
        "is_admin",
        "created_at",
    )

    search_fields = (
        "first_name",
        "last_name",
        "phone",
        "email",
    )

    list_filter = (
        "position",
        "is_verified",
        "is_admin",
    )

    readonly_fields = (
        "qr_code",
        "qr_token",
        "created_at",
        "updated_at",
    )

    ordering = ("-created_at",)

    list_per_page = 20

    def photo(self, obj):

        if obj.picture:

            return format_html(
                '<img src="{}" width="45" height="45" ' 'style="border-radius:50%;" />',
                obj.picture.url,
            )

        return "No Photo"

    photo.short_description = "Photo"


# ==========================================================
# INVENTORY
# ==========================================================


@admin.register(Inventory)
class InventoryAdmin(admin.ModelAdmin):

    list_display = (
        "product_name",
        "stock_in",
        "stock_out",
        "available",
        "date",
        "time",
    )

    search_fields = ("product_name",)

    list_filter = ("date",)

    ordering = (
        "-date",
        "-time",
    )

    readonly_fields = ("available",)

    list_per_page = 25


# ==========================================================
# ATTENDANCE
# ==========================================================


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):

    list_display = (
        "staff",
        "date",
        "time_in",
        "time_out",
    )

    search_fields = (
        "staff__first_name",
        "staff__last_name",
    )

    list_filter = ("date",)

    ordering = ("-date",)

    list_per_page = 25


# ==========================================================
# EXPECTED YIELD
# ==========================================================


@admin.register(ExpectedYield)
class ExpectedYieldAdmin(admin.ModelAdmin):

    list_display = (
        "bread_type",
        "standard",
        "updated_by",
        "updated_at",
    )

    search_fields = ("bread_type",)

    ordering = ("bread_type",)

    readonly_fields = ("updated_at",)

    list_per_page = 20


# ==========================================================
# PRODUCTION SESSION
# ==========================================================


@admin.register(ProductionSession)
class ProductionSessionAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "created_at",
        "completed",
        "confirmed",
    )

    list_filter = (
        "completed",
        "confirmed",
    )

    ordering = ("-created_at",)

    readonly_fields = ("created_at",)

    list_per_page = 20


# ==========================================================
# DAILY PRODUCTION
# ==========================================================


@admin.register(DailyProduction)
class DailyProductionAdmin(admin.ModelAdmin):

    list_display = (
        "session",
        "bread_type",
        "bags",
        "expected",
        "actual_yield",
        "packaged",
        "difference",
        "dispatch_difference",
        "confirmed",
        "created_at",
    )

    search_fields = ("bread_type",)

    list_filter = (
        "confirmed",
        "bread_type",
    )

    ordering = ("-created_at",)

    readonly_fields = ("created_at",)

    list_per_page = 30


# ==========================================================
# YIELD RECORD
# ==========================================================


@admin.register(YieldRecord)
class YieldRecordAdmin(admin.ModelAdmin):

    list_display = (
        "bread_type",
        "bags",
        "expected",
        "actual",
        "difference",
        "recorded_by",
        "created_at",
    )

    search_fields = ("bread_type",)

    ordering = ("-created_at",)

    list_per_page = 30


# ==========================================================
# DISPATCH RECORD
# ==========================================================


@admin.register(DispatchRecord)
class DispatchRecordAdmin(admin.ModelAdmin):

    list_display = (
        "bread_type",
        "actual",
        "packaged",
        "difference",
        "receiver",
        "recorded_by",
        "created_at",
    )

    search_fields = (
        "bread_type",
        "receiver",
    )

    ordering = ("-created_at",)

    list_per_page = 30


# ==========================================================
# CUSTOMER
# ==========================================================


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "phone",
        "address",
        "created_at",
    )

    search_fields = (
        "name",
        "phone",
    )

    ordering = ("name",)

    readonly_fields = ("created_at",)

    list_per_page = 25


# ==========================================================
# PRODUCT
# ==========================================================


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "price",
        "quantity",
        "created_at",
    )

    search_fields = ("name",)

    ordering = ("name",)

    readonly_fields = ("created_at",)

    list_per_page = 25


# ==========================================================
# SALE
# ==========================================================

# @admin.register(Sale)
# class SaleAdmin(admin.ModelAdmin):

#     change_list_template = "admin/sale_change_list.html"

#     list_display = (
#         "invoice_number",
#         "customer",
#         "total",
#         "paid",
#         "balance",
#         "cash",
#         "transfer",
#         "payment_method",
#         "is_dispatched",
#         "created_at",
#     )

#     search_fields = (
#         "invoice_number",
#         "customer__name",
#         "customer__phone",
#     )

#     list_filter = (
#         "payment_method",
#         "is_dispatched",
#         "created_at",
#     )

#     ordering = (
#         "-created_at",
#     )

#     readonly_fields = (
#         "created_at",
#     )

#     list_per_page = 30

#     def changelist_view(self, request, extra_context=None):

#         extra_context = extra_context or {}

#         today = timezone.localdate()
#         current_year = today.year
#         current_month = today.month

#         # ==========================================
#         # TODAY
#         # ==========================================

#         today_sales = Sale.objects.filter(
#             created_at__date=today
#         )

#         today_summary = today_sales.aggregate(
#             revenue=Sum("total"),
#             paid=Sum("paid"),
#             balance=Sum("balance"),
#             cash=Sum("cash"),
#             transfer=Sum("transfer"),
#             invoices=Count("id"),
#         )

#         # ==========================================
#         # THIS MONTH
#         # ==========================================

#         month_sales = Sale.objects.filter(
#             created_at__year=current_year,
#             created_at__month=current_month,
#         )

#         month_summary = month_sales.aggregate(
#             revenue=Sum("total"),
#             paid=Sum("paid"),
#             balance=Sum("balance"),
#             cash=Sum("cash"),
#             transfer=Sum("transfer"),
#             invoices=Count("id"),
#         )

#         # ==========================================
#         # THIS YEAR
#         # ==========================================

#         year_sales = Sale.objects.filter(
#             created_at__year=current_year,
#         )

#         year_summary = year_sales.aggregate(
#             revenue=Sum("total"),
#             paid=Sum("paid"),
#             balance=Sum("balance"),
#             cash=Sum("cash"),
#             transfer=Sum("transfer"),
#             invoices=Count("id"),
#         )

#         # ==========================================
#         # DASHBOARD SUMMARY
#         # ==========================================

#         extra_context["today"] = {
#             "date": today,
#             "revenue": today_summary["revenue"] or 0,
#             "paid": today_summary["paid"] or 0,
#             "balance": today_summary["balance"] or 0,
#             "cash": today_summary["cash"] or 0,
#             "transfer": today_summary["transfer"] or 0,
#             "invoices": today_summary["invoices"] or 0,
#         }

#         extra_context["month"] = {
#             "revenue": month_summary["revenue"] or 0,
#             "paid": month_summary["paid"] or 0,
#             "balance": month_summary["balance"] or 0,
#             "cash": month_summary["cash"] or 0,
#             "transfer": month_summary["transfer"] or 0,
#             "invoices": month_summary["invoices"] or 0,
#         }

#         extra_context["year"] = {
#             "revenue": year_summary["revenue"] or 0,
#             "paid": year_summary["paid"] or 0,
#             "balance": year_summary["balance"] or 0,
#             "cash": year_summary["cash"] or 0,
#             "transfer": year_summary["transfer"] or 0,
#             "invoices": year_summary["invoices"] or 0,
#         }

#         # ==========================================
#         # DAILY SALES TREND (LAST 7 DAYS)
#         # ==========================================

#         labels = []
#         revenues = []

#         for i in range(6, -1, -1):

#             day = today - timedelta(days=i)

#             total = (
#                 Sale.objects.filter(
#                     created_at__date=day
#                 ).aggregate(
#                     total=Sum("total")
#                 )["total"] or 0
#             )

#             labels.append(day.strftime("%a"))
#             revenues.append(float(total))

#         extra_context["chart_labels"] = labels
#         extra_context["chart_revenue"] = revenues

#         # ==========================================
#         # MONTHLY REVENUE CHART
#         # ==========================================

#         month_labels = [
#             "Jan", "Feb", "Mar", "Apr",
#             "May", "Jun", "Jul", "Aug",
#             "Sep", "Oct", "Nov", "Dec"
#         ]

#         month_revenue = []

#         for month in range(1, 13):

#             total = (
#                 Sale.objects.filter(
#                     created_at__year=current_year,
#                     created_at__month=month,
#                 ).aggregate(
#                     total=Sum("total")
#                 )["total"] or 0
#             )

#             month_revenue.append(float(total))

#         extra_context["month_labels"] = month_labels
#         extra_context["month_revenue"] = month_revenue

#         return super().changelist_view(
#             request,
#             extra_context=extra_context,
#         )


@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):

    change_list_template = "admin/sale_change_list.html"

    list_display = (
        "invoice_number",
        "customer",
        "payment_method",
        "total",
        "paid",
        "balance",
        "created_at",
    )

    search_fields = (
        "invoice_number",
        "customer__name",
    )

    list_filter = (
        "payment_method",
        "created_at",
    )

    ordering = ("-created_at",)

    def changelist_view(self, request, extra_context=None):

        extra_context = extra_context or {}

        today = timezone.localdate()

        today_sales = Sale.objects.filter(created_at__date=today)

        today_debt = DebtPayment.objects.filter(created_at__date=today)

        today_total = today_sales.aggregate(
            total=Coalesce(
                Sum("paid"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        today_debt_total = today_debt.aggregate(
            total=Coalesce(
                Sum("amount"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        today_revenue = today_total

        today_cash = today_sales.aggregate(
            total=Coalesce(
                Sum("cash"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        today_cash += today_debt.filter(payment_method="Cash").aggregate(
            total=Coalesce(
                Sum("amount"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        today_transfer = today_sales.aggregate(
            total=Coalesce(
                Sum("transfer"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        today_transfer += today_debt.filter(payment_method="Transfer").aggregate(
            total=Coalesce(
                Sum("amount"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        today_balance = today_sales.aggregate(
            total=Coalesce(
                Sum("balance"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        today_invoices = today_sales.count()

        extra_context["today"]= (
            {
                "revenue": today_revenue,
                "paid": today_revenue,
                "cash": today_cash,
                "transfer": today_transfer,
                "balance": today_balance,
                "invoices": today_invoices,
            }
        )

        current_year = today.year
        current_month = today.month

        month_sales = Sale.objects.filter(
            created_at__year=current_year,
            created_at__month=current_month,
        )

        month_debt = DebtPayment.objects.filter(
            created_at__year=current_year,
            created_at__month=current_month,
        )

        month_total = month_sales.aggregate(
            total=Coalesce(
                Sum("paid"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        month_debt_total = month_debt.aggregate(
            total=Coalesce(
                Sum("amount"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        month_revenue = month_total 

        month_cash = month_sales.aggregate(
            total=Coalesce(
                Sum("cash"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        month_cash += month_debt.filter(payment_method="Cash").aggregate(
            total=Coalesce(
                Sum("amount"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        month_transfer = month_sales.aggregate(
            total=Coalesce(
                Sum("transfer"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        month_transfer += month_debt.filter(payment_method="Transfer").aggregate(
            total=Coalesce(
                Sum("amount"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        month_balance = month_sales.aggregate(
            total=Coalesce(
                Sum("balance"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        month_invoices = month_sales.count()

        extra_context["month"] =(
            {
                "revenue": month_revenue,
                "paid": month_revenue,
                "cash": month_cash,
                "transfer": month_transfer,
                "balance": month_balance,
                "invoices": month_invoices,
            }
        )

        year_sales = Sale.objects.filter(
            created_at__year=current_year,
        )

        year_debt = DebtPayment.objects.filter(
            created_at__year=current_year,
        )

        year_total = year_sales.aggregate(
            total=Coalesce(
                Sum("paid"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        year_debt_total = year_debt.aggregate(
            total=Coalesce(
                Sum("amount"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        year_revenue = year_total

        year_cash = year_sales.aggregate(
            total=Coalesce(
                Sum("cash"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        year_cash += year_debt.filter(payment_method="Cash").aggregate(
            total=Coalesce(
                Sum("amount"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        year_transfer = year_sales.aggregate(
            total=Coalesce(
                Sum("transfer"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        year_transfer += year_debt.filter(payment_method="Transfer").aggregate(
            total=Coalesce(
                Sum("amount"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        year_balance = year_sales.aggregate(
            total=Coalesce(
                Sum("balance"),
                Value(0),
                output_field=DecimalField(max_digits=12, decimal_places=2),
            )
        )["total"]

        year_invoices = year_sales.count()

        extra_context["year"] =(
            {
                "revenue": year_revenue,
                "paid": year_revenue,
                "cash": year_cash,
                "transfer": year_transfer,
                "balance": year_balance,
                "invoices": year_invoices,
            }
        )

        # ==========================================
        # DAILY REVENUE CHART (LAST 7 DAYS)
        # ==========================================

        chart_labels = []
        chart_revenue = []

        for i in range(6, -1, -1):

            day = today - timedelta(days=i)

            sales_total = Sale.objects.filter(created_at__date=day).aggregate(
                total=Coalesce(
                    Sum("paid"),
                    Value(0),
                    output_field=DecimalField(
                        max_digits=12,
                        decimal_places=2,
                    ),
                )
            )["total"]

            debt_total = DebtPayment.objects.filter(created_at__date=day).aggregate(
                total=Coalesce(
                    Sum("amount"),
                    Value(0),
                    output_field=DecimalField(
                        max_digits=12,
                        decimal_places=2,
                    ),
                )
            )["total"]

            chart_labels.append(day.strftime("%a"))
            chart_revenue.append(float(sales_total))

        extra_context["chart_labels"] = chart_labels
        extra_context["chart_revenue"] = chart_revenue

        # ==========================================
        # MONTHLY REVENUE CHART
        # ==========================================

        month_labels = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]

        month_revenue = []

        for month in range(1, 13):

            sales_total = Sale.objects.filter(
                created_at__year=current_year,
                created_at__month=month,
            ).aggregate(
                total=Coalesce(
                    Sum("paid"),
                    Value(0),
                    output_field=DecimalField(
                        max_digits=12,
                        decimal_places=2,
                    ),
                )
            )[
                "total"
            ]

            debt_total = DebtPayment.objects.filter(
                created_at__year=current_year,
                created_at__month=month,
            ).aggregate(
                total=Coalesce(
                    Sum("amount"),
                    Value(0),
                    output_field=DecimalField(
                        max_digits=12,
                        decimal_places=2,
                    ),
                )
            )[
                "total"
            ]

            month_revenue.append(float(sales_total))

        extra_context["month_labels"] = month_labels
        extra_context["month_revenue"] = month_revenue

        return super().changelist_view(
            request,
            extra_context=extra_context,
        )


# ==========================================================
# SALE ITEM
# ==========================================================


@admin.register(SaleItem)
class SaleItemAdmin(admin.ModelAdmin):

    list_display = (
        "sale",
        "product_name",
        "quantity",
        "price",
        "total",
        "created_at",
    )

    search_fields = (
        "sale__invoice_number",
        "product_name",
    )

    list_filter = ("created_at",)

    ordering = ("-created_at",)

    readonly_fields = ("created_at",)

    list_per_page = 40


# ==========================================================
# DEBT PAYMENT
# ==========================================================
from django.contrib import admin
from django.db.models import Sum


@admin.register(DebtPayment)
class DebtPaymentAdmin(admin.ModelAdmin):

    change_list_template = "admin/api/debtpayment/change_list.html"

    list_display = (
        "sale",
        "customer_name",
        "invoice",
        "payment_method",
        "amount",
        "created_at",
    )

    search_fields = (
        "sale__invoice_number",
        "sale__customer__name",
    )

    ordering = ("-created_at",)

    readonly_fields = ("created_at",)

    list_per_page = 30

    def customer_name(self, obj):
        return obj.sale.customer.name

    customer_name.short_description = "Customer"

    def invoice(self, obj):
        return obj.sale.invoice_number

    invoice.short_description = "Invoice"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("sale", "sale__customer")

    def changelist_view(self, request, extra_context=None):

        extra_context = extra_context or {}

        queryset = self.get_queryset(request)

        total_cash = (
            queryset.filter(payment_method="Cash").aggregate(total=Sum("amount"))[
                "total"
            ]
            or 0
        )

        total_transfer = (
            queryset.filter(payment_method="Transfer").aggregate(total=Sum("amount"))[
                "total"
            ]
            or 0
        )

        total_cash_transfer = (
            queryset.filter(payment_method="Cash/Transfer").aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )

        grand_total = queryset.aggregate(total=Sum("amount"))["total"] or 0

        transaction_count = queryset.count()

        extra_context["total_cash"] = total_cash
        extra_context["total_transfer"] = total_transfer
        extra_context["total_cash_transfer"] = total_cash_transfer
        extra_context["grand_total"] = grand_total
        extra_context["transaction_count"] = transaction_count

        return super().changelist_view(request, extra_context=extra_context)


# ==========================================================
# DISPATCH
# ==========================================================


@admin.register(Dispatch)
class DispatchAdmin(admin.ModelAdmin):

    list_display = (
        "invoice_number",
        "customer",
        "created_at",
    )

    search_fields = (
        "invoice_number",
        "customer__name",
    )

    ordering = ("-created_at",)

    readonly_fields = ("created_at",)

    list_per_page = 30


# ==========================================================
# DISPATCH ITEM
# ==========================================================


@admin.register(DispatchItem)
class DispatchItemAdmin(admin.ModelAdmin):

    list_display = (
        "dispatch",
        "bread_type",
        "quantity_bought",
        "quantity_given",
        "quantity_owed",
    )

    search_fields = (
        "dispatch__invoice_number",
        "bread_type",
    )

    ordering = ("dispatch",)

    list_per_page = 40


# ==========================================================
# CUSTOMER BREAD OWED
# ==========================================================


@admin.register(CustomerBreadOwed)
class CustomerBreadOwedAdmin(admin.ModelAdmin):

    list_display = (
        "customer",
        "invoice_number",
        "bread_type",
        "quantity",
        "status",
        "created_at",
        "cleared_at",
    )

    search_fields = (
        "customer__name",
        "invoice_number",
        "bread_type",
    )

    list_filter = (
        "status",
        "created_at",
    )

    ordering = ("-created_at",)

    readonly_fields = (
        "created_at",
        "cleared_at",
    )

    list_per_page = 30


@admin.register(Supplier)
class SupplierAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "contact_person",
        "phone",
        "city",
        "state",
        "is_active",
    )

    search_fields = (
        "name",
        "contact_person",
        "phone",
        "email",
    )

    list_filter = (
        "is_active",
        "state",
        "country",
    )

    ordering = ("name",)

    fieldsets = (
        (
            "Supplier Information",
            {
                "fields": (
                    "name",
                    "contact_person",
                )
            },
        ),
        (
            "Contact Details",
            {
                "fields": (
                    "phone",
                    "alternative_phone",
                    "email",
                    "website",
                )
            },
        ),
        (
            "Location",
            {
                "fields": (
                    "address",
                    "city",
                    "state",
                    "country",
                )
            },
        ),
        (
            "Other Information",
            {
                "fields": (
                    "notes",
                    "is_active",
                )
            },
        ),
    )


@admin.register(ExpenseItem)
class ExpenseItemAdmin(admin.ModelAdmin):

    list_display = (
        "name",
        "category",
        "is_active",
    )

    search_fields = ("name",)

    list_filter = (
        "category",
        "is_active",
    )

    ordering = (
        "category",
        "name",
    )


@admin.register(PurchaseVoucher)
class PurchaseVoucherAdmin(admin.ModelAdmin):

    change_list_template = "admin/purchasevoucher_change_list.html"

    list_display = (
        "voucher_number",
        "purchase_date",
        "grand_total",
        "created_by",
        "created_at",
    )

    search_fields = ("voucher_number",)

    list_filter = ("purchase_date",)

    ordering = ("-purchase_date",)

    readonly_fields = (
        "created_at",
        "updated_at",
    )

    list_per_page = 30

    def changelist_view(self, request, extra_context=None):

        extra_context = extra_context or {}

        today = timezone.localdate()
        current_year = today.year
        current_month = today.month

        # ==========================================================
        # TODAY
        # ==========================================================

        today_vouchers = PurchaseVoucher.objects.filter(purchase_date=today)

        today_items = PurchaseItem.objects.filter(voucher__purchase_date=today)

        today_summary = {
            "expenses": today_vouchers.aggregate(total=Sum("grand_total"))["total"]
            or 0,
            "cash": today_items.aggregate(total=Sum("cash_paid"))["total"] or 0,
            "transfer": today_items.aggregate(total=Sum("transfer_paid"))["total"] or 0,
            "vouchers": today_vouchers.count(),
        }

        # ==========================================================
        # THIS MONTH
        # ==========================================================

        month_vouchers = PurchaseVoucher.objects.filter(
            purchase_date__year=current_year,
            purchase_date__month=current_month,
        )

        month_items = PurchaseItem.objects.filter(
            voucher__purchase_date__year=current_year,
            voucher__purchase_date__month=current_month,
        )

        month_summary = {
            "expenses": month_vouchers.aggregate(total=Sum("grand_total"))["total"]
            or 0,
            "cash": month_items.aggregate(total=Sum("cash_paid"))["total"] or 0,
            "transfer": month_items.aggregate(total=Sum("transfer_paid"))["total"] or 0,
            "vouchers": month_vouchers.count(),
        }

        # ==========================================================
        # THIS YEAR
        # ==========================================================

        year_vouchers = PurchaseVoucher.objects.filter(
            purchase_date__year=current_year,
        )

        year_items = PurchaseItem.objects.filter(
            voucher__purchase_date__year=current_year,
        )

        year_summary = {
            "expenses": year_vouchers.aggregate(total=Sum("grand_total"))["total"] or 0,
            "cash": year_items.aggregate(total=Sum("cash_paid"))["total"] or 0,
            "transfer": year_items.aggregate(total=Sum("transfer_paid"))["total"] or 0,
            "vouchers": year_vouchers.count(),
        }

        # ==========================================================
        # SEND TO TEMPLATE
        # ==========================================================

        extra_context["today"] = today_summary
        extra_context["month"] = month_summary
        extra_context["year"] = year_summary

        # ==========================================================
        # DAILY EXPENSE TREND (LAST 7 DAYS)
        # ==========================================================

        labels = []
        expenses = []

        for i in range(6, -1, -1):

            day = today - timedelta(days=i)

            total = (
                PurchaseVoucher.objects.filter(purchase_date=day).aggregate(
                    total=Sum("grand_total")
                )["total"]
                or 0
            )

            labels.append(day.strftime("%a"))
            expenses.append(float(total))

        extra_context["chart_labels"] = labels
        extra_context["chart_expenses"] = expenses

        # ==========================================================
        # MONTHLY EXPENSE TREND
        # ==========================================================

        month_labels = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
        ]

        month_expenses = []

        for month in range(1, 13):

            total = (
                PurchaseVoucher.objects.filter(
                    purchase_date__year=current_year,
                    purchase_date__month=month,
                ).aggregate(total=Sum("grand_total"))["total"]
                or 0
            )

            month_expenses.append(float(total))

        extra_context["month_labels"] = month_labels
        extra_context["month_expenses"] = month_expenses

        return super().changelist_view(
            request,
            extra_context=extra_context,
        )


@admin.register(PurchaseItem)
class PurchaseItemAdmin(admin.ModelAdmin):

    list_display = (
        "voucher",
        "supplier",
        "expense_item",
        "cash_paid",
        "transfer_paid",
        "total",
        "discount",
        "net_total",
    )

    search_fields = (
        "voucher__voucher_number",
        "supplier__name",
        "expense_item__name",
    )

    list_filter = (
        "supplier",
        "expense_item",
    )


from django.contrib.admin import AdminSite
from django.template.response import TemplateResponse
from django.urls import path


class BakeryAdminSite(AdminSite):
    site_header = "Bakery ERP Administration"
    site_title = "Bakery ERP"
    index_title = "Welcome to Bakery ERP"

    def get_urls(self):
        urls = super().get_urls()

        custom_urls = [
            path(
                "business-dashboard/",
                self.admin_view(self.business_dashboard),
                name="business-dashboard",
            ),
        ]

        return custom_urls + urls

    def business_dashboard(self, request):

        context = {
            **self.each_context(request),
            "title": "Business Dashboard",
        }

        return TemplateResponse(
            request,
            "admin/business_dashboard.html",
            context,
        )


admin_site = BakeryAdminSite(name="bakery_admin")
