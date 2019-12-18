var infoG = document.querySelector(".info-meteo");
var image = infoG.children[1];
var temp = infoG.children[2];
var myDate = infoG.children[3];

var request = new XMLHttpRequest();
request.onreadystatechange = function () {
    if (this.readyState == XMLHttpRequest.DONE && this.status == 200) {
        var response = JSON.parse(this.responseText);
        update(response);
    }
};
request.open("GET", "https://www.prevision-meteo.ch/services/json/toulon");
request.send();

function update(response) {
    document.querySelector(".info-meteo__ville").textContent = response.city_info.name;
    document.querySelector('.info-meteo__img').src = response.current_condition.icon_big;
    document.querySelector('.info-meteo__temp-Low').textContent = response.fcst_day_0.tmin + "°";
    document.querySelector('.info-meteo__temp-medium').textContent = response.current_condition.tmp + "°";
    document.querySelector('.info-meteo__temp-hight').textContent = response.fcst_day_0.tmax + "°";
    document.querySelector('.info-meteo__date').textContent = response.fcst_day_0.day_long + " " + response.fcst_day_0.date;

    let prevision = document.querySelector("prevision");
    let properties = [response.fcst_day_0, response.fcst_day_1, response.fcst_day_2, response.fcst_day_3, response.fcst_day_4];
    let html = "";
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
