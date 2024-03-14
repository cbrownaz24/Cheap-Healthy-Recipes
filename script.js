// https://spoonacular.com/food-api/docs#Recipe-Sorting-Options
//https://spoonacular.com/food-api/docs#Search-Recipes-by-Nutrients
//https://spoonacular.com/food-api/docs#Search-Recipes-Complex
//https://spoonacular.com/food-api/docs#Get-Recipe-Information
const API_KEY = prompt("This program requires an API key. Please visit https://spoonacular.com/ to receive an API key and paste it here:");

//creating meal type dropdown selector
const mealTypeDropdown = document.querySelector('#meal-type-dropdown');
mealTypeDropdown.addEventListener('click', (event) => {
  event.stopPropagation();
  additionalDropdown.classList.remove('is-active');
  mealTypeDropdown.classList.toggle('is-active');
});

const mealTypes = document.querySelectorAll('#meal-type-dropdown .dropdown-item');
let previousMealType;
let currentMealType;

function openModal($el) {
  $el.classList.add('is-active');
}

function closeModal($el) {
  $el.classList.remove('is-active');
}

function closeAllModals() {
  (document.querySelectorAll('.modal') || []).forEach(($modal) => {
    closeModal($modal);
  });
}

mealTypes.forEach(mealType => {
  mealType.addEventListener('click', (event) => {
    event.stopPropagation();
    currentMealType = mealType;
    if (previousMealType !== undefined) {
      previousMealType.classList.remove('is-active');
      currentMealType.classList.add('is-active');
      previousMealType = currentMealType;
    } else {
      currentMealType.classList.add('is-active');
      previousMealType = currentMealType;
    }
    document.querySelector('#default-meal-dropdown-text').innerHTML = currentMealType.innerHTML.trim();
    //console.log(mealType.innerHTML.trim().toLowerCase());
  })
})

//creating drop down selector for additional nutrients
const additionalDropdown = document.querySelector('#additional');
additionalDropdown.addEventListener('click', (event) => {
  event.stopPropagation();
  mealTypeDropdown.classList.remove('is-active');
  additionalDropdown.classList.toggle('is-active');
});

document.addEventListener('click', (event) => {
  additionalDropdown.classList.remove('is-active');
  mealTypeDropdown.classList.remove('is-active');
})
const foodSection = document.querySelector(".card-container");

// static nav
const loadNav = async () => {
  const response = await fetch('nav.html')
  const text = await response.text();
  document.getElementById("header").innerHTML = text;
}
loadNav();

let added_nutrients = []
//accessing list of food info from API
const getFoods = async (nutrients, mealType = "") => {
  let complexUrl = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&addRecipeInformation=true&addRecipeNutrition=true&sort=price&sortDirection=asc&offset=${randomNumber(25, 75)}`;
  // Add on more if + has extra
  //console.log(`Your queries:`)
  let storedQuery = {};
  console.log(mealType);
  if (mealType !== "") {
    complexUrl += `&type=${encodeURIComponent(mealType)}`;
    storedQuery["type"] = mealType;
  }

  nutrients.forEach((nutrient) => {
    if (parseInt(nutrient.value)) {
      complexUrl += `&${nutrient.id}=${parseInt(nutrient.value)}`;
      //logging updated query for access outside of page
      // storedQuery[nutrient.id] = parseInt(nutrient.value);
      console.log(`${nutrient.id}:${nutrient.value}`);
      let name = nutrient.placeholder.slice(0, nutrient.placeholder.indexOf('(')-1)
      storedQuery[name] = `${parseInt(nutrient.value)} ${nutrient.placeholder.slice(nutrient.placeholder.indexOf('(')+1, nutrient.placeholder.indexOf(')'))}`;
    }
  });
  console.log(`The complete URL is ${complexUrl}`);

  sessionStorage.setItem('query', JSON.stringify(storedQuery));
  document.querySelector('#food-section > h1').innerHTML += '<br>' + JSON.stringify(storedQuery);
  console.log(storedQuery)

  const response = await fetch(complexUrl);
  // const response = await fetch('./test.json') //for testing without access api
  const data = await response.json();
  const results = data.results;
  //taking API results and creating readable cards
  console.log(results);
  if (results.length > 0) {
    for (let i = 0; i < results.length; i++) {
      populateCard(results[i])
    }
    document.querySelector('#returned-h1').innerHTML = "Your Results"
    document.querySelector('#returned-h2').innerHTML = "View your selected foods and recipes or select new preferences."
  } else {
    document.querySelector('#returned-h1').innerHTML = "This query has no results"
    document.querySelector('#returned-h2').innerHTML = "Try to loosen your restrictions."
  }

  let pref_str = ""
  for (q in storedQuery) {
    pref_str += q + ': ' + storedQuery[q] + ', '
  }
  document.querySelector("#returned-h3").innerHTML = `Your current preferences: ${pref_str.slice(0, pref_str.length-2)}`
}

//submitting parameters for API pull
document.querySelector("#submit-categories").addEventListener('click', () => {
  const parameters = document.querySelectorAll('.nutrient');
  document.querySelectorAll('.container').forEach(c => {
    // console.log(c);
    c.style.display = 'none'
  });
  if (currentMealType !== undefined && currentMealType.innerHTML.trim() !== "Show All") {
    getFoods(parameters, currentMealType.innerHTML.trim().toLowerCase());
  } else {
    getFoods(parameters)
  }

})

const populateCard = (results) => {
  // console.log(results);
  document.querySelector("#foods").classList.remove('hidden');
  //rretrieving individual properties for food item
  let id = results.id;
  let healthScore = results.healthScore;
  let price = parseFloat(results.pricePerServing).toFixed(2);
  let title = results.title;
  let cookTime = results.readyInMinutes;
  let image = results.image;
  let types = results.dishTypes;
  let summary = results.summary;
  let nutrients = results.nutrition.nutrients;
  let ingredients = []
  let steps = []
  let stepsString = ""
  try {
    steps = results.analyzedInstructions[0].steps;
  }
  catch (error) {
    stepsString = "No steps are currently registered with this item."
  }
  
  try {
    ingredients = results.nutrition.ingredients;
  } catch (error) {
    ingredients = []
  }
  if (!(ingredients)) {
    ingredients = []
  }
  // console.log(ingredients);
  let i = 0;
  if (!(typeof steps == "string")) {
    steps.forEach(s => {
      stepsString += `${i + 1}. ${s.step}<br>`;
      i += 1;
    });
    i = 0;
  }
  let [nTable, iTable] = constructTable(nutrients, ingredients)
  const newCard = ` 
  <div class="container">
    <!-- Modal code -->
    <div id="recipe-${id}" class="modal">
      <div class="modal-background"></div>
        <div class="modal-card">
          <header class="modal-card-head">
            <p class="modal-card-title">${title}</p>
            <button class="delete" aria-label="close"></button>
          </header>
        <section class="modal-card-body">
          <figure class="image has-text-centered" style="display:flex; justify-content:center;">
            <img style="max-width: 33%!important; height:auto!important; border: 3px dotted black; margin-bottom: 8px;" src="${image}">
        </figure>
          ${stepsString}<br>
        </section>
        <div class="modal-content">
          <!-- <p class="image">
            <img src="${image}" style="width: 50%; height: auto;" alt="${title}">
          </p> -->
        </div>
        <div class="modal-content">
          <div style="display: flex; justify-content: space-around;">
            ${nTable}
            ${iTable}
          </div>
        </div>
        <footer class="modal-card-foot">
          <button class="button is-success open-item">More Details</button>
          <button class="button is-danger">Close</button>
        </footer>
      </div>
    </div>
    <div class="card is-fullwidth">
      <header class="card-header">
        <p class="card-header-title">${title}</p>
        <div style="display: flex; flex-direction: column; justify-content: center;">
          <button class="button js-modal-trigger" data-target="recipe-${id}">
            Open Recipe
          </button>  
        </div>
        <!-- <img src="${image}" class="food-image"> -->
          <a class="card-header-icon card-toggle">
            <i class="fa fa-angle-down"></i>
          </a>
        </header>
        <div class="card-content is-hidden">
          <div class="content">
            ${summary}
            <br>
            <div>
            <button class="button is-success add-item" style="margin-top:30px;">👍 Add this item </button>
            <button class="button is-danger remove-item" style="margin-top:30px;">🤮 Delete this item </button>
            <span class="has-text-centered check hidden"><i class="fa-solid fa-check" style="color: green; margin-top: 42px;"></i>    Added your item</span>
            </div>
        </div>
      </div>
    </div>`

  //adding food card to page
  foodSection.innerHTML += newCard;

  let removeItems = document.getElementsByClassName("remove-item");
  for (let i = 0; i < removeItems.length; i++) {
    removeItems[i].addEventListener('click', () => {
      removeItems[i].parentElement.parentElement.parentElement.parentElement.classList.add('hidden')
    });
  }

  (document.querySelectorAll('.js-modal-trigger') || []).forEach(($trigger) => {
    const modal = $trigger.dataset.target;
    const $target = document.getElementById(modal);

    $trigger.addEventListener('click', () => {
      openModal($target);
    });
  });

  // Add a click event on various child elements to close the parent modal
  (document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
      closeModal($target);
    });
  });


  //Add to 'Your Foods' page
  let addItems = document.getElementsByClassName("add-item");
  let cards = "";
  let allCards = "";
  // if (not_filler) {
  for (let i = 0; i < addItems.length; i++) {
    addItems[i].addEventListener('click', (e) => {
      cards += addItems[i].parentElement.parentElement.parentElement.parentElement.parentElement.outerHTML;
      console.log(cards);
      sessionStorage.setItem('cards', cards);
      // console.log(e.currentTarget.parentElement.parentElement.parentElement.parentElement.parentElement) //container
      e.currentTarget.parentElement.parentElement.parentElement.querySelector(".add-item").style.display = 'none';
      e.currentTarget.parentElement.parentElement.parentElement.querySelector(".remove-item").style.display = 'none';
      e.currentTarget.parentElement.parentElement.parentElement.querySelector(".check").classList.remove('hidden')
      // setTimeout(() => {
      //   e.currentTarget.parentElement.parentElement.parentElement.classList.toggle('is-hidden'); //close card when added
      // }, 1500)
    });
  }
  // }

  document.querySelectorAll(".open-item").forEach(i => {
    i.addEventListener('click', (e) => {
      console.log('clicked');
      e.currentTarget.parentElement.parentElement.parentElement.parentElement.querySelector(".card-content").classList.toggle('is-hidden');
    });
  });

  // Card expandable script
  let cardToggles = document.getElementsByClassName('card-toggle');
  for (let i = 0; i < cardToggles.length; i++) {
    cardToggles[i].addEventListener('click', e => {
      e.currentTarget.parentElement.parentElement.childNodes[3].classList.toggle('is-hidden');
      console.log(e.currentTarget.parentElement.parentElement.childNodes[3])
    });
  }
}

//allows for adding nutrients according to the addtional dropdown
const dropdowns = document.querySelectorAll('#dropdown-nutrients .dropdown-item');
const inputList = document.querySelector('#inputs');

//event listener for each dropdown item
//adds input field according to the dropdown item
dropdowns.forEach(dropdown => {
  dropdown.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!dropdown.classList.contains('is-active')) {
      inputList.innerHTML += `<input id=${dropdown.id} class="column is-one-quarter nutrient input is-primary search" type="text" placeholder="${dropdown.innerHTML.trim()}"/>`;
      dropdown.classList.add('is-active');
    } else {
      document.querySelector(`#${dropdown.id}.nutrient`).remove();
      dropdown.classList.remove('is-active');
    }
    console.log(inputList.innerHTML);
  })
})

const refresh = document.getElementById('remove-fields');
refresh.addEventListener('click', () => {
  dropdowns.forEach(dropdown => {
    if (dropdown.classList.contains('is-active')) {
      dropdown.classList.remove('is-active');
    }
    if (dropdown.id === 'maxCalories' || dropdown.id === 'maxCarbs' || dropdown.id === 'minProtein') {
      dropdown.classList.add('is-active');
    }

    if (currentMealType !== undefined) {
      currentMealType.classList.remove('is-active');
      currentMealType = undefined;
      document.querySelector('#default-meal-dropdown-text').innerHTML = "Meal Type";
    }

    inputList.innerHTML = `<input id="maxCalories" class="column is-one-quarter nutrient input is-primary search" type="text"
            placeholder="Max Calories (kcal)">
          <input id="maxCarbs" class="column is-one-quarter nutrient input is-primary search" type="text"
            placeholder="Max Carbs (g)">
          <input id="minProtein" class="column is-one-quarter nutrient input is-primary search" type="text"
            placeholder="Min Protein (g)">`;
  })
});

const randomNumber = (start, end) => {
  return Math.floor(Math.random() * (end - start + 1)) + (start + 1)
}

document.addEventListener('keydown', (event) => {
  const e = event || window.event;
  if (e.keyCode === 27) { // Escape key
    closeAllModals();
  }
});

const constructTable = (nutrients, ingredients) => {
  let nutritionTable = `
  <table class='table is-striped is-bordered' style="background-color: lightgrey;">
    <thead>
      <tr>
        <th>Nutrient</th>
        <th>Amount</th>
        <th>Unit</th>
        <th>Percent of Daily Need</th>
      </tr>
    </thead>
    <tbody>
  `
  nutrients.forEach(nutrient => {
    nutritionTable += `
    <tr>
      <th>${nutrient.name}</th>
      <th>${nutrient.amount}</th>
      <th>${nutrient.unit}</th>
      <th>${nutrient.percentOfDailyNeeds}%</th>
    </tr>
    `
  });
  nutritionTable += `</tbody></table>`

  let ingredientTable = ''
  if (ingredients.length > 0) {
    ingredientTable = `
    <table class='table is-striped is-bordered' style="background-color: lightgrey;">
      <thead>
        <tr>
          <th>Ingredient</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
    `
    ingredients.forEach(ingredient => {
      ingredientTable += `
      <tr>
        <th>${ingredient.name}</th>
        <th>${ingredient.amount} ${ingredient.unit}</th>
      </tr>
      `
    });
    ingredientTable += `</tbody></table>`
  } else {
    ingredientTable = "<h1>No ingredients are currently registered with this item.</h1>"
  }
  return [nutritionTable, ingredientTable];
}

//Beginning filler
document.addEventListener('DOMContentLoaded', async () => {
  const response = await fetch('./test.json') //for testing without access api
  const data = await response.json();
  const results = data.results;
  //taking API results and creating readable cards
  if (results.length > 0) {
    for (let i = 0; i < results.length; i++) {
      populateCard(results[i])
    }
    // not_filler = true;
  }
  else {
    document.querySelector("#foods").classList.remove('hidden');
    foodSection.innerHTML = "<div class='has-text-centered'>This query has no results. Try to loosen your restrictions.</div>";
  }
})