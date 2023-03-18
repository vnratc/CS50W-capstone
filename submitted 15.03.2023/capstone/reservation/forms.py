from django import forms
from .models import Room
from datetime import datetime, timedelta

today_str = datetime.now().date().strftime('%Y-%m-%d')
day = timedelta(days=1)
tomorow_str = (datetime.now().date() + day).strftime('%Y-%m-%d')

numbers = [(num, num) for num in range(1, 11)]

class SearchForm(forms.Form):
    checkin = forms.DateField(initial=today_str, widget=forms.DateInput(attrs={
        'type': 'date',
        'id': 'checkin',
        'class': 'btn btn-dark'
    }))
    
    checkout = forms.DateField(initial=tomorow_str, widget=forms.DateInput(attrs={
        'type': 'date',
        'id': 'checkout',
        'class': 'btn btn-dark'
    }))
   
    pers_num = forms.ChoiceField(choices=numbers, initial=1 , widget=forms.Select(attrs={
        'id': 'pers_num',
        'min': '1',
        'max': '10',
        'class': 'btn btn-dark'
    }), label='Number of Guests')
    
    req_room = forms.ModelChoiceField(widget=forms.Select(attrs={
        'id': 'req_room',
        'class': 'btn btn-dark my-2'
    }), queryset=Room.objects.all(), required=False, empty_label="Select Room Preference")