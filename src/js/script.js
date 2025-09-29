import { userList, filterArray, sortArray, generateId, findInArray } from "./app.js";

let tablePage = 1;
let key = null;
let order = null;

let userArray = [];

const filters = {
    country: ["Australia"],
    ageRange: [18, 25],
    gender: "male",
    favorite: true,
    hasPhoto: true
};
let teacher = {};

addEventListener('DOMContentLoaded', () => {
    
    userArray = fetchData(50);
    console.log(userArray);
    //fetchData();
    loadData();
    initListener();
});

/*
Завдання 1. Зробити запит за списком користувачів https://randomuser.me/api.
Повертаючи 50 користувачів. 
*/
function fetchData(userNum) {
    const users = [];
    fetch(`https://randomuser.me/api/?results=${userNum}`)      //why when I tried to add per 1 user I had cors error?
            .then(response => response.json())
            .then(data => data.results.forEach(user => users.push(user)))
            .catch(error => console.log(error));

    return users;
}

function initListener() {
    const body = document.querySelector('body');
    const dialog = document.querySelector("#add-teacher-dialog");
    const teacherCard = document.querySelector("#teacher-info");

    const main = document.querySelector("main");
    const searchResults = document.querySelector("#search-results");
    const searchResultsGrid = document.querySelector("#search-results-grid"); 

    body.addEventListener('click', (event) => {
        let target = event.target;
        
        if (target.getAttribute('class') === 'add-teacher' || target.getAttribute('class') === 'close-dialog') {
            toggleAddTeacherDialog(dialog);
        }
        else if (target.id == "add-teacher") {
            addTeacher(dialog);
        }
        else if (target.getAttribute('class') === "page") {
            tablePage = target.getAttribute('data-page');
            loadTable();
        }
        else if (target.classList.contains("filter")) {
            updateFilters();
            loadTopTeachers();
        }
        else if (target.classList.contains("sort")) {
            key = target.getAttribute('id');
            order = target.getAttribute('data-order');
            target.setAttribute('data-order', order === "asc" ? "desc" : "asc");
            loadTable();
        }
        else if(target.classList.contains("teacher-card") || target.closest(".teacher-card")) {
            const cardElement = target.closest(".teacher-card");
            if (cardElement) {
                toggleTeacherDialog(teacherCard, cardElement);
            }
        }
        else if(target.classList.contains("close-card")) {
            toggleAddTeacherDialog(teacherCard);
        }
        else if(target.id === "search-input") {
            main.classList.add("hidden");
            searchResults.classList.remove("hidden");
        }
        else if(target.id === "search-btn") {
            searchTeachers(searchResultsGrid);
        }
        else if(target.classList.contains("teacher-favorite") || target.closest(".teacher-favorite")) {
            const favoriteElement = target.closest(".teacher-favorite") || target;
            toggleFavorite(favoriteElement);
        }
        else if(target.id === "exit-search-btn") {
            searchResultsGrid.innerHTML = "";
            searchResults.classList.add("hidden");
            main.classList.remove("hidden");
        }
        else if(target.classList.contains("star")) {
            toggleFavoriteStar(target);
        }
    });
}

function toggleFavoriteStar(starElement) {
    const teacherCard = starElement.closest(".teacher-card");
    const teacherId = teacherCard.getAttribute("data-teacher-id");

    const teacher = userList.find(t => t.id == teacherId);
    if (teacher) {
        teacher.favorite = !teacher.favorite;
        starElement.setAttribute("data-favorite", teacher.favorite);
        loadFavorites();
        loadTopTeachers();
    }
}

function searchTeachers(searchResultsGrid) {
    const searchInput = document.querySelector("#search-input");

    let searchedTeachers = findInArray(userList, searchInput.value);
    console.log(searchedTeachers);

    let html = "";
    
    for (let user of searchedTeachers) {
        html += `<li class="teacher-card" data-teacher-id="${user.id}">`;
        
        html += `<span class="star" data-favorite="${user.favorite}"></span>`;
        
        if (user.picture_large) {
            html += `<img src="${user.picture_large}" alt="${user.full_name}">`;
        } else {
            html += `<div class="teacher-avatar" data-initials="${getInitials(user.full_name)}"></div>`;
        }
        
        html += `<h2 class="teacher-name">${user.full_name}</h2>`;
        html += `<p class="teacher-speciality">${user.course}</p>`;
        html += `<p class="teacher-origin">${user.country}</p>`;
        html += `</li>`;
    }
    
    searchResultsGrid.innerHTML = html;
}

function toggleFavorite(element) {
    const dialog = document.getElementById('teacher-info');
    const teacherId = dialog.getAttribute('data-teacher-id');
    
    if (!teacherId) return;
    
    const teacher = userList.find(t => t.id == teacherId);
    if (teacher) {
        teacher.favorite = !teacher.favorite;
        
        const favoriteButton = dialog.querySelector('.teacher-favorite');
        favoriteButton.setAttribute('data-favorite', teacher.favorite);
        favoriteButton.textContent = teacher.favorite ? "Remove from favorites" : "Add to favorites";
        
        const gridStar = document.querySelector(`.teacher-card[data-teacher-id="${teacherId}"] .star`);
        if (gridStar) {
            gridStar.setAttribute('data-favorite', teacher.favorite);
        }
        
        loadFavorites();
        loadTopTeachers();
    }
}

function toggleTeacherDialog(teacherCard, target) {
    const teacherId = target.getAttribute("data-teacher-id");
    const teacher = userList.find(t => t.id == teacherId);
    
    if (teacher) {
        populateTeacherDialog(teacherCard, teacher);
        teacherCard.toggleAttribute('open');
    }
}

function populateTeacherDialog(dialog, teacher) {
    dialog.setAttribute('data-teacher-id', teacher.id);
    
    dialog.querySelector(".teacher-name").textContent = teacher.full_name;
    dialog.querySelector(".teacher-speciality").textContent = teacher.course;
    dialog.querySelector(".teacher-origin").textContent = `${teacher.city || ''}, ${teacher.country}`.trim();
    dialog.querySelector(".teacher-age").textContent = `${teacher.age}, ${teacher.gender}`;
    dialog.querySelector(".teacher-email").textContent = teacher.email;
    dialog.querySelector(".teacher-phone").textContent = teacher.phone;
    dialog.querySelector(".teacher-notes").textContent = teacher.note || "No notes available";
    
    const favoriteButton = dialog.querySelector('.teacher-favorite');
    favoriteButton.setAttribute('data-favorite', teacher.favorite);
    favoriteButton.textContent = teacher.favorite ? "Remove from favorites" : "Add to favorites";
    favoriteButton.style.cursor = 'pointer';
    favoriteButton.style.color = 'var(--secondary-color)';
    
    const img = dialog.querySelector("img");
    if (teacher.picture_large) {
        img.src = teacher.picture_large;
        img.alt = teacher.full_name;
    } else {
        img.src = "images/default.jpg"; 
        img.alt = "Teacher";
    }
}

function toggleAddTeacherDialog(dialog) {
    dialog.toggleAttribute('open');
    
    if (!dialog.open) {
        const form = dialog.querySelector('form');
        form.reset();
    }
}

function getTeacherFormData(form) {
    const data = {};

    form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], input[type="date"], input[type="color"]').forEach(input => {
        if (!input.classList.contains("invisible")) {
            data[input.name] = input.value;
        }
    });

    form.querySelectorAll('select').forEach(select => {
        if (!select.classList.contains("invisible")) {
            data[select.name] = select.value;
        }
    });

    form.querySelectorAll('input[type="radio"]').forEach(radio => {
        if (radio.checked && !radio.closest(".invisible")) {
            data[radio.name] = radio.value;
        }
    });

    const notes = form.querySelector('textarea[name="teacher-notes"]');
    data[notes.name] = notes.value;

    return data;
}

function addTeacher(dialog) {
    const form = dialog.querySelector("form");
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const inputData = getTeacherFormData(form);
    
    const gender = inputData["teacher-sex"];
    const title = gender === "male" ? "Mr." : "Ms.";
    
    const newTeacher = {
        gender: gender,
        title: title,
        full_name: inputData["teacher-name"],
        city: inputData["teacher-city"],
        state: null,
        country: inputData["teacher-country"],
        postcode: null,
        coordinates: null,
        timezone: null,
        email: inputData["teacher-email"],
        b_date: convertDateInputToISO(inputData["teacher-birth"]),
        age: calculateAge(inputData["teacher-birth"]),
        phone: inputData["teacher-phone"],
        picture_large: null,
        picture_thumbnail: null,
        id: generateId(),
        favorite: false,
        course: inputData["speciality"],
        bg_color: inputData["teacher-color"],
        note: inputData["teacher-notes"]
    };
    
    userList.push(newTeacher);
    
    toggleAddTeacherDialog(dialog);
    loadData();
}

function calculateAge(birthDateString) {
    if (!birthDateString) return null;
    
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function convertDateInputToISO(dateString) {
    if (!dateString) return null;
    return new Date(dateString).toISOString();
}

function loadData() {
    loadTopTeachers();
    loadTable();
    loadFavorites();
}

function loadTable() {
    let sortedArray = key === null || order === null ? userList : sortArray(userList, key, order);

    let tbody = document.querySelector("tbody");
    let html = "";
    for (let i = (tablePage - 1) * 10; i < Math.min(tablePage * 10, sortedArray.length); i++) {
        const teacher = sortedArray[i];
        if (i >= sortedArray.length) {
            html += '<tr class="hidden">';
            html += `<td>lalala</td>`;
            html += `<td>lalala</td>`;
            html += `<td>lalala</td>`;
            html += `<td>lalala</td>`;
            html += `<td>lalala</td>`;
            html += "</tr>";
            break;
        }
        html += "<tr>";
        html += `<td>${teacher.full_name}</td>`;
        html += `<td>${teacher.course}</td>`;
        html += `<td>${teacher.age}</td>`;
        html += `<td>${formatDate(teacher.b_date)}</td>`;
        html += `<td>${teacher.country}</td>`;
        html += "</tr>";
    }
    tbody.innerHTML = html;

    loadTableNavigation();
}

function formatDate(date) {
    if (!date) return "Unknown";
    
    const d = new Date(date);
    if (isNaN(d.getTime())) return "Invalid date";
    
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

function loadTableNavigation() {
    let tableNavigation = document.querySelector("#table-navigation");
    let navigationLength = Math.ceil(userList.length / 10);

    let html = "";
    for (let i = 1; i <= navigationLength; i++) {
        html += `<li class="page" data-page="${i}">${i}</li>`;
    }
    tableNavigation.innerHTML = html;
}

function getInitials(fullName) {
    return fullName.split(' ').map(name => name[0]).join('').toUpperCase();
}

function loadFavorites() {
    let carousel = document.querySelector(".carousel.carousel--scroll-buttons");
    let favoriteTeachers = userList.filter(teacher => teacher.favorite);
    
    let html = "";
    favoriteTeachers.forEach((teacher, index) => {
        html += `<div class="carousel__slide teacher-card" data-label="Slide ${index + 1}" data-teacher-id="${teacher.id}">`;
        
        if (teacher.picture_large) {
            html += `<img src="${teacher.picture_large}" alt="${teacher.full_name}">`;
        } else {
            html += `<div class="teacher-avatar" data-initials="${getInitials(teacher.full_name)}"></div>`;
        }
        
        html += `<h2 class="teacher-name">${teacher.full_name}</h2>`;
        html += `<p class="teacher-origin">${teacher.country}</p>`;
        html += `</div>`;
    });
    
    carousel.innerHTML = html;
}

function updateFilters() {
    const ageValue = document.getElementById("age").value;
    const countryValue = document.getElementById("country").value;
    const genderValue = document.getElementById("sex").value;
    const favoriteChecked = document.getElementById("favorites").checked;
    const photoChecked = document.getElementById("photo").checked;

    filters.ageRange = ageValue.split("-").map(Number);
    filters.country = [countryValue];
    filters.gender = genderValue.toLowerCase();
    filters.favorite = favoriteChecked;
    filters.hasPhoto = photoChecked;
}

function loadTopTeachers() {
    let filteredUsers = filterArray(userList, filters);

    let grid = document.querySelector("#teachers-grid");
    let html = "";
    
    for (let user of filteredUsers) {
        html += `<li class="teacher-card" data-teacher-id="${user.id}">`;
    
        html += `<span class="star" data-favorite="${user.favorite}"></span>`;
        
        if (user.picture_large) {
            html += `<img src="${user.picture_large}" alt="${user.full_name}">`;
        } else {
            html += `<div class="teacher-avatar" data-initials="${getInitials(user.full_name)}"></div>`;
        }
        
        html += `<h2 class="teacher-name">${user.full_name}</h2>`;
        html += `<p class="teacher-speciality">${user.course}</p>`;
        html += `<p class="teacher-origin">${user.country}</p>`;
        html += `</li>`;
    }
    
    grid.innerHTML = html;
}