const loadNav = async () => {
  const response = await fetch('nav.html')
  const text = await response.text();
  document.getElementById("header").innerHTML = text;
  console.log("loaded")
}
loadNav();

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll(".add-item").forEach(a => a.style.display = 'none');
  // document.querySelectorAll(".remove-item").forEach(a => a.style.display = 'none');
})

const getQueries = () => {
  const queries = JSON.parse(sessionStorage.query);
  for (const query in queries) {
    // document.querySelector('body > h1').innerHTML += `<br> ${query} : ${queries[query]}`
  }
}
getQueries();

const getCards = () => {
  const cards = sessionStorage.cards;
  document.querySelector('#cards').innerHTML += cards;
}
getCards();


let removeItems = document.getElementsByClassName("remove-item");
let new_cards = "";
for (let i = 0; i < removeItems.length; i++) {
  removeItems[i].addEventListener('click', () => {
    console.log(removeItems[i])
    removeItems[i].parentElement.parentElement.parentElement.parentElement.parentElement.classList.add('hidden', 'removed');
    let cards_remaining = document.getElementsByClassName("container");
    console.log(cards_remaining);
    for (let i = 0; i < cards_remaining.length; i++) {
      if (!cards_remaining[i].classList.contains("removed")) {
        new_cards += cards_remaining[i].outerHTML
        sessionStorage.setItem('cards', new_cards)
      }
    }
  });
}


// Card expandable script
let cardToggles = document.getElementsByClassName('card-toggle');
for (let i = 0; i < cardToggles.length; i++) {
  cardToggles[i].addEventListener('click', e => {
    e.currentTarget.parentElement.parentElement.childNodes[3].classList.toggle('is-hidden');
  });
}

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