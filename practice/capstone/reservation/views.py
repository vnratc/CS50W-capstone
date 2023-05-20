import json
from datetime import datetime, timedelta
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .models import User, Reservation, Room
from .forms import SearchForm


# Render the home page.
def index(request):

    # If no loggend in user.
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('login'))
    
    # Get all existing rooms in the hotel for the "All Rooms" view.
    all_rooms = Room.objects.all()
    return render(request, 'reservation/index.html', {
        'search_form': SearchForm,
        'all_rooms': all_rooms
    })


# React to clicking "change date" buttons left and right of the date pickers.
def change_date(request):
    if not request.GET:
        print(f'{request.GET} is empty, redirecting to index')
        return HttpResponseRedirect(reverse("index"))
    
    # Store what button was clicked and also checkin and checkout dates from the form.
    btn = request.GET['btn']
    form_chin = datetime.strptime(request.GET['chin'], '%Y-%m-%d').date()
    form_chout = datetime.strptime(request.GET['chout'], '%Y-%m-%d').date()

    # Define day, today, tomorrow and duration.
    duration = (form_chout - form_chin).days
    today = datetime.now().date()
    day = timedelta(days=1)
    tomorow = (datetime.now().date() + day)

    # new_date calculation logic.
    if btn == 'chin-' and form_chin > today: new_date = (form_chin - day).strftime('%Y-%m-%d')
    elif btn == 'chin-': new_date = today.strftime('%Y-%m-%d')
    elif btn == 'chin': new_date = (form_chin + day).strftime('%Y-%m-%d')
    elif btn == 'chout-' and form_chout > tomorow: new_date = (form_chout - day).strftime('%Y-%m-%d')
    elif btn == 'chout-': new_date = tomorow.strftime('%Y-%m-%d')
    elif btn == 'chout': new_date = (form_chout + day).strftime('%Y-%m-%d')

    # Send back new_date and duration in a JSON.
    return JsonResponse({'new_date': new_date, 'duration': duration}, safe=False)


# Search rooms based on the form data.
@csrf_exempt
def search(request):
    if not request.GET:
        print(f'{request.GET} is empty, redirecting to index')
        return HttpResponseRedirect(reverse("index"))
    
    # Extract and check data from search form.
    if not request.GET['chin']: return JsonResponse({'message': 'Select Checkin date.'})
    else: req_chin = datetime.strptime(request.GET['chin'], '%Y-%m-%d').date()
    if req_chin < datetime.now().date(): return JsonResponse({'message': 'Checkin can not be in the past'})
    if not request.GET['chout']: return JsonResponse({'message': 'Select Checkout date.'})
    else: req_chout = datetime.strptime(request.GET['chout'], '%Y-%m-%d').date()

    # Get duration.
    duration = (req_chout - req_chin).days
    if not request.GET['pers_num']: return JsonResponse({'message': 'Enter number of guests.'})
    else: pers_num: pers_num = int(request.GET['pers_num'])
    req_room = request.GET['req_room']
    if req_room: req_room = int(request.GET['req_room'])
    if req_chin >= req_chout:
        return JsonResponse({'message': 'Invalid Checkin/Checkout dates.'})
    
    # Query db and filter out the rooms not suitable for the request.
    if req_room:
        rooms = Room.objects.filter(pk=req_room).exclude(bed_num__lt=pers_num)
    else:
        rooms = Room.objects.exclude(bed_num__lt=pers_num)
    conflicting_res = Reservation.objects.filter(
        checkin__lt=req_chout,
        checkout__gt=req_chin
    )
    if conflicting_res:
        rooms = rooms.exclude(reservation__in=conflicting_res)

    # Add duration to the list of selected rooms.
    rooms_list = []
    for room in rooms:
        room = room.serialize()
        room.update({'duration': duration})
        rooms_list.append(room)

    # Return the data.
    return JsonResponse(rooms_list, safe=False)


# Return the selected room data based on the form request.
def room(request, room_id):
    if not request.GET:
        print(f'{request.GET} is empty, redirecting to index')
        return HttpResponseRedirect(reverse("index"))
    
    # Get the room from the database.
    room = Room.objects.get(pk=room_id)

    # Convert JS dates from the form to the Python datetime objects. Calculate the duration.
    req_chin = datetime.strptime(request.GET['chin'], '%Y-%m-%d').date() 
    req_chout = datetime.strptime(request.GET['chout'], '%Y-%m-%d').date()
    duration = (req_chout - req_chin).days

    # Add the requested duration to the room object.
    room = room.serialize()
    room.update({'duration': duration})

    # Return the data.
    return JsonResponse(room, safe=False)


# Create the reservation.
@csrf_exempt
@login_required()
def reserve(request, room_id):
    if request.method != 'POST':
        return HttpResponseRedirect(reverse('index'))
    
    # Get data from the POST request.
    data = json.loads(request.body)
    
    # Convert str to date objects.
    chin = datetime.strptime(data['chin'], '%Y-%m-%d').date()
    chout = datetime.strptime(data['chout'], '%Y-%m-%d').date()

    # Check if checkin is in the past.
    if chin < datetime.now().date() or chout < datetime.now().date():
        print('Checkin or Checkout date can not be in the past')
        return JsonResponse('Checkin or Checkout date can not be in the past', safe=False)
    
    # Check the requested period and room for availability.
    requested_room = Room.objects.get(pk=room_id)
    for reservation in requested_room.reservations.all():
        if (chin >= reservation.checkin and chin < reservation.checkout or
            chout > reservation.checkin and chout <= reservation.checkout or
            chin < reservation.checkin and chout > reservation.checkout):
            print('These dates are not available')

            # Return the response with the message.
            return JsonResponse('These dates are not available', safe=False)
        else: print('No dates conflict')

    # Check if room has enough beds.
    if data['pers_num'] > requested_room.bed_num:
        print('Requested room does not have enough beds')
        return JsonResponse('Requested room does not have enough beds', safe=False)
    
    # Create the reservation and add it to the room and user.
    duration = (chout - chin).days
    total = round(requested_room.price * duration, 2)
    user = request.user
    reservation = Reservation(
        guest=user,
        room=requested_room,
        checkin=chin, 
        checkout=chout,
        duration=duration,
        total=total)
    reservation.save()
    requested_room.reservations.add(reservation)
    user.reservations.add(reservation)

    # Return the response with the message. 
    return JsonResponse('Reservation Successful', safe=False )



# Return the user's existing reservations.
@login_required()
def my_reservations(request):
    reservations = Reservation.objects.filter(guest=request.user)
    return JsonResponse([res.serialize() for res in reservations], safe=False)


# Return the selected reservation.
@login_required()
def select_res(request, res_id):
    res = Reservation.objects.get(pk=res_id)
    return JsonResponse(res.serialize(), safe=False)


# Cancel the reservation.
@csrf_exempt
@login_required()
def cancel_res(request, res_id):
    if request.method != 'POST':
        return HttpResponseRedirect(reverse('index'))
    
    # Get data from the POST request.
    data = json.loads(request.body)

    # Get data from the database.
    reservation = Reservation.objects.get(pk=data['id'])
    user = request.user
    room = Room.objects.get(pk=data['room_id'])

    # Check if this user is the res creator.
    if reservation.guest != user:
        print('You are not authorized to cancel this reservation')
        return JsonResponse('You are not authorized to cancel this reservation', safe=False)
    
    # Remove the reservation from the user and room models.
    user.reservations.remove(reservation)
    room.reservations.remove(reservation)

    # Delete the reservation itself.
    reservation.delete()

    # Return the response with the message.
    return JsonResponse('Reservation Canceled', safe=False)


# Authentication.


# Login.
def login_view(request):

    # If the request is not POST.
    if request.method != "POST":

        # Logout the user if user is already logged in.
        if request.user.is_authenticated:
            logout(request)
        return render(request, "reservation/login.html")

    # Get the form data.
    username = request.POST["username"]
    password = request.POST["password"]

    # Check the user and password.
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "reservation/login.html", {
            "message": "Invalid username and/or password."
        })
    

# Logout.
def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


# Registration.
def register(request):

    # If the request is not POST.
    if request.method != "POST":
        if request.user.is_authenticated:
            logout(request)
        return render(request, "reservation/register.html")

    # Get the registration form data.
    username = request.POST["username"]
    email = request.POST["email"]
    password = request.POST["password"]
    confirmation = request.POST["confirmation"]
    if password != confirmation:
        return render(request, "reservation/register.html", {
            "message": "Passwords must match."
        })
    
    # Try creating a new user.
    try:
        user = User.objects.create_user(username, email, password)
        user.save()

    # If error.
    except IntegrityError:
        return render(request, "reservation/register.html", {
            "message": "Username already taken."
        })
    
    # Login the user and navigate to the home page.
    login(request, user)
    return HttpResponseRedirect(reverse("index"))
    
    
