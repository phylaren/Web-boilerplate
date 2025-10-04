import { randomUserMock, additionalUsers } from './mock-data.js';
export const userList = [];//validateUsers(formatArrays(randomUserMock, additionalUsers));;

//addEventListener('DOMContentLoaded', () => {



// console.log("=== Filtered users array ===");
// const filters = {
//   country: [],             //can be empty 
//   ageRange: [20, 70],      //can be empty            
//   gender: null,            //null or "male" or "female"        
//   favorite: false          //null or true or false          
// };
// let filteredUsers = filterArray(userList, filters);
// console.log(filteredUsers);

// console.log("=== Sorted users array ===");
// let sorteredUsers = sortArray(userList, "age", "asc");
// console.log(sorteredUsers);
// //using Date object to sort by date

// let sorteredUsersByDate = sortArray(userList, "date", "asc");
// console.log(sorteredUsersByDate);


// console.log("=== Search users array ===");
// let foundUsers = findInArray(userList, "Germany");
// console.log(foundUsers);

// console.log("=== Percentage array ===");
// let percentage = matchPercentage(userList, user => user.age>30);
// console.log("percentage:" + percentage);

//});



/*
Завдання 2. Замінити сортування, фільтрацію, валідацію та пошук на роботу з
данними із запиту. Оновити статистику на роботу з данними, що повертаються із
запиту. Якщо кількість користувачів змінюється (фільтрація, пошук, додали
нових), це відображається у статистиці.
*/

export function formatArrays(array) {
  const allUsers = array.map(user => formatUser(user));
  //allUsers.forEach(user => console.log(user));
  // data.forEach(user => {
  //     console.log(user);
  //     const formatted = formatUser(user);
  //     allUsers.push(formatted);
  // });
  allUsers.forEach(user => user.phone = normalizePhoneNumber(user.phone, user.country));
  let mergedUsers = mergeDuplicates(allUsers);
  mergedUsers = validateUsers(mergedUsers);
  return mergedUsers;
}


export function formatUser(user) {
  const getString = (val) => typeof val === "string" ? val : "";
  const getNumber = (val) => typeof val === "number" ? val : (isFinite(Number(val)) ? Number(val) : null);
  const getBoolean = (val) => typeof val === "boolean" ? val : getRandomBoolean();
  const getObject = (val) => (val && typeof val === "object") ? val : null;

  return {
    gender: getString(user?.gender),
    title: getString(user?.name?.title) || getString(user?.title),
    full_name: getString(`${user?.name?.first || ""} ${user?.name?.last || ""}`.trim()) || getString(user?.full_name),
    city: getString(user?.location?.city) || getString(user?.city),
    state: getString(user?.location?.state) || getString(user?.state),
    country: getString(user?.location?.country) || getString(user?.country),
    postcode: getString(user?.location?.postcode) || getString(user?.postcode),
    coordinates: getObject(user?.location?.coordinates) || getObject(user?.coordinates),
    timezone: getObject(user?.location?.timezone) || getObject(user?.timezone),
    email: getString(user?.email),
    b_date: getString(user?.dob?.date) || getString(user?.b_date),
    age: getNumber(user?.dob?.age) ?? getNumber(user?.age),
    phone: getString(user?.phone),
    picture_large: getString(user?.picture?.large) || getString(user?.picture_large),
    picture_thumbnail: getString(user?.picture?.thumbnail) || getString(user?.picture_thumbnail),

    id: getString(user?.id?.value) || getString(user?.id) || generateId(),
    favorite: getBoolean(user?.favorite),
    course: getString(user?.course) || getRandomDiscipline(),
    bg_color: getString(user?.bg_color) || getRandomColor(),
    note: getString(user?.note)
  };
}

function mergeDuplicates(users) {
  const merged = {};

  users.forEach(user => {
    const key = `${user.id}_${user.full_name}`;
    if (!merged[key]) {
      merged[key] = user;
    } else {
      let userObj = merged[key];
      for (let field in user) {
        if (userObj[field] === undefined || userObj[field] === null) {
          userObj[field] = user[field];
        }
      }
    }
  });
  return Object.values(merged);
}

function showFormattedArray(userList) {
  for (let user of userList) {
    for (let prop in user) {
      if (typeof (user[prop]) === "object") {
        console.log(`${prop}: {\n`)
        let obj = user[prop];
        for (let objProp in obj) {
          console.log(`${objProp}: ${obj[objProp]}`)
        }
        console.log(`}`)
        continue;
      }
      console.log(`${prop}: ${user[prop]}`)
    }
    console.log("")
  }
}

function getRandomDiscipline() {
  const courses = [
    "Mathematics", "Physics", "English", "Computer Science", "Dancing",
    "Chess", "Biology", "Chemistry", "Law", "Art"
  ];
  return courses[Math.floor(Math.random() * courses.length)];
}

function getRandomColor() {
  const cssColors = ["red", "blue", "green", "orange", "purple", "gray"];
  const hex = () => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  return Math.random() < 0.5 ? cssColors[Math.floor(Math.random() * cssColors.length)] : hex();
}

function getRandomBoolean() {
  return Math.random() < 0.5;
}

export function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}



//exercise 2
/*
!Поле phone — привести до правильного формату залежно від країни (якщо можливо). Якщо у форматі помилка — виправити (наприклад, нормалізувати).


*/

function validateUsers(array) {
  return [...array].filter(user => validateUser(user));
}
function validateUser(user) {
  // if (!isCorrectFullName(user.full_name)) console.log("Invalid name:", user.full_name);
  // if (!isSentenseCase(user.city)) console.log("Invalid city:", user.city);
  // if (!isSentenseCase(user.country)) console.log("Invalid country:", user.country);
  // if (!isCorrectNote(user.note)) console.log("Invalid note:", user.note);
  // if (!Number.isInteger(user.age)) console.log("Invalid age:", user.age);
  // if (!isCorrectEmail(user.email)) console.log("Invalid email:", user.email);

  return isCorrectFullName(user.full_name) &&
    isSentenseCase(user.city) &&
    isSentenseCase(user.country) &&
    isCorrectNote(user.note) &&
    Number.isInteger(user.age) &&
    isCorrectEmail(user.email);
}

function isCorrectFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') return false;
  let fullNameArray = fullName.trim().split(/\s+/);
  if (fullNameArray.length < 2) return false;
  for (let word of fullNameArray) {
    if (word[0] !== word[0].toUpperCase()) return false;
  }
  return true;
}

function isCorrectNote(note) {
  if (note === undefined || note === null) return false;
  if (note.trim() === "") return true; // allow empty notes
  let noteArray = note.split(/(?<=[.?!])\s+/);
  for (let sentence of noteArray) {
    sentence = sentence.trim();
    if (sentence.length > 0 && !isSentenseCase(sentence)) {
      return false;
    }
  }
  return true;
}

//for gender, state, city, country 
function isSentenseCase(sentence) {
  if (!sentence || typeof sentence !== 'string') return false;
  return sentence[0] === sentence[0].toUpperCase();
}

function isCorrectEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhoneNumber(number, country) {
  if (!number || typeof number !== 'string') return number;
  const countryCode = getCountryCode(country) ?? '+';
  let cleaned = number.replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return '+' + cleaned.slice(2);
  if (cleaned.startsWith('0')) return countryCode + cleaned.slice(1);
  return '+' + countryCode + cleaned;
}

function getCountryCode(country) {
  let countryCode;

  switch (country) {
    case "Germany": countryCode = "49"; break;
    case "France": countryCode = "33"; break;
    case "Italy": countryCode = "39"; break;
    case "Spain": countryCode = "34"; break;
    case "Ukraine": countryCode = "380"; break;
    case "United Kingdom": countryCode = "44"; break;
    case "United States": countryCode = "1"; break;
    case "Canada": countryCode = "1"; break;
    case "Japan": countryCode = "81"; break;
    case "South Korea": countryCode = "82"; break;
    case "China": countryCode = "86"; break;
    case "India": countryCode = "91"; break;
    case "Australia": countryCode = "61"; break;
    case "New Zealand": countryCode = "64"; break;
    case "Brazil": countryCode = "55"; break;
    case "Argentina": countryCode = "54"; break;
    case "Mexico": countryCode = "52"; break;
    case "South Africa": countryCode = "27"; break;
    case "Egypt": countryCode = "20"; break;
    case "Nigeria": countryCode = "234"; break;
    case "Kenya": countryCode = "254"; break;
    case "Turkey": countryCode = "90"; break;
    case "Saudi Arabia": countryCode = "966"; break;
    case "United Arab Emirates": countryCode = "971"; break;
    case "Israel": countryCode = "972"; break;
    case "Pakistan": countryCode = "92"; break;
    case "Bangladesh": countryCode = "880"; break;
    case "Indonesia": countryCode = "62"; break;
    case "Thailand": countryCode = "66"; break;
    case "Vietnam": countryCode = "84"; break;
    case "Philippines": countryCode = "63"; break;
    case "Malaysia": countryCode = "60"; break;
    case "Singapore": countryCode = "65"; break;
    case "Iran": countryCode = "98"; break;
    case "Iraq": countryCode = "964"; break;
    case "Greece": countryCode = "30"; break;
    case "Netherlands": countryCode = "31"; break;
    case "Belgium": countryCode = "32"; break;
    case "Sweden": countryCode = "46"; break;
    case "Norway": countryCode = "47"; break;
    case "Denmark": countryCode = "45"; break;
    case "Finland": countryCode = "358"; break;
    case "Poland": countryCode = "48"; break;
    case "Czech Republic": countryCode = "420"; break;
    case "Hungary": countryCode = "36"; break;
    case "Austria": countryCode = "43"; break;
    case "Switzerland": countryCode = "41"; break;
    case "Portugal": countryCode = "351"; break;
    case "Ireland": countryCode = "353"; break;
    case "Romania": countryCode = "40"; break;
    default: countryCode = "380";
  }

  return countryCode;
}

//exercise 3

export function filterArray(usersArray, filters) {
  return [...usersArray].filter(user => {
    const genderMatch =
      filters.gender != null ? user.gender === filters.gender : true;

    const favoriteMatch =
      filters.favorite === true ? user.favorite === true : true;

    const countryMatch =
      Array.isArray(filters.country) && filters.country.length > 0
        ? filters.country.includes(user.country)
        : true;

    const ageMatch =
      Array.isArray(filters.ageRange) && filters.ageRange.length === 2
        ? user.age >= filters.ageRange[0] && user.age <= filters.ageRange[1]
        : true;

    const hasPhotoMatch =
      filters.hasPhoto === true ? user.picture_large?.trim() !== "" : true;

    return genderMatch && favoriteMatch && countryMatch && ageMatch && hasPhotoMatch;
  });
}

//exercise 4

export function sortArray(usersArray, key, order = "asc") {
  return [...usersArray].sort((a, b) => {
    const valA = a[key];
    const valB = b[key];

    const direction = order === "asc" ? 1 : -1;

    if (valA == null && valB == null) return 0;
    if (valA == null) return 1 * direction;
    if (valB == null) return -1 * direction;

    if (typeof valA === "number" && typeof valB === "number") {
      return (valA - valB) * direction;
    }

    if (valA instanceof Date && valB instanceof Date) {
      return (valA.getTime() - valB.getTime()) * direction;
    }

    return valA.toString().localeCompare(valB.toString(), undefined, { sensitivity: 'base' }) * direction;
  });
}

//exercise 5
export function findInArray(usersArray, search) {
  const searchTerms = String(search).toLowerCase().split(" ");

  return usersArray.filter(user => {
    for (let key in user) {
      let value = user[key];

      if (typeof value === "boolean" || value == null) continue;

      if (typeof value === "number") {
        if (searchTerms.includes(String(value))) {
          return true;
        }
      }

      else if (typeof value === "string") {
        const words = value.toLowerCase().split(/\s+/);
        for (let word of words) {
          if (searchTerms.includes(word)) {
            return true;
          }
        }
      }

      else if (Array.isArray(value)) {
        for (let item of value) {
          if (typeof item === "string" || typeof item === "number") {
            if (searchTerms.includes(String(item).toLowerCase())) {
              return true;
            }
          }
        }
      }

      else if (typeof value === "object") {
        const nestedMatch = findInArray([value], search);
        if (nestedMatch.length > 0) {
          return true;
        }
      }
    }

    return false;
  });
}

// exercise 6 

function matchPercentage(usersArray, conditionFn) {
  if (typeof conditionFn !== "function") {
    throw new Error("Умова має бути функцією");
  }

  const total = usersArray.length;
  const matched = usersArray.filter(user => conditionFn(user)).length;

  return total === 0 ? 0 : (matched / total) * 100;
}

//console.log(matchPercentage(users, user => user.age>30))