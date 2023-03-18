from django.contrib import admin
from .models import User, Room, Reservation


class RoomAdmin(admin.ModelAdmin):
    list_display = ('title', 'bed_num', 'price', 'id')


class ReservationAdmin(admin.ModelAdmin):
    list_display = ('guest', 'room', 'checkin', 'checkout', 'duration', 'total', 'id')


# Register your models here.
admin.site.register(User)
admin.site.register(Room, RoomAdmin)
admin.site.register(Reservation, ReservationAdmin)
