from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    path('search', views.search, name='search'),
    path('change_date', views.change_date, name='change_date'),
    path('room/<int:room_id>', views.room, name='room'),
    path("room/<int:room_id>/reserve", views.reserve, name="reserve"),
    path('my_reservations', views.my_reservations, name='my_reservations'),
    path('my_reservations/<int:res_id>', views.select_res, name='select_res'),
    path('my_reservations/<int:res_id>/cancel_res', views.cancel_res, name='cancel_res')
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL,
                          document_root=settings.MEDIA_ROOT)