const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get('id');

let displayName = "";

document.getElementById('rollButton').addEventListener('click', (event) => {
    // event.preventDefault();

    const displayTargetMain = document.getElementById('result');

    document.getElementById('specifiedLeft').innerText = ''
    document.getElementById('specifiedRight').innerText = ''

    if (displayName == "") {
        displayTargetMain.innerText = "Enter a Display Name"
        displayTargetMain.style.color = "#c71010"
        return;
    } else {
        displayTargetMain.innerText = "Rolling ..."
        displayTargetMain.style.color = "#ebe6da"
    }

    const data = { id: id, displayName: displayName };

    fetch('/api/roll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: data })
    })
    .then(response => response.json())
    .then(data => {
        displayTargetMain.innerText = data.percent;
        document.getElementById('specifiedLeft').innerText = data.dice[0]
        document.getElementById('specifiedRight').innerText = data.dice[1]
    })
});

function UpdateDisplayName() {
    displayName = document.getElementById('username').value;
    SaveToCookie();
}

// --- Global

var useHours = false;


function SetCookie(name, value, daysToExpire) {
    // Set expiration date to x amount of days after today
    const date = new Date();
    date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));

    // Format expiration string
    const expires = "expires=" + date.toUTCString();

    // Set the cookie
    document.cookie = `${name}=${value};${expires};path=/`;
}

function GetCookie(name) {
    // Format cookie name
    const cookieName = name + '=';

    // Get all cookies and split into an array
    const cookies = document.cookie.split(';')

    for (let index = 0; index < cookies.length; index++) {
        const cookie = cookies[index];
        
        // If cookie has leading white spaces, remove them
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }

        // Find cookie of right name
        if (cookie.indexOf(cookieName) == 0) {

            // Get only the value of cookie by trimming the name
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return "";
}

// --- Selection

// Save values to a cookie for saving the state and continuing from where the user left off
function SaveToCookie() {
    const jsonObject = {
        displayName: displayName,
    };

    const jsonString =  JSON.stringify(jsonObject);

    SetCookie('SavedSelection', jsonString, 7);
}

// Load saved values from cookie
function LoadFromCookie() {
    const cookieValue = GetCookie('SavedSelection');

    // If cookie value is empty, no cookie was found. We should return
    if (cookieValue == "" || !cookieValue)
        return;

    const value = JSON.parse(cookieValue);

    displayName = value.displayName
    document.getElementById('username').value = value.displayName
}

// Call function once to set values
document.addEventListener('DOMContentLoaded', LoadFromCookie);