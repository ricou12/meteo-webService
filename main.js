let city;
// Si je clique sur le nom de la ville j'affiche l'input pour la recherche
let ville = document.querySelector('.info-meteo__search__link');
ville.addEventListener('click',function(){
    showInput();

    let myInput = document.querySelector(".info-meteo__search__input");
    myInput.addEventListener('input', onInputChanged);
    function onInputChanged(e){
        // if(e.key == "enter"){
            city = myInput.getAttribute('value');
            if (showCity(city)){
                 showCity(city);
              // Remove the event listener
            myInput.removeEventListener('input', onInputChanged);

            // Remove the input
            hideInput();  
            }
 
        }
    // }   
});

function showInput(){
    document.querySelector(".info-meteo__search__link").classList.add("hidden");
    document.querySelector(".info-meteo__search__input").classList.remove("hidden");
}
function hideInput(){
    document.querySelector(".info-meteo__search__link").classList.remove("hidden");
    document.querySelector(".info-meteo__search__input").classList.add("hidden");
}

showCity("marseille");

function showCity(city){
  var request = new XMLHttpRequest();
request.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        var response = JSON.parse(this.responseText);
        update(response);
        return true;
    } else {
        return false;
    }
};
request.open("GET", "https://www.prevision-meteo.ch/services/json/" + city);
request.send();  
}



function update(response) {
    document.querySelector(".info-meteo__ville").textContent = response.city_info.name;
    document.querySelector('.info-meteo__img').src = response.current_condition.icon_big;
    document.querySelector('.info-meteo__temp-Low').textContent = response.fcst_day_0.tmin + "°";
    document.querySelector('.info-meteo__temp-medium').textContent = response.current_condition.tmp + "°";
    document.querySelector('.info-meteo__temp-hight').textContent = response.fcst_day_0.tmax + "°";
    document.querySelector('.info-meteo__date').textContent = response.fcst_day_0.day_long + " " + response.fcst_day_0.date;
    generate_prevision(response);
}

function generate_prevision(response){
let properties = [response.fcst_day_0, response.fcst_day_1, response.fcst_day_2, response.fcst_day_3, response.fcst_day_4];
    let html = "";
    // let test3 = response["fcst_day_" + 0];
    for (let property of properties) {
        html +=  `<aside class="col-3">
            <h4>${property.day_short}</h4>
            </aside>
            <aside class="col-3 text-right">
                <img src="${property.icon}" alt="">
            </aside>
            <aside class="col-3 text-right"><h4>${property.tmin}</h4></aside>
            <aside class="col-3 text-right"><h4>${property.tmax}</h4></aside>`
    }
    document.querySelector('.prevision').innerHTML = html
}