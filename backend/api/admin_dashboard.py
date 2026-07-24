from datetime import timedelta

from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.utils import timezone
from django.db.models import Sum

from .models import Sale, PurchaseVoucher


def get_profit_margin(sales, expenses):
    profit = sales - expenses

    if sales > 0:
        margin = round((profit / sales) * 100, 2)
    else:
        margin = 0

    return profit, margin


@staff_member_required
def business_dashboard(request):

    today = timezone.localdate()

    # ===============================
    # TODAY
    # ===============================

    today_sales = (
        Sale.objects.filter(created_at__date=today)
        .aggregate(total=Sum("total"))["total"] or 0
    )

    today_expenses = (
        PurchaseVoucher.objects.filter(purchase_date=today)
        .aggregate(total=Sum("grand_total"))["total"] or 0
    )

    today_profit, today_margin = get_profit_margin(
        today_sales,
        today_expenses
    )

    # ===============================
    # MONTH
    # ===============================

    month_sales = (
        Sale.objects.filter(
            created_at__year=today.year,
            created_at__month=today.month
        )
        .aggregate(total=Sum("total"))["total"] or 0
    )

    month_expenses = (
        PurchaseVoucher.objects.filter(
            purchase_date__year=today.year,
            purchase_date__month=today.month
        )
        .aggregate(total=Sum("grand_total"))["total"] or 0
    )

    month_profit, month_margin = get_profit_margin(
        month_sales,
        month_expenses
    )

    # ===============================
    # YEAR
    # ===============================

    year_sales = (
        Sale.objects.filter(
            created_at__year=today.year
        )
        .aggregate(total=Sum("total"))["total"] or 0
    )

    year_expenses = (
        PurchaseVoucher.objects.filter(
            purchase_date__year=today.year
        )
        .aggregate(total=Sum("grand_total"))["total"] or 0
    )

    year_profit, year_margin = get_profit_margin(
        year_sales,
        year_expenses
    )

    # ===============================
    # LAST 7 DAYS
    # ===============================

    labels = []
    sales_data = []
    expense_data = []
    profit_data = []

    for i in range(6, -1, -1):

        day = today - timedelta(days=i)

        labels.append(day.strftime("%a"))

        sales = (
            Sale.objects.filter(created_at__date=day)
            .aggregate(total=Sum("total"))["total"] or 0
        )

        expenses = (
            PurchaseVoucher.objects.filter(purchase_date=day)
            .aggregate(total=Sum("grand_total"))["total"] or 0
        )

        sales_data.append(float(sales))
        expense_data.append(float(expenses))
        profit_data.append(float(sales - expenses))

    context = {

        "title": "Business Dashboard",

        # TODAY
        "today_sales": today_sales,
        "today_expenses": today_expenses,
        "today_profit": today_profit,
        "today_margin": today_margin,

        # MONTH
        "month_sales": month_sales,
        "month_expenses": month_expenses,
        "month_profit": month_profit,
        "month_margin": month_margin,

        # YEAR
        "year_sales": year_sales,
        "year_expenses": year_expenses,
        "year_profit": year_profit,
        "year_margin": year_margin,

        # CHARTS
        "labels": labels,
        "sales_data": sales_data,
        "expense_data": expense_data,
        "profit_data": profit_data,
    }

    return render(
        request,
        "admin/business_dashboard.html",
        context,
    )