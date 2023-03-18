# Reservation
#### Video Demo: <URL https://youtu.be/WBswewsr21I>
## Description:
### Summary

"Reservation" is a single-page hotel booking app that allows users to browse through various room options, search for available dates, make and cancel reservations. At the top of the index page there are 3 main navigation buttons: Find Stay, All Rooms and My Reservations. "Find Stay" view contains a form for submitting requests and a container for search results. Clicking on a search result opens a description for the selected room and shows a button to reserve the room. "All Rooms" section presents all the hotel's rooms with a button to search dates for a preferred room. "My Reservations" view lists all reservations made by the logged in user. Clicking a reservation shows room description and a button to cancel it. Clicking on the "Reservation" page title reloads the page and resets the search form.

### Distinctiveness
After practicing with TextFields, IntegerFields and BooleanFields in this course's projects I decided to take a closer look at DateTimeField, which we touched only briefly by using the auto_now_add=True argument. Thus, Django's DateField field and Python's datetime module became the focus of my final project and hotel booking was chosen as the project's theme, which is different from other course's exercises. Among distinct features are the logic for converting strings to date objects and vice versa, comparing date objects, using timedelta to calculate total duration of stay and display total reservation price. In addition, I used ImageField in my "Room" model instead of URLField and learned how to serialize it with str(). I also decided to practice fetching using url's query string and utilizing the Query Dict on the server side. I tried my best to create an appealing design to make my work stand out.

### Complexity

#### Server
As for server-side complexity, smart filtering is applied to every user's search request. The search form's input values are processed and only available rooms are presented to the user, i.e. already booked rooms for selected dates and rooms with not enough beds for requested number of guests will not be shown. Similar logic is applied when a user clicks the "Reserve" button. Server refuses to create a reservation if its checkin/checkout dates overlap with dates of another one. Another server-side check protects against canceling reservations not belonging to the logged in user. Thus, even by exploiting exposed url paths in javascript code potential adversaries will not be able to delete someone else's bookings. Server also will not accept past checkin/checkout dates.

#### Client
As for the client side, database security is improved by not assigning database ids to divs and buttons. Thus it is harder to send a malicious POST request. In addition to the date picker inputs, 4 buttons were implemented for a quick increase/decrease of dates. These buttons will not change "Checkin" to earlier than today and "Checkout" earlier than tomorrow. After initial loading of the app the "Checkin" and "Checkout" search form inputs are automatically filled with today's and tomorrow's dates respectively. Changing any search parameters removes all search results. While browsing through the "All Rooms" view user can click the "Search Available Dates" button. After clicking on it user is taken to the Find Stay view with the preferred room already selected in the form. When user clicks on the "Search" button the screen automatically scrolls down to the search results. The same feature is implemented for clicking on a particular search result or reservation. Smooth animation using css opacity property is added for switching between app views. 

### Created Files:

- media/images/Beach_Front_Villa.jpg - a photo for Room's ImageField
- media/images/Garden_View_Bungalow.jpg - a photo for Room's ImageField
- media/images/Suite_with_Pool_View.jpg - a photo for Room's ImageField
- media/images/Villa_with_Private_Pool.jpg - a photo for Room's ImageField
- reservation/static/reservation/script.js - this file contains all javascript code for the project. It's responsible for features described in the "Client" paragraph.
- reservation/static/reservation/shore_blurred.jpg - background image for the app
- reservation/static/reservation/styles.css - this file contains css properties for different elements, ids and classes
- reservation/templates/reservation/index.html - the main page of the application
- reservation/templates/reservation/layout.html - this is the base template for all html files
- reservation/templates/reservation/login.html - page for loggin in
- reservation/templates/reservation/register.html - page for registering new users
- reservation/forms.py - this file contains the search form used on the index.html page
- reservation/models.py - this file contains all the Django models used in the project
- reservation/urls.py - this file contains all urlpatterns
- reservation/views.py - this file contains all server-side logic of the app
- requirements.txt - Python packages that need to be installed in order to run the web application

### How to run the application

Before running the app install Pillow by running the following command in the terminal:
    python -m pip install Pillow
To run the app in your terminal navigate to the project's main directory and run the following command to start server:
    python manage.py runserver
In your browser go to the url suggested by the terminal . You will be brought to the login screen.

### Additional Information

You are welcome to test the search algorithm by creating some reservations and then searching again for the same or other conflicting dates for the same room. You are also welcome to test if a reservation can be canceled by sending fetch POST request using the console with an altered reservation id. The same technique may tried used to reserve rooms for unavailable dates.

