"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# from backend.views import hello, home

# urlpatterns = [
#     path('', home),
#     path('admin/', admin.site.urls),
#     path('api/hello/', hello),
# ]



from django.contrib import admin
from django.urls import path, include
from api.views import hello   # 👈 import this
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),

    path('', hello),  # ✅ ADD THIS LINE

    path('api/', include('api.urls')),



    


]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# from django.contrib import admin
# from django.urls import path
# from api.views import hello, register_staff, register_admin, login_staff
# from django.conf import settings
# from django.conf.urls.static import static

# urlpatterns = [
#     # 🔧 Admin panel
#     path('admin/', admin.site.urls),

#     # ✅ Test route
#     path('', hello),
#     path('api/hello/', hello),

#     # 👤 Staff Registration
#     path('api/staff/register/', register_staff),

#     # 👤 OPTIONAL shortcut (fix for your error)
#     path('api/register/', register_staff),

#     # 🧑‍💼 Admin Registration
#     path('api/admin/register/', register_admin),

#     # 🔐 Login
#     path('api/login/', login_staff),
# ]

# # 📁 Media files
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)












# from django.contrib import admin
# from django.urls import path
# from api.views import hello, register_staff, register_admin, login_staff
# from django.conf import settings
# from django.conf.urls.static import static


# urlpatterns = [
#     # 🔧 Django Admin Panel
#     path('admin/', admin.site.urls),

#     # ✅ Test route
#     path('', hello),
#     path('api/hello/', hello),

#     # 👤 Staff Registration
#     path('api/staff/register/', register_staff),

#     # 🧑‍💼 Admin Registration (NEW)
#     path('api/admin/register/', register_admin),

#     # 🔐 Login (Staff + Admin)
#     path('api/login/', login_staff),
# ]

# # 📁 Serve uploaded images
# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)









# from django.contrib import admin
# from django.urls import path
# from api.views import hello, register_staff
# from django.conf import settings
# from django.conf.urls.static import static

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('', hello),
#     path('api/hello/', hello),
#     path('api/register/', register_staff),
# ]

# urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)