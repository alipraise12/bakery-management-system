from rest_framework import serializers
from .models import Staff, ExpectedYield, YieldRecord, DispatchRecord
from django.contrib.auth.hashers import make_password
from .models import DailyProduction


# =========================
# STAFF SERIALIZER
# =========================
class StaffSerializer(serializers.ModelSerializer):

    class Meta:
        model = Staff
        fields = '__all__'
        extra_kwargs = {
            'password': {'write_only': True, 'required': True}
        }

    def validate(self, data):
        # 🔥 Admin must have position
        if data.get('is_admin') and not data.get('position'):
            raise serializers.ValidationError({
                "position": "Position is required for admin"
            })
        return data

    def create(self, validated_data):
        # 🔐 Hash password
        password = validated_data.pop('password')

        user = Staff(**validated_data)
        user.password = make_password(password)

        if user.position:
            user.is_admin = True

        user.save()
        return user


# =========================
# EXPECTED YIELD (STANDARD)
# =========================
class ExpectedYieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExpectedYield
        fields = '__all__'


# =========================
# YIELD RECORD
# =========================
class YieldRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = YieldRecord
        fields = '__all__'


# =========================
# DISPATCH RECORD
# =========================
class DispatchRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = DispatchRecord
        fields = '__all__'


class DailyProductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyProduction
        fields = '__all__'


from .models import (
    Dispatch,
    DispatchItem,
    CustomerBreadOwed
)


# ==============================
# DISPATCH ITEM SERIALIZER
# ==============================

class DispatchItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = DispatchItem

        fields = "__all__"


# ==============================
# DISPATCH SERIALIZER
# ==============================

class DispatchSerializer(serializers.ModelSerializer):

    items = DispatchItemSerializer(
        many=True,
        read_only=True
    )

    customer_name = serializers.CharField(
        source="customer.name",
        read_only=True
    )

    class Meta:
        model = Dispatch

        fields = [
            "id",
            "customer",
            "customer_name",
            "invoice_number",
            "created_at",
            "items"
        ]


# ==============================
# CUSTOMER BREAD OWED SERIALIZER
# ==============================

class CustomerBreadOwedSerializer(
    serializers.ModelSerializer
):

    customer_name = serializers.CharField(
        source="customer.name",
        read_only=True
    )

    class Meta:
        model = CustomerBreadOwed

        fields = "__all__"
# from rest_framework import serializers
# from .models import Staff
# from django.contrib.auth.hashers import make_password


# class StaffSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Staff
#         fields = '__all__'
#         extra_kwargs = {
#             'password': {'write_only': True, 'required': True}
#         }

#     def validate(self, data):
#         # 🔥 Admin must have position
#         if data.get('is_admin') and not data.get('position'):
#             raise serializers.ValidationError({
#                 "position": "Position is required for admin"
#             })
#         return data

#     def create(self, validated_data):
#         # 🔐 Hash password ONLY HERE
#         password = validated_data.pop('password')

#         user = Staff(**validated_data)
#         user.password = make_password(password)

#         if user.position:
#             user.is_admin = True

#         user.save()
#         return user










# from rest_framework import serializers
# from .models import Staff
# from django.contrib.auth.hashers import make_password


# class StaffSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Staff
#         fields = '__all__'
#         extra_kwargs = {
#             'password': {'write_only': True, 'required': True}
#         }

#     def validate(self, data):
#         """
#         🔥 Custom validation
#         - If user is admin, position is required
#         """
#         is_admin = data.get('is_admin', False)
#         position = data.get('position')

#         if is_admin and not position:
#             raise serializers.ValidationError({
#                 "position": "Position is required for admin"
#             })

#         return data

#     def create(self, validated_data):
#         """
#         🔐 Hash password before saving
#         """
#         password = validated_data.pop('password')

#         user = Staff(**validated_data)
#         user.password = make_password(password)

#         # Optional: ensure admin always has flag
#         if user.position:
#             user.is_admin = True

#         user.save()
#         return user















# from rest_framework import serializers
# from .models import Staff
# from django.contrib.auth.hashers import make_password


# class StaffSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Staff
#         fields = '__all__'
#         extra_kwargs = {
#             'password': {'write_only': True, 'required': True}
#         }

#     def create(self, validated_data):
#         password = validated_data.pop('password')  # 👈 safer

#         user = Staff(**validated_data)
#         user.password = make_password(password)
#         user.save()

#         return user

# class StaffSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Staff
#         fields = '__all__'

#     def create(self, validated_data):
#         password = validated_data.get('password')

#         if password:
#             validated_data['password'] = make_password(password)

#         return super().create(validated_data)