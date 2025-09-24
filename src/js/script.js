import { userList, filterArray, sortArray, generateId } from "./app.js";

let tablePage = 1;
let key = null;
let order = null;

const filters = {
    country: ["Australia"],
    ageRange: [18, 25],
    gender: "male",
    favorite: true,
    hasPhoto: true
};
let teacher = {};

addEventListener('DOMContentLoaded', () => {
    console.log(userList);
    loadData();
    initListener();
});

function initListener() {
    const body = document.querySelector('body');
    const dialog = document.querySelector("#add-teacher-dialog");
    const teacherCard = document.querySelector("#teacher-info");

    body.addEventListener('click', (event) => {
        let target = event.target;
        console.log(target.classList);
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
            console.log(key, order);
            loadTable();
        }
        else if(target.classList.contains("teacher-card")) {
            toggleTeacherDialog(teacherCard, target);
        }
        else if(target.classList.contains("close-card")) {
            toggleAddTeacherDialog(teacherCard);
        }
    });
}


/*
Завдання 1. 
Відобразити масив об’єктів викладачів отриманий у
лабораторній роботі №3 на html сторінці з лабораторної роботи №2 та
реалізувати функціональність перегляду інформації про викладача та
додавання у список вибраних (favorites).
*/

/*
Завдання 2. (+)
Додати на html сторінку можливість фільтрації викладачів на
сторінці по країні, віку, статі та тих, що є у списку вибраних (country, age,
gender, favorite.
*/

/*
Завдання 3. (+)
Додати на html сторінку до блоку статистики можливість
сортування за ім’ям, спеціальністю, країною, та віком (full_name, course,
age, b_day, country). Змінювати сортування по кліку на заголовок таблиці.
*/


/*
Завдання 4 
Додати на html сторінку функціональність пошуку по викладачах
за параметрами: ім’я, коментар та вік (name, note, age)
*/


/*
Завдання 5. 
Реалізувати функціонал форми додавання викладача
(teach_add_popup)
*/

function toggleTeacherDialog(teacherCard, target) {
    teacherCard.toggleAttribute('open');

    
}


function toggleAddTeacherDialog(dialog) {
    dialog.toggleAttribute('open');

    // for (let input of dialog.querySelectorAll('input')) {
    //     input.value = '';
    // }
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
    let length = userList.length;
    let inputData = getTeacherFormData(dialog.querySelector("form"));

    teacher = {
        gender: inputData["teacher-sex"],
        title: teacher.gender==="male" ? "Mr." : "Ms.",
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
    }
    userList.push(teacher);
    console.log(userList);
    //TO DO: clear input
    loadData();
}

function calculateAge(inputElement) {
  const dateString = inputElement; 
  if (!dateString) return null;

  const birthDate = new Date(dateString);
  const ageMs = Date.now() - birthDate.getTime();
  const ageDate = new Date(ageMs); 

  return Math.abs(ageDate.getUTCFullYear() - 1970); 
}

function convertDateInputToISO(inputElement) {
  const dateString = inputElement; 
  if (!dateString) return null;

  const [year, month, day] = dateString.split('-').map(Number);
  const dateObject = new Date(Date.UTC(year, month - 1, day)); 
  return dateObject.toISOString(); 
}

function loadData() {
    loadTopTeachers();
    loadTable();    //po 10
    loadFavorites();
}

function loadTable() {
    let sortedArray = key === null || order === null ? userList : sortArray(userList, key, order);

    let tbody = document.querySelector("tbody");
    let html = "";
    for (let i = (tablePage - 1) * 10; i < tablePage * 10; i++) {
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
        html += `<td>${sortedArray[i]["full_name"]}</td>`;
        html += `<td>${sortedArray[i]["course"]}</td>`;
        html += `<td>${sortedArray[i]["age"]}</td>`;
        html += `<td>${formatDate(sortedArray[i]["b_date"])}</td>`;
        html += `<td>${sortedArray[i]["country"]}</td>`;
        html += "</tr>";
    }
    tbody.innerHTML = html;

    loadTableNavigation();
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}

//add ...
function loadTableNavigation() {
    let tableNavigation = document.querySelector("#table-navigation");
    let navigationLength = userList.length / 10;
    if (navigationLength % 10 != 0) navigationLength = parseInt(navigationLength) + 1;

    let html = "";
    for (let i = 1; i <= navigationLength; i++) {
        html += `<li class="page" data-page="${i}">${i}</li>`;
    }
    tableNavigation.innerHTML = html;
}

function loadFavorites() {
    let carousel = document.querySelector(".carousel.carousel--scroll-buttons");
    let counter = 1;
    let html = "";
    for (let user of userList) {
        if (user["favorite"] === true) {
            if (user["picture_large"] !== "") {
                html += `<div class="carousel__slide teacher-card" data-label="Slide ${counter}">`;
                html += `<img src="${user["picture_large"]}" alt="teacher">`;
                html += `<h2 class="teacher-name">${user["full_name"]}</h2>`;
                html += `<p class="teacher-origin">${user["country"]}</p>`;
                html += `</div>`;
            } else {
                html += `<div class="carousel__slide teacher-card" data-label="Slide ${counter}">`;
                html += `<div data-initials="${user["full_name"]}" data-has-photo="false"></div>`;  //add method with takes initials
                html += `<h2 class="teacher-name">${user["full_name"]}</h2>`;
                html += `<p class="teacher-origin">${user["country"]}</p>`;
                html += `</div>`;
            }
            counter++;
        }
    }
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
    filters.favorite = favoriteChecked ? true : null;
    filters.hasPhoto = photoChecked ? true : null;

    console.log(filters);
}

function loadTopTeachers() {
    let filteredUsers = filterArray(userList, filters);

    console.log(filteredUsers)
    let grid = document.querySelector("#teachers-grid");
    let html = "";
    for (let user of filteredUsers) {
        if (user["picture_large"] !== "") {
            html += `<li class="teacher-card">`
            if (user["favorite"] === true) html += `<span id="star" class="favorite"></span>`;
            html += `<img src="${user["picture_large"]}" alt="teacher"></img>`;
            html += `<h2 class="teacher-name">${user["full_name"]}</h2>`;
            html += `<p class="teacher-speciality">${user["course"]}</p>`;
            html += `<p class="teacher-origin">${user["country"]}</p>`;
            html += `</li>`;
        } else {
            html += `<li class="teacher-card">`
            if (user["favorite"] === true) html += `<span id="star" class="favorite"></span>`;
            html += `<div data-initials="${user["full_name"]}" data-has-photo="false"></div>`;  //add method with takes initials
            html += `<h2 class="teacher-name">${user["full_name"]}</h2>`;
            html += `<p class="teacher-speciality">${user["course"]}</p>`;
            html += `<p class="teacher-origin">${user["country"]}</p>`;
            html += `</li>`;
        }
    }
    grid.innerHTML = html;
}