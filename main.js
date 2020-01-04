// let city;
// let test = false;

/* ----------------------------------------------------------------------------------------------------
                                            INTERROGER LE SERVEUR
---------------------------------------------------------------------------------------------------- */
// Si on click sur le bouton alors on affiche les éléments de recherche.
const activeSearch = document.querySelector(".search-img");
activeSearch.addEventListener('click', () => toogleSearch());

function toogleSearch(){
    activeSearch.classList.toggle("hidden");
    document.querySelector(".search_input").classList.toggle("hidden");
    document.querySelector(".search_select").classList.toggle("hidden");
}
/* --------------------------------------------------------------------
                RECUPERE LA LISTE DES VILLES
-------------------------------------------------------------------- */
const searching = document.getElementById("search-input");
searching.addEventListener('input', () => getListeCitiesAsync());

const getListeCitiesAsync = async function () {
    try {
        // Si au moins 1 caractere est saisie dans la barre de recherche alors on interroge le serveur.
        if (searching.value.length != 0) {
            // Requete au serveur
            const response = await fetch("https://cors-anywhere.herokuapp.com/https://www.prevision-meteo.ch/services/json/list-cities/fr");
            // GESTION ERREUR : LE SERVEUR REPONDS AVEC OU SANS CODE ERREUR
            if (response.ok) { // PAS D'ERREUR
                const jsonData = await response.json(); // Attends la reponse du serveur
                // Intialise un array pour stocker la liste des villes commençant par notre recherche.
                let villes = [];

                // Parcours les noms de ville du fichier json et les compare avec notre recherche.
                for (const index in jsonData) {
                    if (jsonData[index].country == "FRA") { // Si la ville est située en france
                        const cityURL = jsonData[index].name.toLowerCase(); // Converti en minuscule le nom de ville extrait du json.
                        const inputSearch = searching.value.toLowerCase(); // Converti en minuscule notre recherche.
                        let bool = cityURL.startsWith(inputSearch); // Renvoie true si le nom de ville commence par notre recherche.
                        if (cityURL.startsWith(inputSearch)) {
                            // Initialise un objet pour stocker le nom et l'url des villes qui correspondent a notre recherche.
                            let values = {};
                            values.name = jsonData[index].name;
                            values.url = jsonData[index].url;
                            console.log(values);
                            // Ajoute la ville à la liste des villes
                            villes.push(values);
                        }
                    }
                }
                // console.log("Villes : " + villes);
                // Ajout le tableau de la recherche dans un élément de liste, si inférieur à 500 (pour ne pas planter le navigateur).
                let html;
                if (villes.length < 500) {
                    for (ville of villes) {
                        html += `<option value="${ville.url}">${ville.name}</option>`
                    }
                    document.getElementById("search-select").innerHTML = html;
                } else {
                    document.getElementById("search-select").innerHTML = `<option value="search">Affiner votre recherche ...</option>`;
                }
            } else {
                // ERREUR 404 LA PAGE N'EXISTE PAS
                console.error('server response : ' + response.status);
            }
        }

    } catch (error) {
        // ERREUR DE REQUETE LE SERVEUR NE REPONDS PAS
        console.error(error);
    }
}

// Lance une requete au serveur lorsque l'on selectionne une ville dans la liste de recherche.
const myselect = document.getElementById("search-select");
myselect.addEventListener('change', () => {
    toogleSearch();
    showCityFetch(myselect.value);
});

/*---------------------------------------------------------------------
        RECUPERE LES INFORMATIONS METEO POUR UNE VILLE DONNEES
-------------------------------------------------------------------- */

/*----METHODE N° 1 ASYNCHRONE XMLHttpRequest ----*/
function showCity(city) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
            var response = JSON.parse(this.responseText);
            update(response);
        }
    };
    request.open("GET", "https://www.prevision-meteo.ch/services/json/" + city);
    request.send();
}
// showCity ("marseille");


/*---- METHODE N° 2 ASYNCHRONE Fetch ----*/
// const showCityFetch = async (city) => {
// async function showCityFetch(city) {
const showCityFetch = async function (city) {
    try {
        const response = await fetch("https://www.prevision-meteo.ch/services/json/" + city);
        if (response.ok) {
            const ville_json = await response.json();
            update(ville_json);
        } else {
            // ERREUR 404 LA PAGE N'EXISTE PAS
            console.error('server response : ' + response.status);
        }
    } catch (error) {
        // ERREUR DE REQUETE LE SERVEUR NE REPONDS PAS
        console.error(error);
    }
}
showCityFetch("marseille");

// AUTRE METHODE
// Si je clique sur le nom de la ville j'affiche l'input pour la recherche
// let ville = document.querySelector('.info-meteo__search__link');
// ville.addEventListener('click', function () {
//     showInput();
//     let myInput = document.querySelector(".info-meteo__search__input");
//     myInput.addEventListener('change', onInputChanged);

//     function onInputChanged(e) {
//         city = myInput.value;
//         showCityFetch(city);
//         // Remove the event listener
//         myInput.removeEventListener('input', onInputChanged);

//         // Remove the input
//         hideInput();
//     }
// });

/* -----------------------------------------------------------------------------
                        AFFICHAGE DES INFO METEO
------------------------------------------------------------------------------ */
function showInput() {
    document.querySelector(".info-meteo__search__link").classList.add("hidden");
    document.querySelector(".info-meteo__search__input").classList.remove("hidden");
    document.querySelector(".info-meteo__search__input").value = "";
}

function hideInput() {
    // Remove the event listener
    document.querySelector(".info-meteo__search__link").classList.remove("hidden");
    document.querySelector(".info-meteo__search__input").classList.add("hidden");
}

function update(response) {
    document.querySelector(".info-meteo__ville").textContent = response.city_info.name;
    document.querySelector('.info-meteo__img').src = response.current_condition.icon_big;
    document.querySelector('.info-meteo__temp-Low').textContent = response.fcst_day_0.tmin + "°C";
    document.querySelector('.info-meteo__temp-medium').textContent = response.current_condition.tmp + "°C";
    document.querySelector('.info-meteo__temp-hight').textContent = response.fcst_day_0.tmax + "°C";
    document.querySelector('.info-meteo__date').textContent = response.fcst_day_0.day_long + " " + response.fcst_day_0.date;
    generate_prevision(response);
}

function generate_prevision(response) {
    let properties = [response.fcst_day_0, response.fcst_day_1, response.fcst_day_2, response.fcst_day_3, response.fcst_day_4];
    let html = "";
    // let test3 = response["fcst_day_" + 0];
    for (let property of properties) {
        html += `<aside class="col-3">
            <h4>${property.day_short}</h4>
            </aside>
            <aside class="col-3 text-right">
                <img src="${property.icon}" alt="">
            </aside>
            <aside class="col-3 text-right"><h4>${property.tmin} °C</h4></aside>
            <aside class="col-3 text-right"><h4>${property.tmax} °C</h4></aside>`
    }
    document.querySelector('.prevision').innerHTML = html
}