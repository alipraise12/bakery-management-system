import uuid
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import check_password
from .models import Staff, Inventory, Attendance   # ✅ ADDED Attendance
from .serializers import StaffSerializer
from datetime import date, timedelta
from django.utils import timezone
from rest_framework import generics
from .models import ExpectedYield
from .serializers import ExpectedYieldSerializer
from .models import YieldRecord, DispatchRecord
from .serializers import YieldRecordSerializer, DispatchRecordSerializer
from .models import Product, Customer
from .models import Sale
from .models import SaleItem
from .models import DailyProduction
from .serializers import DailyProductionSerializer
from .models import Sale, DebtPayment
from django.shortcuts import get_object_or_404
from .models import SalesDispatch
from .models import DispatchStock
from .models import CustomerDispatch

from .google_sheet import (
    save_sale_to_sheet,
    save_dispatch_to_sheet,
    save_inventory_to_sheet,
    save_customer_to_sheet,
    save_attendance_to_sheet


)

from django.utils import timezone

from .models import (
    Dispatch,
    DispatchItem,
    CustomerBreadOwed,
    Customer
)

from .serializers import (
    DispatchSerializer,
    CustomerBreadOwedSerializer
)


# ✅ TEST ENDPOINT
@api_view(['GET'])
def hello(request):
    return Response({
        "success": True,
        "message": "Hello from Django Backend"
    })


# ✅ REGISTER STAFF
@api_view(['POST'])
def register_staff(request):
    print("📥 Incoming Data (STAFF):", request.data)

    serializer = StaffSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()

        return Response({
            "success": True,
            "message": "Staff Registered Successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    print("❌ VALIDATION ERROR:", serializer.errors)

    return Response({
        "success": False,
        "message": "Registration failed",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ✅ REGISTER ADMIN
@api_view(['POST'])
def register_admin(request):
    print("📥 Incoming Data (ADMIN):", request.data)

    data = request.data.copy()
    data['is_admin'] = True  # 🔥 force admin

    serializer = StaffSerializer(data=data)

    if serializer.is_valid():
        serializer.save()

        return Response({
            "success": True,
            "message": "Admin Registered Successfully",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)

    print("❌ ADMIN VALIDATION ERROR:", serializer.errors)

    return Response({
        "success": False,
        "message": "Admin registration failed",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


# ✅ LOGIN STAFF / ADMIN
@api_view(['POST'])
def login_staff(request):
    print("📥 LOGIN DATA:", request.data)

    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({
            "success": False,
            "message": "Email and password are required"
        }, status=status.HTTP_400_BAD_REQUEST)

    staff = Staff.objects.filter(email=email).first()

    if not staff:
        return Response({
            "success": False,
            "message": "User not found"
        }, status=status.HTTP_404_NOT_FOUND)

    if not check_password(password, staff.password):
        return Response({
            "success": False,
            "message": "Invalid credentials"
        }, status=status.HTTP_400_BAD_REQUEST)

    token = str(uuid.uuid4())

    return Response({
        "success": True,
        "message": "Login successful",
        "token": token,
        "staff": {
            "id": staff.id,
            "first_name": staff.first_name,
            "last_name": staff.last_name,
            "email": staff.email,
            "phone": staff.phone,
            "picture": staff.picture.url if staff.picture else None,
            "qr_code": staff.qr_code.url if staff.qr_code else None,  # ✅ ADDED
            "is_admin": staff.is_admin,
            "position": staff.position
        }
    }, status=status.HTTP_200_OK)


# ✅ UPDATE PROFILE
@api_view(['POST'])
def update_profile(request):
    email = request.data.get("email")

    staff = Staff.objects.filter(email=email).first()

    if not staff:
        return Response({
            "success": False,
            "message": "User not found"
        }, status=404)

    staff.first_name = request.data.get("first_name", staff.first_name)
    staff.last_name = request.data.get("last_name", staff.last_name)
    staff.phone = request.data.get("phone", staff.phone)

    if request.FILES.get("picture"):
        staff.picture = request.FILES.get("picture")

    staff.save()

    return Response({
        "success": True,
        "message": "Profile updated successfully",
        "data": {
            "first_name": staff.first_name,
            "last_name": staff.last_name,
            "phone": staff.phone,
            "email": staff.email,
            "position": staff.position,
            "picture": staff.picture.url if staff.picture else None
        }
    })


# =========================
# ✅ QR SCAN ATTENDANCE
# =========================
# @api_view(['POST'])
# def scan_qr(request):
#     token = request.data.get("token")

#     if not token:
#         return Response({"error": "No QR token provided"}, status=400)

#     try:
#         staff = Staff.objects.get(qr_token=token)

#         today = timezone.now().date()
#         now_time = timezone.now().time()

#         attendance, created = Attendance.objects.get_or_create(
#             staff=staff,
#             date=today
#         )

#         # ✅ FIRST SCAN → TIME IN
#         if not attendance.time_in:
#             attendance.time_in = now_time
#             attendance.save()

#             return Response({
#                 "name": f"{staff.first_name} {staff.last_name}",
#                 "phone": staff.phone,
#                 "time_in": attendance.time_in,
#                 "status": "Time In"
#             })

#         # ✅ SECOND SCAN → TIME OUT
#         elif not attendance.time_out:
#             attendance.time_out = now_time
#             attendance.save()

#             return Response({
#                 "name": f"{staff.first_name} {staff.last_name}",
#                 "phone": staff.phone,
#                 "time_out": attendance.time_out,
#                 "status": "Time Out"
#             })

#         # ❌ THIRD SCAN BLOCKED
#         else:
#             return Response({
#                 "error": "Already checked in and out today"
#             }, status=400)

#     except Staff.DoesNotExist:
#         return Response({"error": "Invalid QR Code"}, status=404)


# =========================
# ✅ QR SCAN ATTENDANCE
# =========================

@api_view(['POST'])
def scan_qr(request):

    token = request.data.get("token")

    if not token:

        return Response({

            "error":
            "No QR token provided"

        }, status=400)

    try:

        staff = Staff.objects.get(
            qr_token=token
        )

        today = timezone.now().date()

        now_time = timezone.now().time()

        attendance, created = (
            Attendance.objects.get_or_create(

                staff=staff,

                date=today
            )
        )

        # =========================
        # FIRST SCAN → TIME IN
        # =========================

        if not attendance.time_in:

            attendance.time_in = now_time

            attendance.save()

            # =========================
            # SAVE TO GOOGLE SHEET
            # =========================

            save_attendance_to_sheet(

                staff_name=
                    f"{staff.first_name} {staff.last_name}",

                phone=
                    staff.phone,

                time_in=
                    attendance.time_in,

                time_out=""
            )

            return Response({

                "name":
                    f"{staff.first_name} {staff.last_name}",

                "phone":
                    staff.phone,

                "time_in":
                    attendance.time_in,

                "status":
                    "Time In"
            })

        # =========================
        # SECOND SCAN → TIME OUT
        # =========================

        elif not attendance.time_out:

            attendance.time_out = now_time

            attendance.save()

            # =========================
            # SAVE TO GOOGLE SHEET
            # =========================

            save_attendance_to_sheet(

                staff_name=
                    f"{staff.first_name} {staff.last_name}",

                phone=
                    staff.phone,

                time_in=
                    attendance.time_in,

                time_out=
                    attendance.time_out
            )

            return Response({

                "name":
                    f"{staff.first_name} {staff.last_name}",

                "phone":
                    staff.phone,

                "time_out":
                    attendance.time_out,

                "status":
                    "Time Out"
            })

        # =========================
        # THIRD SCAN BLOCKED
        # =========================

        else:

            return Response({

                "error":
                    "Already checked in and out today"

            }, status=400)

    except Staff.DoesNotExist:

        return Response({

            "error":
                "Invalid QR Code"

        }, status=404)


# =========================
# ✅ GET ATTENDANCE LIST
# =========================
@api_view(['GET'])
def get_attendance(request):
    today = timezone.now().date()

    records = Attendance.objects.filter(date=today)

    result = []

    for r in records:
        result.append({
            "name": f"{r.staff.first_name} {r.staff.last_name}",
            "phone": r.staff.phone,
            "time_in": r.time_in,
            "time_out": r.time_out,
        })

    return Response(result)


# =========================
# INVENTORY (UNCHANGED)
# =========================

def get_previous_closing(product, date):
    previous = Inventory.objects.filter(
        product_name=product,
        date__lt=date
    ).order_by('-date').first()

    return previous.closing_stock if previous else 0


# @api_view(['POST'])
# def save_inventory(request):
#     data = request.data

#     from datetime import datetime
#     date = datetime.strptime(data.get('date'), "%Y-%m-%d").date()

#     for row in data.get('rows'):
#         Inventory.objects.create(
#             product_name=row['product'],
#             stock_in=int(row['stockIn'] or 0),
#             stock_out=int(row['stockOut'] or 0),
#             date=date
#         )

#     return Response({"message": "Saved successfully"})


@api_view(['POST'])
def save_inventory(request):

    data = request.data

    from datetime import datetime

    date = datetime.strptime(
        data.get('date'),
        "%Y-%m-%d"
    ).date()

    for row in data.get('rows'):

        # =========================
        # SAVE TO DATABASE
        # =========================

        inventory = Inventory.objects.create(

            product_name=row['product'],

            stock_in=int(
                row['stockIn'] or 0
            ),

            stock_out=int(
                row['stockOut'] or 0
            ),

            date=date
        )

        # =========================
        # SAVE TO GOOGLE SHEET
        # =========================

        save_inventory_to_sheet(

            product=inventory.product_name,

            stock_in=inventory.stock_in,

            stock_out=inventory.stock_out
        )

    return Response({

        "success": True,

        "message":
            "Inventory saved successfully"
    })


@api_view(['GET'])
def get_inventory(request):
    data = Inventory.objects.all().order_by('-date', 'product_name')

    result = []

    for item in data:
        result.append({
            "product": item.product_name,
            "stockIn": item.stock_in,
            "stockOut": item.stock_out,
            "available": item.available,
            "date": item.date,
        })

    return Response(result)


class ExpectedYieldListCreate(generics.ListCreateAPIView):
    queryset = ExpectedYield.objects.all()
    serializer_class = ExpectedYieldSerializer

class ExpectedYieldUpdate(generics.RetrieveUpdateAPIView):
    queryset = ExpectedYield.objects.all()
    serializer_class = ExpectedYieldSerializer



    # =========================
# YIELD RECORD API
# =========================
class YieldRecordListCreate(generics.ListCreateAPIView):
    queryset = YieldRecord.objects.all().order_by('-created_at')
    serializer_class = YieldRecordSerializer


# =========================
# DISPATCH RECORD API
# =========================
class DispatchRecordListCreate(generics.ListCreateAPIView):
    queryset = DispatchRecord.objects.all().order_by('-created_at')
    serializer_class = DispatchRecordSerializer



@api_view(['POST'])
def save_full_production(request):
    data = request.data

    for item in data:
        YieldRecord.objects.create(
            bread_type=item['bread_type'],
            bags=item['bags'],
            expected=item['expected'],
            actual=item['actual'],
            difference=item['difference']
        )

        DispatchRecord.objects.create(
            bread_type=item['bread_type'],
            actual=item['actual'],
            packaged=item['packaged'],
            difference=item['dispatch_diff'],
            receiver="System"
        )

    return Response({"message": "Saved"})

@api_view(['GET'])
def get_customers(request):
    customers = Customer.objects.all()
    return Response([
        {
            "id": c.id,
            "name": c.name,
            "phone": c.phone   # ✅ MUST BE HERE
        }
        for c in customers
    ])

@api_view(['GET'])
def get_products(request):
    products = Product.objects.all()
    return Response([
        {"id": p.id, "name": p.name, "price": p.price}
        for p in products
    ])



# @api_view(['POST'])
# def register_customer(request):
#     name = request.data.get("name")
#     phone = request.data.get("phone")

#     if not name or not phone:
#         return Response({"error": "Name and phone required"}, status=400)

#     if Customer.objects.filter(phone=phone).exists():
#         return Response({"error": "Customer already exists"}, status=400)

#     customer = Customer.objects.create(name=name, phone=phone)

#     return Response({
#         "id": customer.id,
#         "name": customer.name,
#         "phone": customer.phone
#     })

@api_view(['POST'])
def register_customer(request):

    name = request.data.get("name")

    phone = request.data.get("phone")

    if not name or not phone:

        return Response({

            "error":
            "Name and phone required"

        }, status=400)

    if Customer.objects.filter(
        phone=phone
    ).exists():

        return Response({

            "error":
            "Customer already exists"

        }, status=400)

    # =========================
    # SAVE CUSTOMER
    # =========================

    customer = Customer.objects.create(

        name=name,

        phone=phone
    )

    # =========================
    # SAVE TO GOOGLE SHEET
    # =========================

    save_customer_to_sheet(

        customer_name=customer.name,

        phone_number=customer.phone
    )

    # =========================
    # RESPONSE
    # =========================

    return Response({

        "id":
            customer.id,

        "name":
            customer.name,

        "phone":
            customer.phone
    })



@api_view(['GET'])
def get_customer_by_phone(request):
    phone = request.GET.get("phone")

    if not phone:
        return Response({"error": "Phone is required"}, status=400)

    customer = Customer.objects.filter(phone=phone).first()

    if not customer:
        return Response({"error": "Customer not found"}, status=404)

    return Response({
        "id": customer.id,
        "name": customer.name,
        "phone": customer.phone
    })





from datetime import datetime


# @api_view(['POST'])
# def create_sale(request):

#     data = request.data

#     customer_id = data.get("customer_id")

#     rows = data.get("rows", [])

#     # =========================
#     # VALIDATE CUSTOMER
#     # =========================

#     if not customer_id:

#         return Response(
#             {"error": "Customer required"},
#             status=400
#         )

#     customer = get_object_or_404(
#         Customer,
#         id=customer_id
#     )

#     # =========================
#     # GENERATE INVOICE NUMBER
#     # =========================

#     current_year = datetime.now().year

#     last_sale = Sale.objects.filter(
#         invoice_number__startswith=f"INV-{current_year}-"
#     ).order_by("-id").first()

#     if last_sale:

#         try:

#             last_number = int(
#                 last_sale.invoice_number.split("-")[-1]
#             )

#         except:

#             last_number = 0

#     else:

#         last_number = 0

#     new_number = last_number + 1

#     invoice_number = (
#         f"INV-{current_year}-{new_number:04d}"
#     )

#     # =========================
#     # CREATE SALE
#     # =========================

#     sale = Sale.objects.create(

#         invoice_number=invoice_number,

#         customer=customer,

#         total=data.get("total", 0),

#         paid=data.get("paid", 0),

#         balance=data.get("balance", 0),

#         cash=data.get("cash", 0),

#         transfer=data.get(
#             "transfer",
#             0
#         ),

#         payment_method=data.get(
#             "payment_method"
#         )
#     )

#     # =========================
#     # SAVE SALE ITEMS
#     # =========================

#     for row in rows:

#         product = get_object_or_404(
#             Product,
#             id=row["productId"]
#         )

#         quantity = int(
#             row.get("quantity", 0)
#         )

#         total = (
#             float(product.price)
#             * quantity
#         )

#         SaleItem.objects.create(

#             sale=sale,

#             product=product,

#             product_name=product.name,

#             quantity=quantity,

#             price=product.price,

#             total=total
#         )

#         # =========================
#         # REDUCE PRODUCT STOCK
#         # =========================

#         product.quantity -= quantity

#         product.save()

#     # =========================
#     # RESPONSE
#     # =========================

#     return Response({

#         "success": True,

#         "message": "Sale saved successfully",

#         "invoice_number": invoice_number,

#         "sale_id": sale.id
#     })

@api_view(['POST'])
def create_sale(request):

    data = request.data

    customer_id = data.get("customer_id")

    rows = data.get("rows", [])

    # =========================
    # VALIDATE CUSTOMER
    # =========================

    if not customer_id:

        return Response(
            {"error": "Customer required"},
            status=400
        )

    customer = get_object_or_404(
        Customer,
        id=customer_id
    )

    # =========================
    # GENERATE INVOICE NUMBER
    # =========================

    current_year = datetime.now().year

    last_sale = Sale.objects.filter(
        invoice_number__startswith=f"INV-{current_year}-"
    ).order_by("-id").first()

    if last_sale:

        try:

            last_number = int(
                last_sale.invoice_number.split("-")[-1]
            )

        except:

            last_number = 0

    else:

        last_number = 0

    new_number = last_number + 1

    invoice_number = (
        f"INV-{current_year}-{new_number:04d}"
    )

    # =========================
    # CREATE SALE
    # =========================

    sale = Sale.objects.create(

        invoice_number=invoice_number,

        customer=customer,

        total=data.get("total", 0),

        paid=data.get("paid", 0),

        balance=data.get("balance", 0),

        cash=data.get("cash", 0),

        transfer=data.get(
            "transfer",
            0
        ),

        payment_method=data.get(
            "payment_method"
        )
    )

    # =========================
    # SAVE SALE ITEMS
    # =========================

    for row in rows:

        product = get_object_or_404(
            Product,
            id=row["productId"]
        )

        quantity = int(
            row.get("quantity", 0)
        )

        # =========================
        # USE FRONTEND EDITED PRICE
        # =========================

        price = float(
            row.get(
                "price",
                product.price
            )
        )

        total = (
            price * quantity
        )

        # =========================
        # CREATE SALE ITEM
        # =========================

        SaleItem.objects.create(

            sale=sale,

            product=product,

            product_name=product.name,

            quantity=quantity,

            price=price,

            total=total
        )

        # =========================
        # REDUCE PRODUCT STOCK
        # =========================

        product.quantity -= quantity

        product.save()


        # =========================
        # SAVE TO GOOGLE SHEET
        # =========================

        save_sale_to_sheet(

            invoice_number=invoice_number,

            customer_name=customer.name,

            bread_type=product.name,

            quantity=quantity,

            amount=total
        )

    # =========================
    # RESPONSE
    # =========================

    return Response({

        "success": True,

        "message":
            "Sale saved successfully",

        "invoice_number":
            invoice_number,

        "sale_id":
            sale.id
    })

@api_view(['GET'])
def customer_history(request, customer_id):
    sales = Sale.objects.filter(customer_id=customer_id).order_by('-created_at')

    data = []

    for sale in sales:
        items = []

        for item in sale.items.all():
            items.append({
                "product": item.product.name,
                "quantity": item.quantity,
                "paid_quantity": item.paid_quantity,
                "price": item.price,
                "total": item.quantity * item.price
            })

        data.append({
            "id": sale.id,
            "date": sale.created_at,
            "total_cost": sale.total_cost,
            "total_paid": sale.total_paid,
            "debt": sale.debt,
            "items": items
        })

    return Response(data)


@api_view(['GET'])
def sale_items(request, sale_id):
    try:
        sale = Sale.objects.get(id=sale_id)
    except Sale.DoesNotExist:
        return Response({"error": "Sale not found"}, status=404)

    items = sale.items.all()

    data = []

    for item in items:
        data.append({
            "product": {
                "id": item.product.id,
                "name": item.product.name
            },
            "quantity": item.quantity,
            "paid_quantity": item.paid_quantity,
            "price": item.price
        })

    return Response(data)



@api_view(['GET'])
def customer_debt(request, customer_id):
    sales = Sale.objects.filter(customer_id=customer_id)

    total_cost = sum(s.total_cost for s in sales)
    total_paid = sum(s.total_paid for s in sales)

    debt = total_cost - total_paid

    return Response({
        "total_cost": total_cost,
        "total_paid": total_paid,
        "debt": debt
    })




@api_view(['GET'])
def today_summary(request):
    today = timezone.now().date()

    sales = Sale.objects.filter(created_at__date=today)

    total_sales = sum(s.total_cost for s in sales)
    total_paid = sum(s.total_paid for s in sales)
    total_debt = sum(s.debt for s in sales)

    return Response({
        "total_sales": total_sales,
        "total_paid": total_paid,
        "total_debt": total_debt,
        "count": sales.count()
    })




# @api_view(['POST'])
# def save_daily_production(request):

#     data = request.data

#     for item in data:

#         # =========================
#         # SAVE PRODUCTION
#         # =========================

#         production = DailyProduction.objects.create(

#             bread_type=item['bread_type'],

#             bags=item['bags'],

#             expected=item['expected'],

#             actual_yield=item['actual_yield'],

#             packaged=item['packaged'],

#             difference=item['difference'],

#             dispatch_difference=item['dispatch_difference'],

#             comment=item['comment']
#         )

#         # =========================
#         # AUTO SEND TO DISPATCH
#         # =========================

#         stock, created = DispatchStock.objects.get_or_create(
#             bread_type=item['bread_type']
#         )

#         stock.quantity_received += int(item['packaged'])

#         stock.quantity_remaining += int(item['packaged'])

#         stock.confirmed = True

#         stock.save()

#     return Response({

#         "success": True,

#         "message": "Production saved successfully"
#     })



# @api_view(['POST'])
# def save_daily_production(request):

#     print("SAVE DAILY PRODUCTION RUNNING")

#     data = request.data

#     for item in data:

#         # =========================
#         # SAVE PRODUCTION
#         # =========================

#         production = DailyProduction.objects.create(

#             bread_type=item['bread_type'],

#             bags=item['bags'],

#             expected=item['expected'],

#             actual_yield=item['actual_yield'],

#             packaged=item['packaged'],

#             difference=item['difference'],

#             dispatch_difference=item['dispatch_difference'],

#             comment=item['comment']
#         )

#         # =========================
#         # AUTO SEND TO DISPATCH
#         # =========================

#         stock, created = DispatchStock.objects.get_or_create(
#             bread_type=item['bread_type']
#         )

#         stock.quantity_received += int(
#             item['packaged']
#         )

#         stock.quantity_remaining += int(
#             item['packaged']
#         )

#         stock.confirmed = True

#         stock.save()

#         # =========================
#         # SAVE TO GOOGLE SHEET
#         # =========================

#         save_production_to_sheet(

#             bread_type=
#                 item['bread_type'],

#             bags=
#                 item['bags'],

#             expected=
#                 item['expected'],

#             actual_yield=
#                 item['actual_yield'],

#             packaged=
#                 item['packaged'],

#             difference=
#                 item['difference'],

#             dispatch_difference=
#                 item['dispatch_difference'],

#             comment=
#                 item['comment']
#         )

#     return Response({

#         "success": True,

#         "message":
#             "Production saved successfully"
#     })



@api_view(['POST'])
def save_daily_production(request):

    print("SAVE DAILY PRODUCTION RUNNING")

    try:

        data = request.data

        for item in data:

            # =========================
            # SAVE PRODUCTION
            # =========================

            production = DailyProduction.objects.create(

                bread_type=item['bread_type'],

                bags=item['bags'],

                expected=item['expected'],

                actual_yield=item['actual_yield'],

                packaged=item['packaged'],

                difference=item['difference'],

                dispatch_difference=item['dispatch_difference'],

                comment=item['comment']
            )

            print("PRODUCTION SAVED TO DATABASE")

            # =========================
            # AUTO SEND TO DISPATCH
            # =========================

            stock, created = (
                DispatchStock.objects.get_or_create(
                    bread_type=item['bread_type']
                )
            )

            stock.quantity_received += int(
                item['packaged']
            )

            stock.quantity_remaining += int(
                item['packaged']
            )

            stock.confirmed = True

            stock.save()

            print("DISPATCH STOCK UPDATED")

            # =========================
            # SAVE TO GOOGLE SHEET
            # =========================

            print("CALLING GOOGLE SHEET FUNCTION")

            save_production_to_sheet(

                bread_type=
                    item['bread_type'],

                bags=
                    item['bags'],

                expected=
                    item['expected'],

                actual_yield=
                    item['actual_yield'],

                packaged=
                    item['packaged'],

                difference=
                    item['difference'],

                dispatch_difference=
                    item['dispatch_difference'],

                comment=
                    item['comment']
            )

            print("GOOGLE SHEET FUNCTION FINISHED")

        return Response({

            "success": True,

            "message":
                "Production saved successfully"
        })

    except Exception as e:

        import traceback

        print("===================================")

        print("SAVE DAILY PRODUCTION ERROR")

        print("===================================")

        traceback.print_exc()

        return Response({

            "success": False,

            "error": str(e)

        }, status=400)




@api_view(['GET'])
def latest_production(request):

    productions = DailyProduction.objects.filter(
        confirmed=False
    ).order_by('id')

    serializer = DailyProductionSerializer(
        productions,
        many=True
    )

    return Response(serializer.data)



@api_view(['POST'])
def confirm_production(request):

    today = timezone.now().date()

    DailyProduction.objects.filter(
        created_at__date=today,
        confirmed=False
    ).update(
        confirmed=True
    )

    return Response({
        "success": True,
        "message": "Production confirmed"
    })







@api_view(["GET"])
def customer_sales(request, customer_id):

    sales = Sale.objects.filter(
        customer_id=customer_id
    ).order_by("-created_at")

    data = []

    for sale in sales:

        payments = []

        for payment in sale.payments.all():

            payments.append({
                "amount": payment.amount,
                "date": payment.created_at
            })

        data.append({

            "id": sale.id,

            "invoice_number":
                sale.invoice_number,

            "total":
                sale.total,

            "paid":
                sale.paid,

            "balance":
                sale.balance,

            "payment_method":
                sale.payment_method,

            "created_at":
                sale.created_at,

            "payments":
                payments
        })

    return Response(data)











@api_view(["POST"])
def pay_debt(request, sale_id):

    try:

        sale = Sale.objects.get(id=sale_id)

    except Sale.DoesNotExist:

        return Response(
            {"error": "Sale not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    amount = float(request.data.get("amount", 0))

    if amount <= 0:

        return Response(
            {"error": "Invalid amount"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if amount > sale.balance:

        return Response(
            {"error": "Amount exceeds balance"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ================= CREATE PAYMENT =================

    payment = Payment.objects.create(
        sale=sale,
        amount=amount
    )

    # ================= UPDATE SALE =================

    sale.paid += amount
    sale.balance -= amount

    sale.save()

    return Response({
        "message": "Payment successful",
        "paid": sale.paid,
        "balance": sale.balance,
        "payment": {
            "amount": payment.amount,
            "date": payment.created_at
        }
    })





# =========================
# PAY DEBT
# =========================

@api_view(["POST"])
def pay_debt(request, sale_id):

    try:
        sale = Sale.objects.get(id=sale_id)

    except Sale.DoesNotExist:

        return Response(
            {
                "success": False,
                "message": "Sale not found"
            },
            status=404
        )

    amount = request.data.get("amount")

    if not amount:

        return Response(
            {
                "success": False,
                "message": "Amount is required"
            },
            status=400
        )

    amount = float(amount)

    # =========================
    # VALIDATE AMOUNT
    # =========================

    if amount <= 0:

        return Response(
            {
                "success": False,
                "message": "Invalid amount"
            },
            status=400
        )

    if amount > float(sale.balance):

        return Response(
            {
                "success": False,
                "message": "Amount exceeds balance"
            },
            status=400
        )

    # =========================
    # SAVE PAYMENT HISTORY
    # =========================

    DebtPayment.objects.create(
        sale=sale,
        amount=amount
    )

    # =========================
    # UPDATE SALE
    # =========================

    sale.paid = float(sale.paid) + amount

    sale.balance = float(sale.balance) - amount

    sale.save()

    return Response({
        "success": True,
        "message": "Payment recorded successfully",
        "paid": sale.paid,
        "balance": sale.balance
    })





# =========================
# GET SALES FOR DISPATCH
# =========================

@api_view(["GET"])
def dispatch_sales(request):

    sales = SaleItem.objects.all().order_by("-id")

    data = []

    for item in sales:

        dispatched_qty = 0

        dispatches = SalesDispatch.objects.filter(
            sale_item=item,
            confirmed=True
        )

        for d in dispatches:
            dispatched_qty += d.quantity

        remaining = item.quantity - dispatched_qty

        if remaining > 0:

            # GET PACKAGED STOCK
            production = DailyProduction.objects.filter(
                bread_type=item.product_name
            ).order_by("-id").first()

            packaged = production.packaged if production else 0

            data.append({

                "sale_item_id": item.id,

                "invoice_number":
                    item.sale.invoice_number,

                "customer":
                    item.sale.customer.name,

                "bread_type":
                    item.product_name,

                "sold_quantity":
                    item.quantity,

                "remaining":
                    remaining,

                "packaged":
                    packaged
            })

    return Response(data)

# =========================
# CONFIRM PACKAGED BREAD
# =========================

@api_view(["POST"])
def confirm_packaged_bread(request):

    bread_type = request.data.get(
        "bread_type"
    )

    quantity = int(
        request.data.get("quantity", 0)
    )

    # =========================
    # VALIDATE
    # =========================

    if not bread_type:

        return Response({
            "success": False,
            "error": "Bread type is required"
        }, status=400)

    if quantity <= 0:

        return Response({
            "success": False,
            "error": "Invalid quantity"
        }, status=400)

    # =========================
    # GET OR CREATE STOCK
    # =========================

    stock, created = (
        DispatchStock.objects.get_or_create(
            bread_type=bread_type
        )
    )

    # =========================
    # ADD TO EXISTING STOCK
    # =========================

    stock.quantity_received += quantity

    stock.quantity_remaining += quantity

    stock.confirmed = True

    stock.save()

    # =========================
    # RESPONSE
    # =========================

    return Response({

        "success": True,

        "message":
            f"{bread_type} confirmed successfully",

        "stock": {

            "bread_type":
                stock.bread_type,

            "quantity_received":
                stock.quantity_received,

            "quantity_remaining":
                stock.quantity_remaining
        }
    })





# =========================
# CONFIRM DISPATCH
# =========================

@api_view(["POST"])
def confirm_dispatch(request):

    sale_item_id = request.data.get(
        "sale_item_id"
    )

    quantity = int(
        request.data.get("quantity", 0)
    )

    receiver = request.data.get(
        "receiver"
    )

    staff_id = request.data.get(
        "staff_id"
    )

    # =========================
    # GET SALE ITEM
    # =========================

    try:

        item = SaleItem.objects.get(
            id=sale_item_id
        )

    except SaleItem.DoesNotExist:

        return Response({
            "error": "Sale item not found"
        }, status=404)

    # =========================
    # GET DISPATCH STOCK
    # =========================

    stock = DispatchStock.objects.filter(
        bread_type__iexact=item.product_name
    ).first()

    if not stock:

        return Response({
            "error": "No dispatch stock available"
        }, status=400)

    # =========================
    # CHECK AVAILABLE STOCK
    # =========================

    if quantity > stock.quantity_remaining:

        return Response({
            "error": "Not enough dispatch stock"
        }, status=400)

    # =========================
    # REDUCE DISPATCH STOCK
    # =========================

    stock.quantity_remaining -= quantity

    stock.save()

    # =========================
    # GET STAFF
    # =========================

    staff = None

    if staff_id:

        staff = Staff.objects.filter(
            id=staff_id
        ).first()

    # =========================
    # SAVE DISPATCH RECORD
    # =========================

    SalesDispatch.objects.create(

        sale=item.sale,

        sale_item=item,

        bread_type=item.product_name,

        quantity=quantity,

        confirmed=True,

        receiver=receiver,

        dispatched_by=staff
    )

    # =========================
    # RESPONSE
    # =========================

    return Response({

        "success": True,

        "message":
            "Dispatch confirmed successfully"
    })


# =========================
# DISPATCH HISTORY
# =========================

@api_view(["GET"])
def dispatch_history(request):

    dispatches = SalesDispatch.objects.all().order_by(
        "-created_at"
    )

    data = []

    for d in dispatches:

        data.append({

            "invoice_number":
                d.sale.invoice_number,

            "customer":
                d.sale.customer.name,

            "bread_type":
                d.bread_type,

            "quantity":
                d.quantity,

            "receiver":
                d.receiver,

            "confirmed":
                d.confirmed,

            "date":
                d.created_at
        })

    return Response(data)





@api_view(["GET"])
def pending_dispatches(request):

    # =========================
    # ONLY UNDISPATCHED SALES
    # =========================

    sales = Sale.objects.filter(
        is_dispatched=False
    ).order_by("-id")

    data = []

    for sale in sales:

        data.append({

            "sale_id":
                sale.id,

            "customer_id":
                sale.customer.id,

            "invoice_number":
                sale.invoice_number,

            "customer":
                sale.customer.name,

            "phone":
                sale.customer.phone,

            # =====================
            # STILL PENDING
            # =====================

            "received":
                False,

            "remaining":
                0
        })

    return Response(data)

# =========================
# SINGLE DISPATCH DETAILS
# =========================

@api_view(["GET"])
def dispatch_details(request, sale_id):

    sale = Sale.objects.get(id=sale_id)

    data = []

    for item in sale.items.all():

        dispatched = SalesDispatch.objects.filter(
            sale_item=item,
            confirmed=True
        )

        dispatched_qty = sum(
            d.quantity for d in dispatched
        )

        remaining = (
            item.quantity - dispatched_qty
        )

        if remaining > 0:

            production = DailyProduction.objects.filter(
                bread_type__iexact=item.product_name
            ).order_by("-id").first()

            packaged = (
                production.packaged
                if production else 0
            )

            data.append({

                "sale_item_id": item.id,

                "bread_type":
                    item.product_name,

                "sold_quantity":
                    item.quantity,

                "remaining":
                    remaining,

                "packaged":
                    packaged
            })

    return Response(data)



# =========================
# PACKAGED BREAD
# =========================

@api_view(["GET"])
def packaged_bread(request):

    stocks = DispatchStock.objects.all()

    data = []

    for stock in stocks:

        data.append({

            "bread_type":
                stock.bread_type,

            # LIVE REMAINING STOCK
            "packaged":
                stock.quantity_remaining,

            "confirmed":
                stock.confirmed
        })

    return Response(data)



# =========================
# CONFIRM PACKAGED BREAD
# =========================

@api_view(["POST"])
def confirm_packaged_bread(request):

    bread_type = request.data.get(
        "bread_type"
    )

    quantity = int(
        request.data.get("quantity", 0)
    )

    stock, created = (
        DispatchStock.objects.get_or_create(
            bread_type=bread_type
        )
    )

    stock.quantity_received = quantity

    stock.quantity_remaining = quantity

    stock.confirmed = True

    stock.save()

    return Response({
        "success": True
    })


# =========================
# CUSTOMER ORDER
# =========================

# @api_view(["GET"])
# def customer_order(request, sale_id):

#     try:
#         sale = Sale.objects.get(id=sale_id)

#     except Sale.DoesNotExist:

#         return Response(
#             {"error": "Sale not found"},
#             status=404
#         )

#     data = []

#     for item in sale.items.all():

#         data.append({

#             "sale_item_id": item.id,

#             "bread_type": item.product_name,

#             "ordered": item.quantity
#         })

#     return Response(data)


# ==============================
# CUSTOMER ORDER
# ==============================

# ==============================
# CUSTOMER ORDER
# ==============================

# ==============================
# CUSTOMER ORDER
# ==============================

@api_view(["GET"])
def customer_order(request, sale_id):

    try:

        sale = Sale.objects.get(
            id=sale_id
        )

        sale_items = SaleItem.objects.filter(
            sale=sale
        )

        data = []

        for item in sale_items:

            # =========================
            # CHECK IF BREAD WAS OWED
            # =========================

            owed_record = CustomerBreadOwed.objects.filter(

                customer=sale.customer,

                invoice_number=
                    sale.invoice_number,

                bread_type=
                    item.product_name

            ).first()

            # =========================
            # STATUS
            # =========================

            bread_status = (
                owed_record.status
                if owed_record
                else "Pending"
            )

            data.append({

                "sale_item_id":
                    item.id,

                "bread_type":
                    item.product_name,

                "ordered":
                    item.quantity,

                "status":
                    bread_status

            })

        return Response(data)

    except Sale.DoesNotExist:

        return Response({

            "error":
                "Sale not found"

        }, status=404)

from django.db.models import Sum


# @api_view(["POST"])
# def give_bread(request):

#     try:

#         sale_item_id = request.data.get(
#             "sale_item_id"
#         )

#         quantity = int(
#             request.data.get("quantity", 0)
#         )

#         receiver = request.data.get(
#             "receiver"
#         )

#         # =========================
#         # VALIDATE INPUT
#         # =========================

#         if not sale_item_id:

#             return Response({

#                 "success": False,

#                 "error":
#                 "Sale item ID is required"

#             }, status=400)

#         if quantity <= 0:

#             return Response({

#                 "success": False,

#                 "error":
#                 "Invalid quantity"

#             }, status=400)

#         # =========================
#         # GET SALE ITEM
#         # =========================

#         try:

#             sale_item = SaleItem.objects.get(
#                 id=sale_item_id
#             )

#             sale = sale_item.sale

#         except SaleItem.DoesNotExist:

#             return Response({

#                 "success": False,

#                 "error":
#                 "Sale item not found"

#             }, status=404)

#         # =========================
#         # CHECK CUSTOMER REMAINING
#         # =========================

#         total_dispatched = (

#             CustomerDispatch.objects.filter(
#                 sale_item=sale_item
#             ).aggregate(
#                 total=Sum("quantity_given")
#             )["total"] or 0
#         )

#         remaining_order = (
#             sale_item.quantity -
#             total_dispatched
#         )

#         if remaining_order <= 0:

#             return Response({

#                 "success": False,

#                 "error":
#                 "Customer already received complete order"

#             }, status=400)

#         # =========================
#         # GET DISPATCH STOCK
#         # =========================

#         stock = DispatchStock.objects.filter(
#             bread_type__iexact=
#             sale_item.product_name
#         ).first()

#         # =========================
#         # DETERMINE ACTUAL GIVEN
#         # =========================

#         if not stock:

#             actual_given = 0

#         else:

#             # =========================
#             # OUT OF STOCK
#             # =========================

#             if stock.quantity_remaining <= 0:

#                 actual_given = 0

#             else:

#                 actual_given = quantity

#                 if quantity > stock.quantity_remaining:

#                     actual_given = (
#                         stock.quantity_remaining
#                     )

#         # =========================
#         # DO NOT EXCEED CUSTOMER ORDER
#         # =========================

#         if actual_given > remaining_order:

#             actual_given = remaining_order

#         # =========================
#         # SAVE CUSTOMER DISPATCH
#         # =========================

#         CustomerDispatch.objects.create(

#             sale_item=sale_item,

#             bread_type=
#                 sale_item.product_name,

#             quantity_given=
#                 actual_given,

#             receiver=
#                 receiver
#         )

#         # =========================
#         # REDUCE STOCK
#         # =========================

#         remaining_stock = 0

#         if stock:

#             stock.quantity_remaining -= actual_given

#             if stock.quantity_remaining < 0:

#                 stock.quantity_remaining = 0

#             stock.save()

#             remaining_stock = (
#                 stock.quantity_remaining
#             )

#         # =========================
#         # CHECK IF SALE COMPLETE
#         # =========================

#         all_items = SaleItem.objects.filter(
#             sale=sale
#         )

#         fully_dispatched = True

#         for item in all_items:

#             dispatched_quantity = (

#                 CustomerDispatch.objects.filter(
#                     sale_item=item
#                 ).aggregate(
#                     total=Sum("quantity_given")
#                 )["total"] or 0
#             )

#             if dispatched_quantity < item.quantity:

#                 fully_dispatched = False
#                 break

#         # =========================
#         # MARK SALE COMPLETED
#         # =========================

#         if fully_dispatched:

#             sale.is_dispatched = True
#             sale.save()

#         # =========================
#         # RESPONSE
#         # =========================

#         return Response({

#             "success": True,

#             "message":
#             "Bread dispatched successfully",

#             "bread_type":
#             sale_item.product_name,

#             "ordered":
#             sale_item.quantity,

#             "quantity_given":
#             actual_given,

#             "owing":
#             sale_item.quantity - (
#                 total_dispatched + actual_given
#             ),

#             "remaining_stock":
#             remaining_stock,

#             "sale_completed":
#             fully_dispatched
#         })

#     except Exception as e:

#         return Response({

#             "success": False,

#             "error": str(e)

#         }, status=400)

@api_view(["POST"])
def give_bread(request):

    try:

        sale_item_id = request.data.get(
            "sale_item_id"
        )

        quantity = int(
            request.data.get("quantity", 0)
        )

        receiver = request.data.get(
            "receiver"
        )

        # =========================
        # VALIDATE INPUT
        # =========================

        if not sale_item_id:

            return Response({

                "success": False,

                "error":
                "Sale item ID is required"

            }, status=400)

        if quantity <= 0:

            return Response({

                "success": False,

                "error":
                "Invalid quantity"

            }, status=400)

        # =========================
        # GET SALE ITEM
        # =========================

        try:

            sale_item = SaleItem.objects.get(
                id=sale_item_id
            )

            sale = sale_item.sale

        except SaleItem.DoesNotExist:

            return Response({

                "success": False,

                "error":
                "Sale item not found"

            }, status=404)

        # =========================
        # CHECK CUSTOMER REMAINING
        # =========================

        total_dispatched = (

            CustomerDispatch.objects.filter(
                sale_item=sale_item
            ).aggregate(
                total=Sum("quantity_given")
            )["total"] or 0
        )

        remaining_order = (
            sale_item.quantity -
            total_dispatched
        )

        if remaining_order <= 0:

            return Response({

                "success": False,

                "error":
                "Customer already received complete order"

            }, status=400)

        # =========================
        # GET DISPATCH STOCK
        # =========================

        stock = DispatchStock.objects.filter(
            bread_type__iexact=
            sale_item.product_name
        ).first()

        # =========================
        # DETERMINE ACTUAL GIVEN
        # =========================

        if not stock:

            actual_given = 0

        else:

            # =========================
            # OUT OF STOCK
            # =========================

            if stock.quantity_remaining <= 0:

                actual_given = 0

            else:

                actual_given = quantity

                if quantity > stock.quantity_remaining:

                    actual_given = (
                        stock.quantity_remaining
                    )

        # =========================
        # DO NOT EXCEED CUSTOMER ORDER
        # =========================

        if actual_given > remaining_order:

            actual_given = remaining_order

        # =========================
        # SAVE CUSTOMER DISPATCH
        # =========================

        CustomerDispatch.objects.create(

            sale_item=sale_item,

            bread_type=
                sale_item.product_name,

            quantity_given=
                actual_given,

            receiver=
                receiver
        )

        # =========================
        # REDUCE STOCK
        # =========================

        remaining_stock = 0

        if stock:

            stock.quantity_remaining -= actual_given

            if stock.quantity_remaining < 0:

                stock.quantity_remaining = 0

            stock.save()

            remaining_stock = (
                stock.quantity_remaining
            )

        # =========================
        # SAVE TO GOOGLE SHEET
        # =========================

        save_dispatch_to_sheet(

            invoice_number=
                sale.invoice_number,

            customer_name=
                sale.customer.name,

            bread_type=
                sale_item.product_name,

            quantity_given=
                actual_given,

            receiver=
                receiver
        )

        # =========================
        # CHECK IF SALE COMPLETE
        # =========================

        all_items = SaleItem.objects.filter(
            sale=sale
        )

        fully_dispatched = True

        for item in all_items:

            dispatched_quantity = (

                CustomerDispatch.objects.filter(
                    sale_item=item
                ).aggregate(
                    total=Sum("quantity_given")
                )["total"] or 0
            )

            if dispatched_quantity < item.quantity:

                fully_dispatched = False
                break

        # =========================
        # MARK SALE COMPLETED
        # =========================

        if fully_dispatched:

            sale.is_dispatched = True

            sale.save()

        # =========================
        # RESPONSE
        # =========================

        return Response({

            "success": True,

            "message":
            "Bread dispatched successfully",

            "bread_type":
            sale_item.product_name,

            "ordered":
            sale_item.quantity,

            "quantity_given":
            actual_given,

            "owing":
            sale_item.quantity - (
                total_dispatched + actual_given
            ),

            "remaining_stock":
            remaining_stock,

            "sale_completed":
            fully_dispatched
        })

    except Exception as e:

        return Response({

            "success": False,

            "error": str(e)

        }, status=400)
 

        
        
        
        
        
        

@api_view(["GET"])
def dispatch_summary(request):

    stocks = DispatchStock.objects.all()

    total_received = sum(
        s.quantity_received
        for s in stocks
    )

    total_remaining = sum(
        s.quantity_remaining
        for s in stocks
    )

    total_given = (
        total_received -
        total_remaining
    )

    return Response({

        "total_received":
            total_received,

        "total_given":
            total_given,

        "total_remaining":
            total_remaining
    })


# =========================
# COMPLETE DAY DISPATCH
# =========================

@api_view(["POST"])
def complete_day_dispatch(request):

    try:

        # =========================
        # CLEAR ALL DAILY PRODUCTION
        # =========================

        DailyProduction.objects.all().delete()

        return Response({

            "message":
            "Dispatch day completed successfully"

        })

    except Exception as e:

        return Response({

            "error": str(e)

        }, status=400)
    




# =========================================
# SAVE DISPATCH
# =========================================

# @api_view(["POST"])
# def save_dispatch(request):

#     try:

#         customer_id = request.data.get("customer")

#         invoice_number = request.data.get(
#             "invoice_number"
#         )

#         items = request.data.get("items", [])

#         customer = Customer.objects.get(
#             id=customer_id
#         )

#         # ==========================
#         # CREATE DISPATCH
#         # ==========================

#         dispatch = Dispatch.objects.create(
#             customer=customer,
#             invoice_number=invoice_number
#         )

#         # ==========================
#         # SAVE ITEMS
#         # ==========================

#         for item in items:

#             bread_type = item.get("bread_type")

#             quantity_bought = int(
#                 item.get("quantity_bought", 0)
#             )

#             quantity_given = int(
#                 item.get("quantity_given", 0)
#             )

#             quantity_owed = (
#                 quantity_bought -
#                 quantity_given
#             )

#             # ======================
#             # SAVE DISPATCH ITEM
#             # ======================

#             DispatchItem.objects.create(
#                 dispatch=dispatch,
#                 bread_type=bread_type,
#                 quantity_bought=quantity_bought,
#                 quantity_given=quantity_given,
#                 quantity_owed=quantity_owed
#             )

#             # ======================
#             # SAVE CUSTOMER OWED
#             # ======================

#             if quantity_owed > 0:

#                 existing = (
#                     CustomerBreadOwed.objects
#                     .filter(
#                         customer=customer,
#                         bread_type=bread_type,
#                         status="Pending"
#                     )
#                     .first()
#                 )

#                 if existing:

#                     existing.quantity += quantity_owed

#                     existing.save()

#                 else:

#                     CustomerBreadOwed.objects.create(
#                         customer=customer,
#                         invoice_number=invoice_number,
#                         bread_type=bread_type,
#                         quantity=quantity_owed
#                     )

#         serializer = DispatchSerializer(
#             dispatch
#         )

#         return Response(
#             serializer.data,
#             status=status.HTTP_201_CREATED
#         )

#     except Exception as e:

#         return Response(
#             {"error": str(e)},
#             status=status.HTTP_400_BAD_REQUEST
#         )
    

@api_view(["POST"])
def save_dispatch(request):

    try:

        customer_id = request.data.get(
            "customer"
        )

        invoice_number = request.data.get(
            "invoice_number"
        )

        items = request.data.get(
            "items",
            []
        )

        customer = Customer.objects.get(
            id=customer_id
        )

        # ==========================
        # CREATE DISPATCH
        # ==========================

        dispatch = Dispatch.objects.create(

            customer=customer,

            invoice_number=
                invoice_number
        )

        # ==========================
        # SAVE ITEMS
        # ==========================

        for item in items:

            bread_type = item.get(
                "bread_type"
            )

            quantity_bought = int(
                item.get(
                    "quantity_bought",
                    0
                )
            )

            quantity_given = int(
                item.get(
                    "quantity_given",
                    0
                )
            )

            quantity_owed = (

                quantity_bought -

                quantity_given
            )

            # ======================
            # SAVE DISPATCH ITEM
            # ======================

            DispatchItem.objects.create(

                dispatch=dispatch,

                bread_type=
                    bread_type,

                quantity_bought=
                    quantity_bought,

                quantity_given=
                    quantity_given,

                quantity_owed=
                    quantity_owed
            )

            # ======================
            # SAVE CUSTOMER OWED
            # ======================

            if quantity_owed > 0:

                existing = (

                    CustomerBreadOwed.objects

                    .filter(

                        customer=
                            customer,

                        bread_type=
                            bread_type,

                        status=
                            "Pending"

                    )

                    .first()
                )

                if existing:

                    existing.quantity += (
                        quantity_owed
                    )

                    existing.save()

                else:

                    CustomerBreadOwed.objects.create(

                        customer=
                            customer,

                        invoice_number=
                            invoice_number,

                        bread_type=
                            bread_type,

                        quantity=
                            quantity_owed
                    )

        # ==========================
        # REMOVE FROM PENDING
        # ==========================

        sale = Sale.objects.get(
            invoice_number=invoice_number
        )

        sale.is_dispatched = True

        sale.save()

        # ==========================
        # SERIALIZER
        # ==========================

        serializer = DispatchSerializer(
            dispatch
        )

        return Response(

            serializer.data,

            status=status.HTTP_201_CREATED
        )

    except Exception as e:

        return Response(

            {
                "error": str(e)
            },

            status=status.HTTP_400_BAD_REQUEST
        )


# =========================================
# CUSTOMER LEDGER DROPDOWN
# =========================================

# @api_view(["GET"])
# def customer_dispatch_list(request):

#     dispatches = Dispatch.objects.all().order_by(
#         "-created_at"
#     )

#     data = []

#     for dispatch in dispatches:

#         data.append({
#             "id": dispatch.id,
#             "customer": dispatch.customer.name,
#             "invoice": dispatch.invoice_number,
#             "date": dispatch.created_at
#         })

#     return Response(data)





# ==============================
# CUSTOMER DISPATCH LIST
# ==============================

@api_view(["GET"])
def customer_dispatch_list(request):

    dispatches = Dispatch.objects.all().order_by(
        "-created_at"
    )

    data = []

    for dispatch in dispatches:

        data.append({

            "id":
                dispatch.id,

            "customer":
                dispatch.customer.name,

            "phone":
                dispatch.customer.phone,

            "invoice":
                dispatch.invoice_number,

            "date":
                dispatch.created_at

        })

    return Response(data)






# =========================================
# CUSTOMER LEDGER DETAILS
# =========================================

# @api_view(["GET"])
# def customer_ledger(request, dispatch_id):

#     try:

#         dispatch = Dispatch.objects.get(
#             id=dispatch_id
#         )

#         # =========================
#         # GET DISPATCH ITEMS
#         # =========================

#         items = DispatchItem.objects.filter(
#             dispatch=dispatch
#         )

#         # =========================
#         # GET CUSTOMER OWED BREAD
#         # =========================

#         owed = CustomerBreadOwed.objects.filter(
#             customer=dispatch.customer,
#             status="Pending"
#         )

#         # =========================
#         # ITEMS DATA
#         # =========================

#         item_data = []

#         for item in items:

#             item_data.append({

#                 "bread_type":
#                     item.bread_type,

#                 "bought":
#                     item.quantity_bought,

#                 "given":
#                     item.quantity_given,

#                 "owed":
#                     item.quantity_owed
#             })

#         # =========================
#         # OWED DATA
#         # =========================

#         owed_data = []

#         for bread in owed:

#             owed_data.append({

#                 "bread_type":
#                     bread.bread_type,

#                 "quantity":
#                     bread.quantity
#             })

#         # =========================
#         # RESPONSE
#         # =========================

#         return Response({

#             "customer_id":
#                 dispatch.customer.id,

#             "customer":
#                 dispatch.customer.name,

#             "invoice":
#                 dispatch.invoice_number,

#             "date":
#                 dispatch.created_at,

#             "items":
#                 item_data,

#             "bread_owed":
#                 owed_data

#         })

#     except Exception as e:

#         return Response({

#             "success": False,

#             "error": str(e)

#         }, status=status.HTTP_400_BAD_REQUEST)


# ==============================
# CUSTOMER LEDGER
# ==============================

@api_view(["GET"])
def customer_ledger(request, dispatch_id):

    try:

        # =========================
        # GET DISPATCH
        # =========================

        dispatch = Dispatch.objects.get(
            id=dispatch_id
        )

        # =========================
        # GET DISPATCH ITEMS
        # =========================

        items = DispatchItem.objects.filter(
            dispatch=dispatch
        )

        # =========================
        # ITEMS DATA
        # =========================

        items_data = []

        for item in items:

            items_data.append({

                "bread_type":
                    item.bread_type,

                "bought":
                    item.quantity_bought,

                "given":
                    item.quantity_given,

                "owed":
                    item.quantity_owed

            })

        # =========================
        # CUSTOMER BREAD OWED
        # =========================

        bread_owed = CustomerBreadOwed.objects.filter(
            customer=dispatch.customer
        )

        # =========================
        # BREAD OWED DATA
        # =========================

        bread_owed_data = []

        for bread in bread_owed:

            bread_owed_data.append({

                "bread_type":
                    bread.bread_type,

                "quantity":
                    bread.quantity,

                "status":
                    bread.status,

                "cleared_at":
                    bread.cleared_at,

                "invoice_number":
                    bread.invoice_number

            })

        # =========================
        # RESPONSE
        # =========================

        return Response({

            "customer_id":
                dispatch.customer.id,

            "customer":
                dispatch.customer.name,

            "invoice":
                dispatch.invoice_number,

            "date":
                dispatch.created_at,

            "items":
                items_data,

            "bread_owed":
                bread_owed_data

        })

    except Dispatch.DoesNotExist:

        return Response(
            {
                "error":
                "Dispatch Not Found"
            },
            status=404
        )
        



    


# =========================================
# CLEAR CUSTOMER
# =========================================

@api_view(["POST"])
def clear_customer(request):

    print("REQUEST DATA:", request.data)

    customer_id = request.data.get(
        "customer_id"
    )

    print("CUSTOMER ID:", customer_id)

    if not customer_id:

        return Response({
            "success": False,
            "error": "Customer ID missing"
        }, status=400)

    breads = CustomerBreadOwed.objects.filter(
        customer_id=customer_id,
        status="Pending"
    )

    print("BREADS FOUND:", breads.count())

    for bread in breads:

        bread.status = "Cleared"

        bread.quantity = 0

        bread.cleared_at = timezone.now()

        bread.save()

    return Response({
        "success": True,
        "message": "Customer cleared"
    })
    
    


from .models import CustomerBreadOwed


# ==============================
# SETTLE CUSTOMER BREAD
# ==============================

@api_view(["POST"])
def settle_customer_bread(request):

    customer_id = request.data.get(
        "customer_id"
    )

    bread_type = request.data.get(
        "bread_type"
    )

    invoice_number = request.data.get(
        "invoice_number"
    )

    try:

        bread = CustomerBreadOwed.objects.get(
            customer_id=customer_id,
            bread_type=bread_type,
            invoice_number=invoice_number,
            status="Pending"
        )

        # ======================
        # MARK AS SETTLED
        # ======================

        bread.status = "Settled"

        bread.cleared_at = timezone.now()

        bread.save()

        return Response(
            {
                "message":
                "Bread Settled Successfully"
            },
            status=status.HTTP_200_OK
        )

    except CustomerBreadOwed.DoesNotExist:

        return Response(
            {
                "error":
                "Bread Record Not Found"
            },
            status=status.HTTP_404_NOT_FOUND
        )
