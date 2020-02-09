
const errorInfo = document.querySelector('.message');

const urlVille = "https://www.prevision-meteo.ch/services/json/";
const urlListeVille = "https://cors-anywhere.herokuapp.com/https://www.prevision-meteo.ch/services/json/list-cities/fr";
/* ----------------------------------------------------------------------------------------------------
                                            INTERROGER LE SERVEUR
---------------------------------------------------------------------------------------------------- */
// récupère l'évenement click sur le bouton de recherche et bascule les éléments de recherche.
$(".search-img").on('click', () => toogleSearch());

function toogleSearch(){
    $(".search-img").toggleClass("hidden");
    $(".search_input").toggleClass("hidden");
    $(".search_select").toggleClass("hidden");
}

/* --------------------------------------------------------------------
                EVENEMENTS CLICK RECUPERE LA LISTE DES VILLES
-------------------------------------------------------------------- */ 
$("#search-input").on('input', () => {
    // Si au moins 1 caractere est saisie dans la barre de recherche alors on interroge le serveur.
    if ($("#search-input").val().length != 0 ) {
        // Requete au serveur
        showCityFetch(urlListeVille).then(jsonData => {
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
        })
        .then((error) => {
            // ERREUR DE REQUETE LE SERVEUR NE REPONDS PAS
            console.error(error);
        });
    }
});


/*-------------------------------------------------------------------------------------------
        ENVOIE UNE REQUETE AU SERVEUR APRES AVOIR S2LECTIONNE UNE VILLE DANS LA LISTE
------------------------------------------------------------------------------------------ */
$("#search-select").on('change', () => {
    toogleSearch();
    showCityFetch(urlVille + $("#search-select").val()).then(returndata => {
        if(returndata.success){
            update(returndata.data);
        } else {
            errorInfo.innerHTML =  messageBox("Info", "Une erreur de serveur est survenue !");
           $('.toast').toast('show');
        }
    });
});

/*---------------------------------------------------------------------
        RECUPERE LES INFORMATIONS METEO POUR UNE VILLE DONNEE
-------------------------------------------------------------------- */
/*---- METHODE ASYNCHRONE Fetch ----*/
const showCityFetch = (url) => {
    return fetch(url)
        .then(res => res.json())
        .then(returndata => {
            return {
                "success" : true, "data" : returndata
            };
         })
        .catch((error) => {
            return {
                "success" : false, "data" : error.message
            };
        });        
}

/* -----------------------------------------------------------------------------
                        AFFICHAGE DES INFOS METEO
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
}

/* ----------------------------------------------------
                    MESSAGE UTILISATEUR
----------------------------------------------------- */
const messageBox = (title, info) => {
    return `
    <div class="toast" role="alert" aria-live="assertive" data-delay="5000" aria-atomic="true" style="">
        <div class="toast-header bg-danger text-white">
            <img src="..." class="rounded mr-2" alt="...">
            <strong class="mr-auto">${title}</strong>
            <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
        <div class="toast-body bg-dark text-white">
            ${info}
        </div>
    </div>`
}

/*---------------------------------------------------------------------
                    CHARGEMENT DE L'APPLICATION
-------------------------------------------------------------------- */
showCityFetch(urlVille + "marseille").then(returndata => {
    if(returndata.success){
        update(returndata.data);
    } else {
        errorInfo.innerHTML =  messageBox("Info", "Une erreur de serveur est survenue !");
       $('.toast').toast('show');
    }
});