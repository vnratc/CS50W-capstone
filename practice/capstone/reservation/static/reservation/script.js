document.addEventListener('DOMContentLoaded', function () {
    
    // Navigation.
    document.querySelector('#search').addEventListener('click', () => {
        search()
    })
    document.querySelector('#search-btn').addEventListener('click', () => {
        results()
    })
    document.querySelector('#rooms').addEventListener('click', () => {
        rooms()
    })
    document.querySelector('#my_reservations').addEventListener('click', () => {
        my_reservations()
    })

    // By default show 'search'.
    search()

    // Change dates with buttons and remove results if clicked.
    document.querySelectorAll('.change-date').forEach(btn => {
        btn.addEventListener("click", () => {
            changeDateClick(btn)
        })
    })

    // Reset search results on any change in the form.
    document.querySelectorAll('input, select').forEach(input => {
        input.onchange = search
    })

    // Search available dates for the selected room from the "All Rooms" view.
    const roomsToSelect = document.querySelectorAll('.search-title')
    roomsToSelect.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('#req_room').value = btn.id.slice(-1)  // This -1 is going to be a problem if number of rooms is greater than 9
            search()
        } )
    })
})


// Helper functions


// Change dates in datepickers after clicking < or > (less or greater than buttons).
const changeDateClick = async (btn) => {

    // Stop if there are no values in the form.
    if (!document.querySelector('#checkout').value &&
        !document.querySelector('#checkin').value && 
        !document.querySelector('#pers_num').value)
        {return}
    
    // Store checkin and checkout dates.
    let chin = document.querySelector('#checkin').value
    let chout = document.querySelector('#checkout').value

    // Fetch dates to the backend for conversion and actual change.
    await fetch(`change_date?btn=${btn.id}&chin=${chin}&chout=${chout}`)
    .then(response => response.json())
    .then(data => {

        // Substitute old date with a new date.
        if (btn.id.slice(0, 4) === 'chin') {document.querySelector('#checkin').value = data['new_date']}
        else if (btn.id.slice(0, 5) === 'chout') {document.querySelector('#checkout').value = data['new_date']}
    })
    search()
}


// Create a div for a room with its data.
function create_room_div(room) {
    let room_div = document.createElement('div')
    room_div.classList.add('room-item','rounded', 'border', 'border-secondary', 'my-5', 'border-opacity-25')
    
    // Calculate total price.
    total = (room.price * room.duration).toFixed(2)

    // Fill the div with data.
    room_div.innerHTML = `<img class="img-fluid rounded-top" src="media/${room.img}"><br>
    <h5 class="card-title mt-4">${room.title}</h5><br>
    <p class="mb-3">
    ${document.querySelector('#checkin').value} - ${document.querySelector('#checkout').value}<br>
    Total price for ${room.duration} nights: <strong>\$${total}</strong><br>
    Price per night: \$${room.price.toFixed(2)}<br>
    Beds: ${room.bed_num}
    </p>
    <p class='px-4 descr'>${room.description.replaceAll('\n', '<br>')}</p>`
    room_div.addEventListener('click', () => select_room(room))

    return room_div
}


// Utility function to hide unwanted views (to remove unwanted divs).
const remove_elements = (selectors) => {
    let divsToClear = document.querySelectorAll(selectors)
    for (let element of divsToClear) {element.remove()}
}


// Query database for room availability.
async function query_db() {

    // Hide unwanted and show the requested views.
    remove_elements("#results-div > *, #room-div > *")

    let title = document.createElement('h2')
    title.classList.add('display-6', 'my-3')
    title.innerHTML = 'Available Rooms:'
    title.id = 'available-rooms'
    document.querySelector('#results-div').prepend(title)

    // Store form data in variables.
    let chin = document.querySelector('#checkin').value
    let chout = document.querySelector('#checkout').value
    let pers_num = document.querySelector('#pers_num').value
    let req_room = document.querySelector('#req_room').value

    // Fetch search request with the form data.
    await fetch(`search?chin=${chin}&chout=${chout}&pers_num=${pers_num}&req_room=${req_room}`)
    .then(response => response.json())
    .then(rooms => {

        // If no available rooms found.
        if (rooms.length === undefined) {
            title.innerHTML = 'No Rooms Available with Selected Parameters'
            return
        }

        // Fill the div with the search results.
        for (r of rooms) {
            let room_div = create_room_div(r)
            document.querySelector('#results-div').append(room_div)
        }
    })
    console.log('Results Updated')
}


// Primary functions.


// Show search form.
function search() {
    
    // Hide unwanted and show the requested views.
    document.querySelector('#search-div').style.display = 'block'
    document.querySelectorAll('#results-div, #rooms-div, #my_reservations-div, #room-div, #select_res-div').forEach(div => {
        div.style.display = 'none'
    })
    remove_elements("#results-div > *, #room-div > *, #my_reservations-div > *, #select_res-div > *")
}


// Show search results.
async function results() {

    // Hide unwanted and show the requested views.
    document.querySelectorAll('#rooms-div, #my_reservations-div, #select_res-div, #room-div').forEach(div => {
        div.style.display = 'none'
    })
    document.querySelector('#results-div').style.display = 'block'

    // If there are required values in the form inputs.
    if (document.querySelector('#checkout').value &&
    document.querySelector('#checkin').value && 
    document.querySelector('#pers_num').value) {

        // Fetch data from server.
        await query_db()

        // Hide room description.
        document.querySelectorAll('.descr').forEach(descr => descr.style.display = 'none')

        // Scroll down to the results.
        document.querySelector('#available-rooms').scrollIntoView(true)
    } else (console.log('Fill the search form'))
}


// Click on a room from search results.
async function select_room(room) {

    // Hide unwanted and show the requested views.
    document.querySelectorAll('#search-div, #results-div, #room-div, #my_reservations-div, #select_res-div').forEach(div => {
        div.style.display = 'none'
    })
    document.querySelector('#room-div').style.display = 'block'
    remove_elements("#results-div > *")

    // Create a div with required attributes.
    let title = document.createElement('h2')
    title.classList.add('display-6', 'my-3')
    title.innerHTML = 'Your Selection'
    title.id = 'your-selection'
    document.querySelector('#room-div').prepend(title)

    // Get dates from the form
    let chin = document.querySelector('#checkin').value
    let chout = document.querySelector('#checkout').value

    // Fetch server for the room data.
    await fetch(`room/${parseInt(room.id)}?chin=${chin}&chout=${chout}`)
    .then(response => response.json())
    .then(room => {

        // Create a div for the fetched data.
        let room_div = create_room_div(room)
        document.querySelector('#room-div').append(room_div)
        
        // Create a button to reserve the room.
        let reserve_btn = document.createElement('button')
        reserve_btn.classList.add('btn', 'mb-5', 'btn-success')
        reserve_btn.innerHTML = 'Reserve'
        document.querySelector('#room-div').append(reserve_btn)
        
        // Attach 'reserve' function to the div.
        reserve_btn.addEventListener('click', () => {reserve(room)}) 
    })

    // Scroll down to the selection.
    document.querySelector('#your-selection').scrollIntoView(true)
}


// Reserve the room.
async function reserve(room) {

    // Send POST request to create a new reservation with the requested parameters.
    await fetch(`room/${room.id}/reserve`, {
        method: 'POST',
        body: JSON.stringify({
            chin: document.querySelector('#checkin').value,
            chout: document.querySelector('#checkout').value,
            pers_num: parseInt(document.querySelector('#pers_num').value),
            req_room: parseInt(room.id)
        })
    })

    // Print the result of the sent request.
    .then(response => response.json())
    .then(response => {console.log(response)})

    // Show "My Reservations" view.
    await my_reservations()
}


// Show all rooms.
async function rooms() {

    // Hide unwanted and show the requested views.
    document.querySelector('#rooms-div').style.display = 'block'
    document.querySelectorAll('#search-div, #results-div, #my_reservations-div, #room-div, #select_res-div').forEach(div => {
        div.style.display = 'none'
        remove_elements("#results-div > *, #room-div > *, #my_reservations-div > *, #select_res-div > *")
    })
}


// Show "My Reservations" view. 
async function my_reservations() {

    // Hide unwanted and show the requested views.
    document.querySelector('footer').style.display = 'none'
    document.querySelector('#my_reservations-div').style.display = 'block'
    document.querySelectorAll('#search-div, #results-div, #rooms-div, #room-div, #select_res-div').forEach(div => {
        div.style.display = 'none'
    })
    remove_elements("#results-div > *, #room-div > *, #my_reservations-div > *, #select_res-div > *")

    // Fetch server for user's existing reservations.
    await fetch('my_reservations')
    .then(response => response.json())
    .then(reservations => {

        // Create the title for a reservation.
        let title = document.createElement('h2')
        title.innerHTML = 'My Reservations'
        if (!reservations.length) {
            title.innerHTML = "You have no existing reservations"
        }
        title.classList.add('display-6', 'my-4')
        document.querySelector('#my_reservations-div').prepend(title)

        // For every reservation create a div and fill it with data from database.
        for (res of reservations) {
            let res_div = document.createElement('div')
            res_div.classList.add('res-item','rounded', 'border', 'border-secondary', 'my-5', 'border-opacity-25')
            res_div.innerHTML = `<img class="img-fluid rounded-top" src="media/${res.room_img}"><br>
            <h5 class="card-title mt-4">${res.room_title}</h5>
            <p class="mb-4">
            Beds: ${res.room_bed_num}<br>
            ${res.checkin} - ${res.checkout}<br>
            <strong>\$${res.total}</strong> for ${res.duration} nights<br>
            </p>`
            res_div.addEventListener('click', () => select_res(res))
            document.querySelector('#my_reservations-div').append(res_div)
        }
    })

    // footer is hidden and then shown to prevent objects on the page from jumping and stuttering.
    document.querySelector('footer').style.display = 'block'
}



async function select_res(res) {

    // Hide unwanted and show the requested views.
    document.querySelector('footer').style.display = 'none'
    document.querySelectorAll('#search-div, #results-div, #rooms-div, #room-div, #my_reservations-div').forEach(div => {
        div.style.display = 'none'
    })
    document.querySelector('#select_res-div').style.display = 'block'
    remove_elements("#my_reservations-div > *")

    // Request the details of the selected reservation.
    await fetch('my_reservations/' + res.id)
    .then(response => response.json())
    .then(res => {

        // Create a div for every existing reservation and fill it with the data.
        let sel_res_div = document.createElement('div')
        sel_res_div.classList.add('sel-res-item','rounded', 'border', 'border-secondary', 'my-3', 'border-opacity-25')
        sel_res_div.innerHTML = `<img class="img-fluid rounded-top" src="media/${res.room_img}"><br>
        <h5 class="card-title mt-4">${res.room_title}</h5>
        Beds: ${res.room_bed_num}<br>
        ${res.checkin} - ${res.checkout}<br>
        <strong>\$${res.total}</strong> for ${res.duration} nights<br>
        <p class='p-4'>${res.room_description.replaceAll('\n', '<br>')}</p>`
        document.querySelector('#select_res-div').append(sel_res_div)

        // Create a button to cancel reservation.
        let cancel_btn = document.createElement('button')
        cancel_btn.classList.add('btn', 'btn-warning', 'my-5')
        cancel_btn.innerHTML = 'Cancel Reservation'
        document.querySelector('#select_res-div').append(cancel_btn)
        cancel_btn.addEventListener('click', () => {cancel_res(res)})
    })

    // Scroll down to the reservation div.
    document.querySelector('.sel-res-item').scrollIntoView(true)
    document.querySelector('footer').style.display = 'block'
}


// Cancel reservation
async function cancel_res(res) {

    // Send the POST request to cancel the reservation.
    await fetch(`my_reservations/${res.id}/cancel_res`, {
        method: 'POST',
        body: JSON.stringify(res)
    })
    .then(response => response.json())
    .then(response => {console.log(response)})

    // Show "My Reservations" view.
    my_reservations()
}