
from django.urls import path

# =========================
# IMPORT VIEWS
# =========================
from .views import (

    # TEST
    hello,

    # AUTH
    register_staff,
    register_admin,
    login_staff,
    update_profile,

    # ATTENDANCE
    scan_qr,
    get_attendance,

    # INVENTORY
    save_inventory,
    get_inventory,

    # EXPECTED YIELDS
    ExpectedYieldListCreate,
    ExpectedYieldUpdate,

    # YIELD & DISPATCH
    YieldRecordListCreate,
    DispatchRecordListCreate,
    save_full_production,

    # DAILY PRODUCTION
    save_daily_production,
    latest_production,
    confirm_production,

    # PRODUCTS & CUSTOMERS
    get_products,
    get_customers,
    register_customer,
    get_customer_by_phone,

    # SALES
    create_sale,
    customer_history,
    customer_debt,

    # CUSTOMER LEDGER
    customer_sales,
    pay_debt,

    # DASHBOARD
    today_summary,


    dispatch_sales,
    confirm_dispatch,
    dispatch_history,


    pending_dispatches,
    dispatch_details,


    packaged_bread,
    confirm_packaged_bread,
    customer_order,
    give_bread,

    dispatch_summary,

    complete_day_dispatch,

    save_dispatch,
    customer_dispatch_list,
    customer_ledger,
    clear_customer,
    settle_customer_bread
)

# =========================
# URL PATTERNS
# =========================
urlpatterns = [

    # =========================
    # TEST
    # =========================
    path('hello/', hello),

    # =========================
    # AUTH
    # =========================
    path('staff/register/', register_staff),

    path('admin/register/', register_admin),

    path('login/', login_staff),

    path('profile/update/', update_profile),

    # =========================
    # ATTENDANCE
    # =========================
    path('scan/', scan_qr),

    path('attendance/', get_attendance),

    # =========================
    # INVENTORY
    # =========================
    path('inventory/', get_inventory),

    path('inventory/save/', save_inventory),

    # =========================
    # EXPECTED YIELDS
    # =========================
    path(
        'yields/',
        ExpectedYieldListCreate.as_view()
    ),

    path(
        'yields/<int:pk>/',
        ExpectedYieldUpdate.as_view()
    ),

    # =========================
    # YIELD RECORDS
    # =========================
    path(
        'yield-records/',
        YieldRecordListCreate.as_view()
    ),

    # =========================
    # DISPATCH
    # =========================
    path(
        'dispatch/',
        DispatchRecordListCreate.as_view()
    ),

    # =========================
    # FULL PRODUCTION
    # =========================
    path(
        'full-production/',
        save_full_production
    ),

    # =========================
    # DAILY PRODUCTION SYSTEM
    # =========================
    path(
        'daily-production/',
        save_daily_production
    ),

    path(
        'latest-production/',
        latest_production
    ),

    path(
        'confirm-production/',
        confirm_production
    ),

    # =========================
    # PRODUCTS
    # =========================
    path(
        'products/',
        get_products
    ),

    # =========================
    # CUSTOMERS
    # =========================
    path(
        'customers/',
        get_customers
    ),

    path(
        'customers/register/',
        register_customer
    ),

    path(
        'customers/search/',
        get_customer_by_phone
    ),

    path(
        'customers/<int:customer_id>/history/',
        customer_history
    ),

    path(
        'customers/<int:customer_id>/debt/',
        customer_debt
    ),

    # =========================
    # CUSTOMER LEDGER
    # =========================
    path(
    'customer-sales/<int:customer_id>/',
    customer_sales
   ),

    path(
    'pay-debt/<int:sale_id>/',
    pay_debt
  ),
    # =========================
    # SALES
    # =========================
    path(
        'sales/',
        create_sale
    ),

    # =========================
    # DASHBOARD
    # =========================
    path(
        'dashboard/today/',
        today_summary
    ),



    path(
    'packaged-bread/',
    packaged_bread
),

path(
    'confirm-packaged-bread/',
    confirm_packaged_bread
),

path(
    'customer-order/<int:sale_id>/',
    customer_order
),

path(
    'give-bread/',
    give_bread
),




    # =========================
# SALES DISPATCH
# =========================

path(
    'dispatch-sales/',
    dispatch_sales
),

path(
    'confirm-dispatch/',
    confirm_dispatch
),

path(
    'dispatch-history/',
    dispatch_history
),


path(
    'pending-dispatches/',
    pending_dispatches
),

path(
    'dispatch-details/<int:sale_id>/',
    dispatch_details
),


path(
    "dispatch-summary/",
    dispatch_summary
),


path(
    "complete-day-dispatch/",
    complete_day_dispatch,
),




# ====================================
# DISPATCH
# ====================================

path(
    "save-dispatch/",
    save_dispatch
),

# ====================================
# CUSTOMER LEDGER DROPDOWN
# ====================================

path(
    "customer-dispatch-list/",
    customer_dispatch_list
),

# ====================================
# CUSTOMER LEDGER DETAILS
# ====================================

path(
    "customer-ledger/<int:dispatch_id>/",
    customer_ledger
),

# ====================================
# CLEAR CUSTOMER
# ====================================

path(
    "clear-customer/",
    clear_customer
),



path(
    "settle-customer-bread/",
    settle_customer_bread
),

]



