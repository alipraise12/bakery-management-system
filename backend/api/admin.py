from django.contrib import admin

from .models import (
    Staff,
    ExpectedYield,
    Customer,
    Product,
    CustomerDispatch,
    Inventory,
    Attendance,
    DailyProduction,
    Sale,
    Dispatch,
)

admin.site.register(Staff)

admin.site.register(ExpectedYield)

admin.site.register(Customer)

admin.site.register(Product)

admin.site.register(CustomerDispatch)

admin.site.register(Inventory)

admin.site.register(Attendance)

admin.site.register(DailyProduction)

admin.site.register(Sale)

admin.site.register(Dispatch)







# from django.contrib import admin
# from .models import Staff
# from .models import ExpectedYield
# from .models import Customer, Product
# from .models import CustomerDispatch


# admin.site.register(ExpectedYield)
# admin.site.register(Staff)

# admin.site.register(Customer)
# admin.site.register(Product)

# admin.site.register(CustomerDispatch)