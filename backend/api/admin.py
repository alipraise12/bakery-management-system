from django.contrib import admin
from django.utils.html import format_html

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

    ordering = (
        "-created_at",
    )

    list_per_page = 20

    def photo(self, obj):

        if obj.picture:

            return format_html(

                '<img src="{}" width="45" height="45" '
                'style="border-radius:50%;" />',

                obj.picture.url

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

    search_fields = (
        "product_name",
    )

    list_filter = (
        "date",
    )

    ordering = (
        "-date",
        "-time",
    )

    readonly_fields = (
        "available",
    )

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

    list_filter = (
        "date",
    )

    ordering = (
        "-date",
    )

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

    search_fields = (
        "bread_type",
    )

    ordering = (
        "bread_type",
    )

    readonly_fields = (
        "updated_at",
    )

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

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

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

    search_fields = (
        "bread_type",
    )

    list_filter = (
        "confirmed",
        "bread_type",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

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

    search_fields = (
        "bread_type",
    )

    ordering = (
        "-created_at",
    )

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

    ordering = (
        "-created_at",
    )

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

    ordering = (
        "name",
    )

    readonly_fields = (
        "created_at",
    )

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

    search_fields = (
        "name",
    )

    ordering = (
        "name",
    )

    readonly_fields = (
        "created_at",
    )

    list_per_page = 25


# ==========================================================
# SALE
# ==========================================================

@admin.register(Sale)
class SaleAdmin(admin.ModelAdmin):

    list_display = (
        "invoice_number",
        "customer",
        "total",
        "paid",
        "balance",
        "cash",
        "transfer",
        "payment_method",
        "is_dispatched",
        "created_at",
    )

    search_fields = (
        "invoice_number",
        "customer__name",
        "customer__phone",
    )

    list_filter = (
        "payment_method",
        "is_dispatched",
        "created_at",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

    list_per_page = 30


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

    list_filter = (
        "created_at",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

    list_per_page = 40


# ==========================================================
# DEBT PAYMENT
# ==========================================================

@admin.register(DebtPayment)
class DebtPaymentAdmin(admin.ModelAdmin):

    list_display = (
        "sale",
        "customer_name",
        "invoice",
        "amount",
        "created_at",
    )

    search_fields = (
        "sale__invoice_number",
        "sale__customer__name",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

    list_per_page = 30

    def customer_name(self, obj):
        return obj.sale.customer.name

    customer_name.short_description = "Customer"

    def invoice(self, obj):
        return obj.sale.invoice_number

    invoice.short_description = "Invoice"


# ==========================================================
# SALES DISPATCH
# ==========================================================

@admin.register(SalesDispatch)
class SalesDispatchAdmin(admin.ModelAdmin):

    list_display = (
        "sale",
        "sale_item",
        "bread_type",
        "quantity",
        "confirmed",
        "receiver",
        "dispatched_by",
        "created_at",
    )

    search_fields = (
        "sale__invoice_number",
        "bread_type",
        "receiver",
    )

    list_filter = (
        "confirmed",
        "created_at",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

    list_per_page = 30


# ==========================================================
# DISPATCH STOCK
# ==========================================================

@admin.register(DispatchStock)
class DispatchStockAdmin(admin.ModelAdmin):

    list_display = (
        "bread_type",
        "quantity_received",
        "quantity_remaining",
        "confirmed",
        "created_at",
    )

    search_fields = (
        "bread_type",
    )

    list_filter = (
        "confirmed",
    )

    ordering = (
        "bread_type",
    )

    readonly_fields = (
        "created_at",
    )

    list_per_page = 25


# ==========================================================
# CUSTOMER DISPATCH
# ==========================================================

@admin.register(CustomerDispatch)
class CustomerDispatchAdmin(admin.ModelAdmin):

    list_display = (
        "invoice_number",
        "customer_name",
        "bread_type",
        "quantity_given",
        "receiver",
        "created_at",
    )

    search_fields = (
        "sale_item__sale__invoice_number",
        "sale_item__sale__customer__name",
        "bread_type",
        "receiver",
    )

    list_filter = (
        "created_at",
    )

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

    list_per_page = 30

    def invoice_number(self, obj):
        return obj.sale_item.sale.invoice_number

    invoice_number.short_description = "Invoice"

    def customer_name(self, obj):
        return obj.sale_item.sale.customer.name

    customer_name.short_description = "Customer"


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

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
    )

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

    ordering = (
        "dispatch",
    )

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

    ordering = (
        "-created_at",
    )

    readonly_fields = (
        "created_at",
        "cleared_at",
    )

    list_per_page = 30












































