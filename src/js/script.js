import { userList, filterArray, sortArray, generateId, findInArray, formatArrays } from "./app.js";

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import dayjs from "dayjs";

import { Chart, registerables } from 'chart.js';
import { get, update } from "lodash";
Chart.register(...registerables);


let tablePage = 1;
let key = null;
let order = null;
let chart = null;
let usersTable = null;
let countriesTable = null;

let userArray = [];

const filters = {
    country: ["Australia"],
    ageRange: [18, 25],
    gender: "male",
    favorite: true,
    hasPhoto: true
};

addEventListener('DOMContentLoaded', async () => {
    userArray = await fetchData(50);
    //console.log(userArray);
    userArray = formatArrays(userArray);
    //userArray = formatUsers(userArray);
    //console.log(userArray);
    loadData();
    initListener();
});


async function fetchData(userNum) {
    try {
        const response = await fetch(`https://randomuser.me/api/?results=${userNum}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.log(error);
        return [];
    }
}

function initListener() {
    const body = document.querySelector('body');
    const dialog = document.querySelector("#add-teacher-dialog");
    const teacherCard = document.querySelector("#teacher-info");

    const main = document.querySelector("main");
    const searchResults = document.querySelector("#search-results");
    const searchResultsGrid = document.querySelector("#search-results-grid");
    const searchInput = document.querySelector("#search-input");

    const map = L.map('map').setView([50.4501, 30.5234], 19);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const mapContainer = map.getContainer();

    const addTeacherForm = dialog.querySelector("form");
    addTeacherForm.addEventListener('submit', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        addTeacher(dialog);
    });

    body.addEventListener('click', (event) => {
        let target = event.target;

        if (target.getAttribute('class') === 'add-teacher' || target.getAttribute('class') === 'close-dialog') {
            toggleAddTeacherDialog(dialog);
        }
        else if (target.getAttribute('class') === "page") {
            tablePage = target.getAttribute('data-page');
            loadTable();
        }
        else if (target.classList.contains("sort")) {
            key = target.getAttribute('id');
            order = target.getAttribute('data-order');
            target.setAttribute('data-order', order === "asc" ? "desc" : "asc");
            loadTable();
        }
        else if (target.classList.contains("teacher-card") || target.closest(".teacher-card")) {
            const cardElement = target.closest(".teacher-card");
            if (cardElement) {
                toggleTeacherDialog(teacherCard, cardElement, map);
            }
        }
        else if (target.classList.contains("close-card")) {
            toggleAddTeacherDialog(teacherCard);
        }
        else if (target.id === "search-input") {
            main.classList.add("hidden");
            searchResults.classList.remove("hidden");
        }
        else if (target.id === "search-btn") {
            main.classList.add("hidden");
            searchResults.classList.remove("hidden");
            searchTeachers(searchResultsGrid);
        }
        else if (target.classList.contains("teacher-favorite") || target.closest(".teacher-favorite")) {
            const favoriteElement = target.closest(".teacher-favorite") || target;
            toggleFavorite(favoriteElement);
        }
        else if (target.id === "exit-search-btn") {
            searchResultsGrid.innerHTML = "";
            searchResults.classList.add("hidden");
            searchInput.value = "";
            main.classList.remove("hidden");
        }
        else if (target.classList.contains("star")) {
            toggleFavoriteStar(target);
        }
        else if (target.id === "toggle-map") {
            mapContainer.classList.toggle("hidden");
            if (!mapContainer.classList.contains("hidden")) {
                map.invalidateSize();
            }
        }
        else if (target.id === "load-more-btn") {
            loadMoreTeachers();
        }
        else if (target.id === "table-view" || target.id === "chart-view" || target.id === "wdr-countries-view" || target.id === "wdr-users-view" && !target.classList.contains("active")) {
            clearViewSection(view);
            changeView(target.id);
        }
    });

    body.addEventListener('change', (event) => {
        let target = event.target;

        if (target.classList.contains("filter")) {
            updateFilters();
            loadTopTeachers();
        } else if (target.id === "category-select") {
            updateChart();
        }
    });
}

function changeView(id) {
    const viewList = document.querySelector("#statistics-view");
    for (let child of viewList.children) {
        child.classList.remove("active");
    }
    const view = document.querySelector("#view");

    switch (id) {
        case "table-view":
            viewList.children[0].classList.add("active");
            toTableView(view);
            break;
        case "chart-view":
            viewList.children[1].classList.add("active");
            toChartView(view);
            break;
        case "wdr-countries-view":
            viewList.children[2].classList.add("active");
            toWdrCountriesView(view);
            break;
        case "wdr-users-view":
            viewList.children[3].classList.add("active");
            toWdrUsersView(view);
            break;
    }

}

function clearViewSection(view) {
    view.innerHTML = "";
}

function toTableView(view) {
    view.innerHTML = `
            <table>
               <thead>
                  <tr>
                     <th id="full_name" class="sort" data-order="asc">Name</th>
                     <th id="course" class="sort" data-order="asc">Speciality</th>
                     <th id="age" class="sort" data-order="asc">Age</th>
                     <th id="b_date" class="sort" data-order="asc">Birthday</th>
                     <th id="country" class="sort" data-order="asc">Country</th>
                  </tr>
               </thead>
               <tbody>
               </tbody>
            </table>
            <div>
               <ul id="table-navigation"></ul>
            </div>
            `;

    loadTable();
}

function toChartView(view) {
    view.innerHTML = `
        <div class="chart-container">
            <canvas id="chart"></canvas>
            <select id="category-select">
                <option value="country">Country</option>
                <option value="age">Age</option>
                <option value="course">Speciality</option>
                <option value="gender">Gender</option>
                <option value="favorite">Favorites</option>
            </select>
        </div>
    `;

    const data = generateData();

    const options = {
        responsive: false,
        plugins: {
            legend: { position: 'bottom' },
            tooltip: { enabled: true }
        }
    }

    const ctx = document.getElementById('chart').getContext('2d');
    chart = new Chart(ctx, { type: 'pie', data, options });
}

function generateData() {
    const selectInput = document.querySelector("#category-select").value;


    let statistics;
    if (selectInput !== "age") {
        statistics = userArray.reduce((acc, user) => {
            user[selectInput] in acc ? acc[user[selectInput]]++ : acc[user[selectInput]] = 1;
            return acc;
        }, {});
    } else {
        statistics = {
            "18-25": 0,
            "26-31": 0,
            "32-40": 0,
            "41-55": 0,
            "56-75": 0,
            "76+": 0
        };

        for (let user of userArray) {
            if (user.age <= 25) {
                statistics["18-25"]++;
            } else if (user.age <= 31) {
                statistics["26-31"]++;
            } else if (user.age <= 40) {
                statistics["32-40"]++;
            } else if (user.age <= 55) {
                statistics["41-55"]++;
            } else if (user.age <= 75) {
                statistics["56-75"]++;
            } else {
                statistics["76+"]++;
            }
        }
    }

    let labels = Object.keys(statistics);
    console.log(labels)
    if (labels[0] === "true" || labels[0] === "false" && labels.length === 2) {
        if (labels === "true") {
            labels = ["favorite", "not favorite"];
        } else labels = ["not favorite", "favorite"]
    }
    const data = Object.values(statistics);
    const backgroundColors = generateRandomColors(labels.length);

    console.log(labels);

    return {
        labels,
        datasets: [{
            label: toSentenceCase(selectInput),
            data,
            backgroundColor: backgroundColors
        }]
    };;
}

function updateChart() {
    const newData = generateData();
    chart.data.labels = newData.labels;
    chart.data.datasets = newData.datasets;
    chart.update();
}

function toSentenceCase(str) {
    if (!str || typeof str !== 'string') {
        return '';
    }
    const lowercasedStr = str.toLowerCase();
    return lowercasedStr.charAt(0).toUpperCase() + lowercasedStr.slice(1);
}

function generateRandomColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
        const r = Math.floor(Math.random() * 255);
        const g = Math.floor(Math.random() * 255);
        const b = Math.floor(Math.random() * 255);
        colors.push(`rgba(${r}, ${g}, ${b}, 0.7)`);
    }
    return colors;
}

function toWdrCountriesView(view) {
    view.innerHTML = `<div id="wdr-countries-container"></div>`;
    const countries = getCountriesFormattedArray();


    countriesTable = new WebDataRocks({
        container: "#wdr-countries-container",
        toolbar: true,
        report: {
            dataSource: {
                data: countries
            },
            slice: {
            },
            options: {
                grid: {
                    type: "flat"
                }
            }
        }
    });
}

function getCountriesFormattedArray() {
    const countries = userArray.reduce((acc, user) => {
        user.country in acc ? acc[user.country]++ : acc[user.country] = 1;
        return acc;
    }, {});


    const formattedData = Object.entries(countries).map(([country, count]) => {
        return {
            "Country": country,
            "Count": count
        };
    });
    return formattedData;
}

function toWdrUsersView(view) {
    view.innerHTML = `<div id="wdr-users-container"></div>`;
    const flattenedData = flattenData(userArray);

    usersTable = new WebDataRocks({
        container: "#wdr-users-container",
        toolbar: true,
        report: {
            dataSource: {
                data: flattenedData
            },
            slice: {
                rows: [
                    { "uniqueName": "Full Name" },
                    { "uniqueName": "Email" },
                    { "uniqueName": "Age" },
                    { "uniqueName": "Gender" },
                    { "uniqueName": "Country" },
                    { "uniqueName": "City" },
                    { "uniqueName": "Course" },
                    { "uniqueName": "Latitude" },
                    { "uniqueName": "Longitude" },
                    { "uniqueName": "Timezone" }
                ]
            },
            options: {
                grid: {
                    type: "flat"
                }
            }
        }
    });
}

function updateWdrUsers() {
    const newData = flattenData(userArray);
    usersTable.updateData({
        data: newData
    });
}

function updateWdrCountries() {
    const newData = getCountriesFormattedArray(userArray);
    countriesTable.updateData({
        data: newData
    });
}

function flattenData(data) {
    return data.map(user => {
        return {
            "Full Name": user.full_name,
            "Email": user.email,
            "Age": user.age,
            "Gender": user.gender,
            "Country": user.country,
            "City": user.city,
            "Course": user.course,
            "Latitude": user.coordinates.latitude,
            "Longitude": user.coordinates.longitude,
            "Timezone": user.timezone.description
        };
    });
}

async function loadMoreTeachers() {
    try {
        const newData = await fetchData(10);
        const formattedData = formatArrays(newData);
        userArray = [...userArray, ...formattedData];
        loadData();
    } catch (error) {
        console.log(error);
    }
}

function toggleFavoriteStar(starElement) {
    const teacherCard = starElement.closest(".teacher-card");
    const teacherId = teacherCard.getAttribute("data-teacher-id");

    const teacher = userArray.find(t => t.id == teacherId);
    if (teacher) {
        teacher.favorite = !teacher.favorite;
        starElement.setAttribute("data-favorite", teacher.favorite);
        loadFavorites();
        loadTopTeachers();
    }
}

function searchTeachers(searchResultsGrid) {
    const searchInput = document.querySelector("#search-input");

    let searchedTeachers = findInArray(userArray, searchInput.value);
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

    const teacher = userArray.find(t => t.id == teacherId);
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

function toggleTeacherDialog(teacherCard, target, map) {
    const teacherId = target.getAttribute("data-teacher-id");
    const teacher = userArray.find(t => t.id == teacherId);
    map.getContainer().classList.add("hidden");

    if (teacher) {
        populateTeacherDialog(teacherCard, teacher, map);
        teacherCard.toggleAttribute('open');
    }
}

function populateTeacherDialog(dialog, teacher, map) {
    dialog.setAttribute('data-teacher-id', teacher.id);

    const daysTillBDay = calculateDaysTillBDay(teacher);


    dialog.querySelector(".teacher-name").textContent = teacher.full_name;
    dialog.querySelector(".teacher-speciality").textContent = teacher.course;
    dialog.querySelector(".teacher-origin").textContent = `${teacher.city || ''}, ${teacher.country}`.trim();
    dialog.querySelector(".teacher-age").textContent = `${teacher.age}, ${teacher.gender}`;
    dialog.querySelector(".teacher-email").textContent = teacher.email;
    dialog.querySelector(".teacher-phone").textContent = teacher.phone;
    dialog.querySelector(".teacher-notes").textContent = teacher.note || "No notes available";
    dialog.querySelector(".teacher-birthday").textContent = `Next birthday in ${daysTillBDay} days`;

    if (
        teacher.coordinates &&
        teacher.coordinates.latitude != null &&
        teacher.coordinates.longitude != null
    ) {
        const coordinates = [];
        coordinates.push(teacher.coordinates.latitude);
        coordinates.push(teacher.coordinates.longitude);

        map.setView(coordinates, 14);
        L.marker(coordinates).addTo(map);
        map.invalidateSize();
    }

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
        img.src = "src/images/default.jpg";
        img.alt = "Teacher";
    }
}

function calculateDaysTillBDay(teacher) {
    const today = dayjs();
    const birthDate = dayjs(teacher.b_date);
    let nextBirthday = birthDate.year(today.year());

    if (nextBirthday.isBefore(today, 'day')) {
        nextBirthday = nextBirthday.add(1, 'year');
    }

    const diffDays = nextBirthday.diff(today, 'day');
    return diffDays;
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

async function sendToServer(teacher) {
    try {
        const response = await fetch('http://localhost:3000/submissions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(teacher)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('Teacher saved to server:', result);
        return result;

    } catch (error) {
        console.error('Error sending teacher to server:', error);
        return { success: false, error: error.message };
    }
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


    userArray.push(newTeacher);


    sendToServer(newTeacher).then(() => {
        console.log('Teacher processing completed');
    }).catch(error => {
        console.log('Teacher added locally despite server error');
    });

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
    loadFavorites();

    let activeView = document.querySelector(".active");
    switch (activeView.id) {
        case "table-view":
            loadTable();
            break;
        case "chart-view":
            updateChart();
            break;
        case "wdr-countries-view":
            updateWdrCountries();
            break;
        case "wdr-users-view":
            updateWdrUsers();
            break;
    }
}

function loadTable() {
    let sortedArray = key === null || order === null ? userArray : sortArray(userArray, key, order);

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
    let navigationLength = Math.ceil(userArray.length / 10);

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
    let favoriteTeachers = userArray.filter(teacher => teacher.favorite);

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
    let filteredUsers = filterArray(userArray, filters);

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

