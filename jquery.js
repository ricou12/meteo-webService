// let city;
// let test = false;

/* ----------------------------------------------------------------------------------------------------
                                            INTERROGER LE SERVEUR
---------------------------------------------------------------------------------------------------- */
// Si on click sur le bouton alors on affiche les éléments de recherche.
$(".search-img").on('click', () => toogleSearch());
function toogleSearch(){
     $(".search-img").toggleClass("hidden");
    $(".search_input").toggleClass("hidden");
    $(".search_select").toggleClass("hidden");
}
/* --------------------------------------------------------------------
                RECUPERE LA LISTE DES VILLES
-------------------------------------------------------------------- */
// $("#search-input").on('input', () => {
//     console.log($("#search-input").val().length);
// });  
 
$("#search-input").on('input', async() => {
    try {
        // Si au moins 1 caractere est saisie dans la barre de recherche alors on interroge le serveur.
        if ( $("#search-input").val().length != 0 ) {
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
                        let bool = cityURL.startsWith($("#search-input").val().toLowerCase()); // Renvoie true si le nom de ville commence par notre recherche.
                        if (cityURL.startsWith($("#search-input").val().toLowerCase())) {
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
});


// Lance une requete au serveur lorsque l'on selectionne une ville dans la liste de recherche.
$("#search-select").on('change', () => {
    toogleSearch();
    showCityFetch($("#search-select").val());
});

/*---------------------------------------------------------------------
        RECUPERE LES INFORMATIONS METEO POUR UNE VILLE DONNEES
-------------------------------------------------------------------- */

/*----METHODE N° 1 ASYNCHRONE XMLHttpRequest ----
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
*/

/*---- METHODE N° 2 ASYNCHRONE Fetch ----*/
// const showCityFetch = async (city) => {
// async function showCityFetch(city) {
const showCityFetch = async(city) => {
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


/* -----------------------------------------------------------------------------
                        AFFICHAGE DES INFO METEO
------------------------------------------------------------------------------ */
function showInput() {
    $(".info-meteo__search__link").addClass("hidden");
    $(".info-meteo__search__input").removeClass("hidden");
    $(".info-meteo__search__input").attr('value',"");
}

function hideInput() {
    // Remove the event listener
    $(".info-meteo__search__link").removeClass("hidden");
    $(".info-meteo__search__input").addClass("hidden");
}

function update(response) {
    $('.info-meteo__ville').text(response.city_info.name);
    $('.info-meteo__img').attr('src',response.current_condition.icon_big);
    $('.info-meteo__temp-Low').text(response.fcst_day_0.tmin + "°C");
    $('.info-meteo__temp-medium').text(response.current_condition.tmp + "°C");
    $('.info-meteo__temp-hight').text(response.fcst_day_0.tmax + "°C");
    $('.info-meteo__date').text(response.fcst_day_0.day_long + " " + response.fcst_day_0.date);
    $('.prevision').html(generate_prevision(response));
}

function generate_prevision(response) {
    /*
    METHODE N°1
    let properties = [response.fcst_day_0, response.fcst_day_1, response.fcst_day_2, response.fcst_day_3, response.fcst_day_4];
    let html = "";
    for (let property of properties) {
        html += `<aside class="col-3">
            <h4>${property.day_short}</h4>
            </aside>
            <aside class="col-3 text-right">
                <img src="${property.icon}" alt="">
            </aside>
            <aside class="col-3 text-right" style="white-space: nowrap;"><h4>${property.tmin} °C</h4></aside>
            <aside class="col-3 text-right" style="white-space: nowrap;"><h4>${property.tmax} °C</h4></aside>`
    }
    return html
    */
   
    /*
    METHODE N°2 : MAP RENVOIE UN TABLEAU AUGMENTE A CHAQUE OCCURRENCE DU TABLEAU PASSE DS LA FONCTION MAP
    return [1, 2, 3, 4].map(days => {
        return `<aside class="col-3">
                    <h4>${response["fcst_day_" + days].day_short}</h4>
                </aside>
                <aside class="col-3 text-right">
                    <img src="${response["fcst_day_" + days].icon}" alt="">
                </aside>
                <aside class="col-3 text-right" style="white-space: nowrap;">
                    <h4>${response["fcst_day_" + days].tmin} °C</h4>
                </aside>
                <aside class="col-3 text-right" style="white-space: nowrap;">
                    <h4>${response["fcst_day_" + days].tmax} °C</h4>
                </aside>` 
    }).join('');  
    */

    /* METHODE N°3 : MAP
    return [1, 2, 3, 4].map(days => response["fcst_day_" + days]).map(day => {
        return `<aside class="col-3">
                    <h4>${day.day_short}</h4>
                </aside>
                <aside class="col-3 text-right">
                    <img src="${day.icon}" alt="">
                </aside>
                <aside class="col-3 text-right" style="white-space: nowrap;">
                    <h4>${day.tmin} °C</h4>
                </aside>
                <aside class="col-3 text-right" style="white-space: nowrap;">
                    <h4>${day.tmax} °C</h4>
                </aside>` 
    }).join('');
    */

    // METHODE N°4 : REDUCE RENVOIE UNE SEUL VALEUR A PARTIR DE TOUTE LES OCCURRENCES
    return [1, 2, 3, 4].reduce((accumlator,currentValue) => {
        const day =  response["fcst_day_" + currentValue];
       
        return accumlator + `<aside class="col-3">
                    <h4>${day.day_short}</h4>
                </aside>
                <aside class="col-3 text-right">
                    <img src="${day.icon}" alt="">
                </aside>
                <aside class="col-3 text-right" style="white-space: nowrap;">
                    <h4>${day.tmin} °C</h4>
                </aside>
                <aside class="col-3 text-right" style="white-space: nowrap;">
                    <h4>${day.tmax} °C</h4>
                </aside>` 
    },"");

    /* METHODE N°5 : REDUCE RACCOURCI
    return [1, 2, 3, 4].reduce((accumlator, currentValue) => accumlator + 
               `<aside class="col-3">
                    <h4>${response["fcst_day_" + currentValue].day_short}</h4>
                </aside>
                <aside class="col-3 text-right">
                    <img src="${response["fcst_day_" + currentValue].icon}" alt="">
                </aside>
                <aside class="col-3 text-right" style="white-space: nowrap;">
                    <h4>${response["fcst_day_" + currentValue].tmin} °C</h4>
                </aside>
                <aside class="col-3 text-right" style="white-space: nowrap;">
                    <h4>${response["fcst_day_" + currentValue].tmax} °C</h4>
                </aside>`
   , "");
   */
}
