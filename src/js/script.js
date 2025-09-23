import { userList } from "./app.js";

let tablePage = 1;
addEventListener('DOMContentLoaded', () => {
    console.log(userList);
    loadData();
    initListener();
});

function initListener() {
    const body = document.querySelector('body');
    const dialog = document.querySelector("#add-teacher-dialog");

    body.addEventListener('click', (event) => {
        let target = event.target;
        console.log(target);
        if (target.getAttribute('class') === 'add-teacher' || target.getAttribute('class') === 'close-dialog') {
            toggleTeacherDialog(dialog);
        }
        if (target.id == "add-teacher") {
            addTeacher(dialog);
        }
        if(target.getAttribute('class') === "page"){
            tablePage = target.getAttribute('data-page');
            loadTable();
        }

    });
}


/*
Завдання 1. Відобразити масив об’єктів викладачів отриманий у
лабораторній роботі №3 на html сторінці з лабораторної роботи №2 та
реалізувати функціональність перегляду інформації про викладача та
додавання у список вибраних (favorites).
*/

/*
Завдання 2. Додати на html сторінку можливість фільтрації викладачів на
сторінці по країні, віку, статі та тих, що є у списку вибраних (country, age,
gender, favorite.
*/

/*
Завдання 3. Додати на html сторінку до блоку статистики можливість
сортування за ім’ям, спеціальністю, країною, та віком (full_name, course,
age, b_day, country). Змінювати сортування по кліку на заголовок таблиці.
*/


/*
Завдання 4 Додати на html сторінку функціональність пошуку по викладачах
за параметрами: ім’я, коментар та вік (name, note, age)
*/


/*
Завдання 5. Реалізувати функціонал форми додавання викладача
(teach_add_popup)
*/

function toggleTeacherDialog(dialog) {
    dialog.toggleAttribute('open');

    for (let input of dialog.querySelectorAll('input')) {
        input.value = '';
    }
}

function addTeacher(dialog) {
    for(let input of dialog.querySelectorAll("input")){
        if(input.value == "") break;
        inputData.push(input.value);
    }
    
    console.log(inputData);
    // const teacher = {
    //     gender:
    //         title:
    //     full_name:
    //         city:
    //     state:
    //         country:
    //     postcode:
    //         coordinates:
    //     timezone:
    //         email:
    //     b_date:
    //         age:
    //     phone:
    //         picture_large:
    //     picture_thumbnail:

    //         id: // generateId(),
    //     favorite:
    //         course:
    //     bg_color:
    //         note:
    // }

    // for (let input of dialog.querySelectorAll('input')) {
    //     input.value = '';
    // }
    updateTopTeachers();
    updateTable();
    updateFavorites();
}

function loadData(){
    loadTopTeachers();
    loadTable();    //po 10
    loadFavorites(); 
}

function loadTable(){
    let tbody = document.querySelector("tbody");
    let html = "";
    for(let i = (tablePage-1)*10; i<tablePage*10; i++){
        if(i >= userList.length) {
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
        html += `<td>${userList[i]["full_name"]}</td>`;
        html += `<td>${userList[i]["course"]}</td>`;
        html += `<td>${userList[i]["age"]}</td>`;
        html += `<td>${userList[i]["gender"]}</td>`;
        html += `<td>${userList[i]["country"]}</td>`;
        html += "</tr>";
    }
    tbody.innerHTML = html;

    loadTableNavigation();
}

//add ...
function loadTableNavigation(){
    let tableNavigation = document.querySelector("#table-navigation");
    let navigationLength = userList.length/10;
    if(navigationLength%10 != 0) navigationLength = parseInt(navigationLength)+1;

    let html = "";
    for(let i = 1; i<=navigationLength; i++){
        html += `<li class="page" data-page="${i}">${i}</li>`;
    }
    tableNavigation.innerHTML = html;
}

function loadFavorites(){
    let carousel = document.querySelector(".carousel.carousel--scroll-buttons");
    let counter = 1;
    let html = "";
    for(let user of userList){
        if(user["favorite"] === true){
            if(user["picture_large"] !== ""){
                html += `<div class="carousel__slide" data-label="Slide ${counter}">`;
                html += `<img src="${user["picture_large"]}" alt="teacher">`;
                html += `<h2 class="teacher-name">${user["full_name"]}</h2>`;
                html += `<p class="teacher-origin">${user["country"]}</p>`;
                html += `</div>`;
            }else{
                html += `<div class="carousel__slide" data-label="Slide ${counter}">`;
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

function loadTopTeachers(){
    let grid = document.querySelector("#teachers-grid");
    let html = "";
    for(let user of userList){
        if(user["picture_large"] !== ""){
                html += `<li>`
                if(user["favorite"] === true) html += `<span id="star" class="favorite"></span>`;
                html +=  `<img src="${user["picture_large"]}" alt="teacher"></img>`;
                html += `<h2 class="teacher-name">${user["full_name"]}</h2>`;
                html +=  `<p class="teacher-speciality">${user["course"]}</p>`;
                html +=  `<p class="teacher-origin">${user["country"]}</p>`;
                html += `</li>`;
        }else{
                html += `<li>`
                if(user["favorite"] === true) html += `<span id="star" class="favorite"></span>`;
                html += `<div data-initials="${user["full_name"]}" data-has-photo="false"></div>`;  //add method with takes initials
                html += `<h2 class="teacher-name">${user["full_name"]}</h2>`;
                html +=  `<p class="teacher-speciality">${user["course"]}</p>`;
                html +=  `<p class="teacher-origin">${user["country"]}</p>`;
                html += `</li>`;
            }
    }
    grid.innerHTML = html;
}