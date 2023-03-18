document.addEventListener('DOMContentLoaded', function () {
    // Navigation
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
    // By default show 'search'
    search()

    // Change dates with buttons and remove results if clicked
    document.querySelectorAll('.change-date').forEach(btn => {
        btn.onclick = async function() {
            if (document.querySelector('#checkout').value &&
            document.querySelector('#checkin').value && 
            document.querySelector('#pers_num').value) {
                let chin = document.querySelector('#checkin').value
                let chout = document.querySelector('#checkout').value
                await fetch(`change_date?btn=${btn.id}&chin=${chin}&chout=${chout}`)
                .then(response => response.json())
                .then(data => {
                    if (btn.id.slice(0, 4) === 'chin') {document.querySelector('#checkin').value = data['new_date']}
                    else if (btn.id.slice(0, 5) === 'chout') {document.querySelector('#checkout').value = data['new_date']}
                })   
                search()
            }
        }
    })
    // Reset search on change in form
    document.querySelectorAll('input, select').forEach(input => {
        input.onchange = search
    })

    // Search available dates for a selected room
    document.querySelectorAll('.search-title').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('#req_room').value = btn.id.slice(-1)
            search()
        } )
    })
})

// Helper functions

function create_room_div(room) {
    console.log(room.img)
    let room_div = document.createElement('div')
    room_div.classList.add('room-item','rounded', 'border', 'border-secondary', 'my-5', 'border-opacity-25')
    total = (room.price * room.duration).toFixed(2)
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

function remove_results() {
    let elements = document.querySelectorAll('#results-div > *')
    for (let e of elements) {e.remove()}
    return
}

function remove_room() {
    room_del = document.querySelectorAll('#room-div > *')
    for (r of room_del) {r.remove()}
}

function remove_reservations() {
    res_del = document.querySelectorAll('#my_reservations-div > *')
    for (r of res_del) {r.remove()}
}

function remove_res() {
    res_del = document.querySelectorAll('#select_res-div > *')
    for (r of res_del) {r.remove()}
}


async function query_db() {
    remove_results()
    remove_room()
    let title = document.createElement('h2')
    title.classList.add('display-6', 'my-3')
    title.innerHTML = 'Available Rooms:'
    title.id = 'available-rooms'
    document.querySelector('#results-div').prepend(title)
    // Fetch search request
    let chin = document.querySelector('#checkin').value
    let chout = document.querySelector('#checkout').value
    let pers_num = document.querySelector('#pers_num').value
    let req_room = document.querySelector('#req_room').value
    await fetch(`search?chin=${chin}&chout=${chout}&pers_num=${pers_num}&req_room=${req_room}`)
    .then(response => response.json())
    .then(rooms => {
        if (rooms.length > 0) {
            for (r of rooms) {
                let room_div = create_room_div(r)
                document.querySelector('#results-div').append(room_div)
            }
        } else {title.innerHTML = 'No Rooms Available with Selected Parameters'}
    })
    console.log('Results Updated')
}

// Primary functions

function search() {
    // Show 'search
    document.querySelector('#search-div').style.display = 'block'
    document.querySelectorAll('#results-div, #rooms-div, #my_reservations-div, #room-div, #select_res-div').forEach(div => {
        div.style.display = 'none'
    })
    remove_results()
    remove_room()
    remove_reservations()
    remove_res()
}

async function results() {
    document.querySelectorAll('#rooms-div, #my_reservations-div, #select_res-div, #room-div').forEach(div => {
        div.style.display = 'none'
    })
    document.querySelector('#results-div').style.display = 'block'
    if (document.querySelector('#checkout').value &&
    document.querySelector('#checkin').value && 
    document.querySelector('#pers_num').value) {
        await query_db()
        document.querySelectorAll('.descr').forEach(descr => descr.style.display = 'none')
        document.querySelector('#available-rooms').scrollIntoView(true)
    } else (console.log('Fill the search form'))
}


async function select_room(room) {
    document.querySelectorAll('#search-div, #results-div, #room-div, #my_reservations-div, #select_res-div').forEach(div => {
        div.style.display = 'none'
    })
    document.querySelector('#room-div').style.display = 'block'
    remove_results()
    let title = document.createElement('h2')
    title.classList.add('display-6', 'my-3')
    title.innerHTML = 'Your Selection'
    title.id = 'your-selection'
    document.querySelector('#room-div').prepend(title)

    // Grab dates from the form
    let chin = document.querySelector('#checkin').value
    let chout = document.querySelector('#checkout').value
    await fetch(`room/${parseInt(room.id)}?chin=${chin}&chout=${chout}`)
    .then(response => response.json())
    .then(room => {
        // Create div
        let room_div = create_room_div(room)
        document.querySelector('#room-div').append(room_div)
        // Create btn
        let reserve_btn = document.createElement('button')
        reserve_btn.classList.add('btn', 'mb-5', 'btn-success')
        reserve_btn.innerHTML = 'Reserve'
        document.querySelector('#room-div').append(reserve_btn)
        // Attach 'reserve' function
        reserve_btn.addEventListener('click', () => {reserve(room)}) 
    })
    document.querySelector('#your-selection').scrollIntoView(true)
}


async function reserve(room) {
    await fetch(`room/${room.id}/reserve`, {
        method: 'POST',
        body: JSON.stringify({
            chin: document.querySelector('#checkin').value,
            chout: document.querySelector('#checkout').value,
            pers_num: parseInt(document.querySelector('#pers_num').value),
            req_room: parseInt(room.id)
        })
    })
    .then(response => response.json())
    .then(response => {console.log(response)})
    await my_reservations()
}

async function rooms() {
    // Show all rooms
    document.querySelector('#rooms-div').style.display = 'block'
    document.querySelectorAll('#search-div, #results-div, #my_reservations-div, #room-div, #select_res-div').forEach(div => {
        div.style.display = 'none'
        remove_room()
        remove_results()
        remove_reservations()
        remove_res()
    })
}


async function my_reservations() {
    // Show my_reservations
    document.querySelector('footer').style.display = 'none'
    document.querySelector('#my_reservations-div').style.display = 'block'
    document.querySelectorAll('#search-div, #results-div, #rooms-div, #room-div, #select_res-div').forEach(div => {
        div.style.display = 'none'
    })
    remove_room()
    remove_results()
    remove_reservations()
    remove_res()
    await fetch('my_reservations')
    .then(response => response.json())
    .then(reservations => {
        let title = document.createElement('h2')
        title.innerHTML = 'My Reservations'
        title.classList.add('display-6', 'my-3')
        document.querySelector('#my_reservations-div').prepend(title)
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
    document.querySelector('footer').style.display = 'block'
}


async function select_res(res) {
    document.querySelector('footer').style.display = 'none'
    document.querySelectorAll('#search-div, #results-div, #rooms-div, #room-div, #my_reservations-div').forEach(div => {
        div.style.display = 'none'
    })
    document.querySelector('#select_res-div').style.display = 'block'
    remove_reservations()
    await fetch('my_reservations/' + res.id)
    .then(response => response.json())
    .then(res => {
        // Create div
        let sel_res_div = document.createElement('div')
        sel_res_div.classList.add('sel-res-item','rounded', 'border', 'border-secondary', 'my-3', 'border-opacity-25')
        sel_res_div.innerHTML = `<img class="img-fluid rounded-top" src="media/${res.room_img}"><br>
        <h5 class="card-title mt-4">${res.room_title}</h5>Beds: ${res.room_bed_num}<br>
        ${res.checkin} - ${res.checkout}<br>
        <strong>\$${res.total}</strong> for ${res.duration} nights<br>
        <p class='p-4'>${res.room_description.replaceAll('\n', '<br>')}</p>`
        document.querySelector('#select_res-div').append(sel_res_div)
        // Create btn
        let cancel_btn = document.createElement('button')
        cancel_btn.classList.add('btn', 'btn-warning', 'my-5')
        cancel_btn.innerHTML = 'Cancel Reservation'
        document.querySelector('#select_res-div').append(cancel_btn)
        // Attach 'cancel' function
        cancel_btn.addEventListener('click', () => {cancel_res(res)})
    })
    document.querySelector('.sel-res-item').scrollIntoView(true)
    document.querySelector('footer').style.display = 'block'
}


async function cancel_res(res) {
    await fetch(`my_reservations/${res.id}/cancel_res`, {
        method: 'POST',
        body: JSON.stringify(res)
    })
    .then(response => response.json())
    .then(response => {console.log(response)})
    my_reservations()
}