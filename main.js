window.onload = () => {
    getLocation();
};

const radiusInput = document.getElementById("radius");
const coordsInput = document.getElementById("coords");
const sites = document.getElementById("sites");
const searchBtn = document.getElementById("searchPlaces");
const statusTxt = document.getElementById("status");

let tmpMarker;
let markerHistory = [];

function initMap(position) {
    const center = {
        lat: position != undefined ? position.coords.latitude : -34.905501,
        lng: position != undefined ? position.coords.longitude : -56.185114,
    };

    coordsInput.value = `${center.lat.toFixed(6)}, ${center.lng.toFixed(6)}`;

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center,
        styles: [
            {
                featureType: "poi",
                stylers: [{ visibility: "off" }],
            },
            {
                featureType: "transit",
                elementType: "labels.icon",
                stylers: [{ visibility: "off" }],
            },
        ],
    });

    google.maps.event.addListener(map, "click", function (event) {
        showSearchArea(event);
    });

    temporalyArea(center.lat, center.lng);
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(initMap);
    } else {
        alert("Tu navegador no soporta la geolocalización.");
    }
}

function showSearchArea(event) {
    const clickedCoordinates = event.latLng;
    console.log(event);
    console.log(event.latLng);

    const getLat = parseFloat(clickedCoordinates.lat().toFixed(6));
    const getLng = parseFloat(clickedCoordinates.lng().toFixed(6));

    if (tmpMarker != undefined) {
        tmpMarker.setMap(null);
    }
    temporalyArea(getLat, getLng);
}

const temporalyArea = (lat, lng) => {
    const radius = parseInt(radiusInput.value);
    tmpMarker = new google.maps.Circle({
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
        map,
        center: { lat, lng },
        radius: radius || 500,
    });

    google.maps.event.addListener(tmpMarker, "click", function (event) {
        showSearchArea(event);
    });

    coordsInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
};

radiusInput.addEventListener("change", () => {
    tmpMarker.setRadius(parseInt(radiusInput.value));
});

document.getElementById("viewHistory").addEventListener("click", () => {
    document.getElementById("historyList").classList.toggle("show");
});

searchBtn.addEventListener("click", async () => {
    const coords =
        document.getElementById("coords").value || "-34.9055016, -56.1851147";
    const coordX = coords.split(",")[0] || "";
    const coordY = coords.split(",")[1] || "";
    const radius = document.getElementById("radius").value || 500;
    const type = document.getElementById("types").value;
    statusTxt.innerText = "Cargando";

    const data = {
        coords: `${coordX},${coordY}`,
        radius,
        type,
    };

    saveHistory(data);

    searchPlaces(data);
});

function saveHistory(data) {
    for (let key in localStorage) {
        if (
            localStorage.hasOwnProperty(key) &&
            JSON.stringify(JSON.parse(localStorage.getItem(key))) ===
                JSON.stringify(data)
        ) {
            return;
        }
    }

    let fechaActual = new Date();
    let año = fechaActual.getFullYear();
    let mes = (fechaActual.getMonth() + 1).toString().padStart(2, "0");
    let dia = fechaActual.getDate().toString().padStart(2, "0");
    let horas = fechaActual.getHours().toString().padStart(2, "0");
    let minutos = fechaActual.getMinutes().toString().padStart(2, "0");
    let segundos = fechaActual.getSeconds().toString().padStart(2, "0");
    let milisegundos = fechaActual
        .getMilliseconds()
        .toString()
        .padStart(3, "0");
    let fechaFormateada = `${año}-${mes}-${dia} ${horas}:${minutos}:${segundos}.${milisegundos}`;

    localStorage.setItem(fechaFormateada, JSON.stringify(data));
}










function searchPlaces(data) {

    var requestOptions = {
        method: 'GET',
        redirect: 'follow'
      };
      
      fetch("https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=-34.873428,-56.171798&radius=500&type=airport&key=AIzaSyBEPSYLKBt_5_R1BVJv14ICJp3S7FM2MkA", requestOptions)
        .then(response => console.log(response))
        .then(result => console.log(result))
        .catch(error => console.log('error', error));


    const radius = data.radius || 500;
    const type = data.type || "restaurant";

    const apiKey = "AIzaSyBEPSYLKBt_5_R1BVJv14ICJp3S7FM2MkA";
    const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${data.coords}&radius=${radius}&type=${type}&key=${apiKey}`;

    console.log(apiUrl) 

    const headers = new Headers({
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
    });

    fetch(apiUrl, {
        method: "GET",
        headers: headers,
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Error de red - ${response.status}`);
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
        })
        .catch((error) => {
            console.error("Error al realizar la solicitud:", error);
        });




    // fetch(apiUrl)
    // .then((result) => {
    //     console.log(result)
    // })
    //       const { results, next_page_token } = await response.json();

    //       const placesToContact = [];

    //       for (const place of results) {
    //         const placeInfo = await getPlacesInfo(place.place_id);
    //         placesToContact.push(placeInfo);
    //       }

    //       if (next_page_token) {
    //         const nextPagePlaces = await getMorePlaces(next_page_token);
    //         placesToContact.push(...nextPagePlaces);
    //       }

    //       console.log(placesToContact)
}

app.get("/api/places", async (req, res) => {
    console.log(req);
    const apiKey = "AIzaSyBEPSYLKBt_5_R1BVJv14ICJp3S7FM2MkA";

    const getPlaces = async () => {
        const locationX = req.query.x || "-34.9055016";
        const locationY = req.query.y || "-56.1851147";
        const radius = req.query.radius || 500;
        const type = req.query.type || "restaurant";

        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${locationX},${locationY}&radius=${radius}&type=${type}&key=${apiKey}`;

        const response = await fetch(apiUrl);
        const { results, next_page_token } = await response.json();

        const placesToContact = [];

        for (const place of results) {
            const placeInfo = await getPlacesInfo(place.place_id);
            placesToContact.push(placeInfo);
        }

        if (next_page_token) {
            const nextPagePlaces = await getMorePlaces(next_page_token);
            placesToContact.push(...nextPagePlaces);
        }

        return placesToContact;
    };

    const getPlacesInfo = async (placeId) => {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/details/json?&place_id=${placeId}&key=${apiKey}`;
        const response = await fetch(apiUrl);
        const { result } = await response.json();

        const name = result.name;
        const address = result.formatted_address;
        const types = result.types;
        const website = result.website;
        const phone = result.formatted_phone_number;

        const coords = {
            x: result.geometry.location.lat,
            y: result.geometry.location.lng,
        };

        const placeInfo = {
            name,
            address,
            types,
            website,
            coords,
            phone,
        };

        return placeInfo;
    };

    const getMorePlaces = async (pageToken) => {
        const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?pagetoken=${pageToken}&key=${apiKey}`;

        const response = await fetch(apiUrl);
        const { results, next_page_token } = await response.json();

        const placesToContact = [];

        for (const place of results) {
            const placeInfo = await getPlacesInfo(place.place_id);
            placesToContact.push(placeInfo);
        }

        if (next_page_token) {
            const nextPagePlaces = await getMorePlaces(next_page_token);
            placesToContact.push(...nextPagePlaces);
        }

        return placesToContact;
    };

    const places = await getPlaces();
    res.json(places);
});
