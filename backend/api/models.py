import uuid
import qrcode
from io import BytesIO
from django.db import models
from django.core.files import File
from django.utils import timezone


# =========================
# STAFF MODEL
# =========================
class Staff(models.Model):

    POSITION_CHOICES = [
        ('Director', 'Director'),
        ('Manager', 'Manager'),
        ('Cashier', 'Cashier'),
        ('Accountant', 'Accountant'),
    ]

    position = models.CharField(max_length=20, choices=POSITION_CHOICES, blank=True, null=True)
    is_admin = models.BooleanField(default=False)

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)

    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)

    picture = models.ImageField(upload_to='staff_photos/', blank=True, null=True)

    guarantor_first_name = models.CharField(max_length=100, blank=True)
    guarantor_last_name = models.CharField(max_length=100, blank=True)
    guarantor_email = models.EmailField(blank=True)
    guarantor_phone = models.CharField(max_length=20, blank=True)

    is_verified = models.BooleanField(default=False)

    qr_token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    qr_code = models.ImageField(upload_to='qrcodes/', blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):

        if self.position:
            self.is_admin = True

        super().save(*args, **kwargs)

        if not self.qr_code:
            qr = qrcode.make(str(self.qr_token))

            buffer = BytesIO()
            qr.save(buffer, format='PNG')

            file_name = f"{self.first_name}_{self.id}.png"
            self.qr_code.save(file_name, File(buffer), save=False)

            super().save(update_fields=['qr_code'])

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# =========================
# INVENTORY
# =========================
class Inventory(models.Model):
    product_name = models.CharField(max_length=100)
    stock_in = models.IntegerField(default=0)
    stock_out = models.IntegerField(default=0)
    available = models.IntegerField(default=0)

    date = models.DateField()
    time = models.TimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.available = self.stock_in - self.stock_out
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product_name} - {self.date}"


# =========================
# ATTENDANCE
# =========================
class Attendance(models.Model):
    staff = models.ForeignKey(Staff, on_delete=models.CASCADE)
    date = models.DateField()
    time_in = models.TimeField(null=True, blank=True)
    time_out = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.staff.first_name} - {self.date}"


# =========================
# EXPECTED YIELDS (STANDARD TABLE)
# =========================
class ExpectedYield(models.Model):
    bread_type = models.CharField(max_length=100, unique=True)
    standard = models.IntegerField()

    updated_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.bread_type} - {self.standard}"


# =========================
# DAILY PRODUCTION
# =========================
class DailyProduction(models.Model):

    bread_type = models.CharField(max_length=100)

    bags = models.IntegerField(default=0)

    expected = models.IntegerField(default=0)

    actual_yield = models.IntegerField(default=0)

    packaged = models.IntegerField(default=0)

    difference = models.IntegerField(default=0)

    dispatch_difference = models.IntegerField(default=0)

    comment = models.TextField(blank=True)

    confirmed = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bread_type} - {self.created_at}"


# =========================
# YIELD RECORD
# =========================
class YieldRecord(models.Model):
    bread_type = models.CharField(max_length=100)

    bags = models.IntegerField()
    expected = models.IntegerField()
    actual = models.IntegerField()
    difference = models.IntegerField()

    recorded_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bread_type} - {self.created_at}"


# =========================
# DISPATCH RECORD
# =========================
class DispatchRecord(models.Model):
    bread_type = models.CharField(max_length=100)

    actual = models.IntegerField()
    packaged = models.IntegerField()
    difference = models.IntegerField()

    receiver = models.CharField(max_length=100)

    recorded_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.bread_type} - {self.created_at}"




# class Customer(models.Model):
#     name = models.CharField(max_length=255)
#     phone = models.CharField(max_length=20, blank=True)


# class Product(models.Model):
#     name = models.CharField(max_length=100)
#     price = models.IntegerField()


# # =========================
# # SALES (FINAL CLEAN VERSION)
# # =========================
# class Sale(models.Model):
#     customer = models.ForeignKey(Customer, on_delete=models.CASCADE)

#     total_cost = models.FloatField()
#     total_paid = models.FloatField()
#     debt = models.FloatField()

#     payment_method = models.CharField(max_length=50)

#     created_at = models.DateTimeField(auto_now_add=True)

#     def __str__(self):
#         return f"Sale {self.id} - {self.customer.name}"


# # =========================
# # SALE ITEMS
# # =========================
# class SaleItem(models.Model):
#     sale = models.ForeignKey(Sale, on_delete=models.CASCADE, related_name="items")

#     product = models.ForeignKey(Product, on_delete=models.CASCADE)

#     quantity = models.IntegerField()        # ordered
#     paid_quantity = models.IntegerField()   # how many paid for
#     price = models.FloatField()

    def __str__(self):
        return f"{self.product.name} - Sale {self.sale.id}"
    





# ================= CUSTOMER =================

class Customer(models.Model):

    name = models.CharField(
        max_length=200
    )

    phone = models.CharField(
        max_length=50
    )

    address = models.TextField(
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.name


# ================= PRODUCT =================

class Product(models.Model):

    name = models.CharField(
        max_length=200
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    quantity = models.IntegerField(
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.name


# ================= SALE =================

class Sale(models.Model):

    invoice_number = models.CharField(
        max_length=100
    )

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="sales"
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    paid = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    balance = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    cash = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    transfer = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    payment_method = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )
    
    
    # ✅ ADD THIS FIELD
    is_dispatched = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )



    def __str__(self):

        return self.invoice_number


# ================= SALE ITEMS =================

class SaleItem(models.Model):

    sale = models.ForeignKey(
        "Sale",
        on_delete=models.CASCADE,
        related_name="items"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE
    )

    product_name = models.CharField(
        max_length=200
    )

    quantity = models.IntegerField(
        default=0
    )

    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.product_name


# ================= DEBT PAYMENT =================

class DebtPayment(models.Model):

    sale = models.ForeignKey(
        "Sale",
        on_delete=models.CASCADE,
        related_name="payments"
    )

    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.sale.invoice_number} - ₦{self.amount}"
    


# =========================
# SALES DISPATCH
# =========================
class SalesDispatch(models.Model):

    sale = models.ForeignKey(
        Sale,
        on_delete=models.CASCADE,
        related_name="dispatches"
    )

    sale_item = models.ForeignKey(
        SaleItem,
        on_delete=models.CASCADE
    )

    bread_type = models.CharField(
        max_length=200
    )

    quantity = models.IntegerField()

    confirmed = models.BooleanField(
        default=False
    )

    receiver = models.CharField(
        max_length=200,
        blank=True,
        null=True
    )

    dispatched_by = models.ForeignKey(
        Staff,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return f"{self.bread_type} - {self.quantity}"


# =========================
# DISPATCH STOCK
# =========================

class DispatchStock(models.Model):

    bread_type = models.CharField(
        max_length=200
    )

    quantity_received = models.IntegerField(
        default=0
    )

    quantity_remaining = models.IntegerField(
        default=0
    )

    confirmed = models.BooleanField(
        default=False
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.bread_type


# =========================
# CUSTOMER DISPATCH
# =========================

class CustomerDispatch(models.Model):

    sale_item = models.ForeignKey(
        SaleItem,
        on_delete=models.CASCADE
    )

    bread_type = models.CharField(
        max_length=200
    )

    quantity_given = models.IntegerField(
        default=0
    )

    receiver = models.CharField(
        max_length=200
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):

        return self.bread_type
    





# ==============================
# CUSTOMER DISPATCH
# ==============================

class Dispatch(models.Model):

    customer = models.ForeignKey(
        "Customer",
        on_delete=models.CASCADE
    )

    invoice_number = models.CharField(
        max_length=100,
        unique=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return f"{self.customer.name} - {self.invoice_number}"


# ==============================
# DISPATCH ITEMS
# ==============================

class DispatchItem(models.Model):

    dispatch = models.ForeignKey(
        Dispatch,
        on_delete=models.CASCADE,
        related_name="items"
    )

    bread_type = models.CharField(
        max_length=100
    )

    quantity_bought = models.IntegerField(
        default=0
    )

    quantity_given = models.IntegerField(
        default=0
    )

    quantity_owed = models.IntegerField(
        default=0
    )

    def __str__(self):
        return self.bread_type


# ==============================
# CUSTOMER BREAD OWED
# ==============================

class CustomerBreadOwed(models.Model):

    customer = models.ForeignKey(
        "Customer",
        on_delete=models.CASCADE
    )

    invoice_number = models.CharField(
        max_length=100
    )

    bread_type = models.CharField(
        max_length=100
    )

    quantity = models.IntegerField(
        default=0
    )

    status = models.CharField(
        max_length=20,
        default="Pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    cleared_at = models.DateTimeField(
        null=True,
        blank=True
    )

    def __str__(self):
        return f"{self.customer.name} - {self.bread_type}"