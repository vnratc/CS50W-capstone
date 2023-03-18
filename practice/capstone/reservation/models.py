from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    reservations = models.ManyToManyField('Reservation')


class Reservation(models.Model):
    guest = models.ForeignKey('User', on_delete=models.PROTECT)
    room = models.ForeignKey('Room', on_delete=models.PROTECT)
    checkin = models.DateField()
    checkout = models.DateField()
    duration = models.PositiveSmallIntegerField(null=True)
    total = models.FloatField(null=True)

    def __str__(self):
        return f'{self.guest} - {self.room} - {self.checkin} - {self.checkout}'
    
    def serialize(self):
        return {
            'id': self.id,
            'guest': self.guest.username,
            'room_id': self.room.id,
            'room_title': self.room.title,
            'room_description': self.room.description,
            'room_bed_num': self.room.bed_num,
            'room_img': str(self.room.img),
            'checkin': self.checkin,
            'checkout': self.checkout,
            'duration': self.duration,
            'total': self.total
        }
    

class Room(models.Model):
    reservations = models.ManyToManyField('Reservation', related_name='reserved_room', blank=True)
    title = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    bed_num = models.PositiveSmallIntegerField()
    price = models.FloatField(null=True)
    img = models.ImageField(upload_to='images', null=True)

    def __str__(self):
        return f'{self.title}'

    def serialize(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'bed_num': self.bed_num,
            'price': self.price,
            'img': str(self.img)
        }

    