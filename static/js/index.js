let map;

const getCountryCoordinates = async (countryName) => {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}`);
        const data = await response.json();

        if (data && data.length > 0) {
            const country = data[0];
            const latitude = country.latlng[0];
            const longitude = country.latlng[1];

            return { latitude, longitude };
        } else {
            document.getElementById("errorCountry").innerHTML = "";
            document.getElementById("errorCountry").innerHTML = `<h2>No se encontraron coordenadas para el país: ${countryName}</h2>`;
        }
    } catch (error) {
        console.error('Error al obtener datos de REST Countries API:', error);
        return;
    }
}

const getResultModel = async (dataAPI) => {
    try {
        const response = await fetch(`./api/modeloAnalisis`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dataAPI)
        });
        const data = await response.json();
        return data;
    } catch (error) {
        document.getElementById("showInfoModel").innerHTML = `<h2>Error al obtener datos de REST Countries API: ${error}</h2>`;
        return;
    }
}

const handleOptionChange = () => {
    const optionTime = document.getElementById("optionTime");
    const yearField = document.getElementById("yearField");
    const seasonField = document.getElementById("seasonField");
    const monthField = document.getElementById("monthField");

    seasonField.style.display = "none";
    monthField.style.display = "none";

    if (optionTime.value === "1") {

        yearField.style.display = "block";

    } else if (optionTime.value === "2") {

        seasonField.style.display = "block";
        yearField.style.display = "block";

    } else if (optionTime.value === "3" || optionTime.value === "4") {

        monthField.style.display = "block";
        yearField.style.display = "block";

    } else if (optionTime.value === "0") {

        yearField.style.display = "none";
        seasonField.style.display = "none";
        monthField.style.display = "none";

    }
};

document.addEventListener('DOMContentLoaded', () => {
    handleOptionChange();
    document.getElementById("btnForm").addEventListener("click", async (e) => {
        e.preventDefault();
        let depth = parseInt(document.getElementById("depth").value, 10) || 0;
        let optionTime = parseInt(document.getElementById("optionTime").value, 10) || 0;
        let year = parseInt(document.getElementById("year").value, 10) || 0;
        let season = parseInt(document.getElementById("season").value, 10) || 0;
        let month = parseInt(document.getElementById("month").value, 10) || 0;
        let significance = parseInt(document.getElementById("significance").value, 10) || 0;
        let state_id = parseInt(document.getElementById("state_id").value, 10) || 0;
    
        if (optionTime == 1) {
            season = 0;
            month = 0
        } else if (optionTime == 2) {
            month = 0;
        } else if (optionTime == 3 || optionTime == 4) {
            season = 0;
        }
    
        const formData = {
            depth,
            optionTime,
            year,
            season,
            month,
            significance,
            state_id
        };
    
        const stateIdElement = document.getElementById("state_id");
        const countryName = stateIdElement.options[stateIdElement.selectedIndex].text;
    
        const coordinates = await getCountryCoordinates(countryName);
        const dataModel = await getResultModel(formData);
        console.log(dataModel);
        
        if (coordinates) {
            document.getElementById("map").innerHTML = "";
            document.getElementById("errorCountry").innerHTML = "";
            initMap({lat: coordinates.latitude, lng: coordinates.longitude});
        }else{
            document.getElementById("map").innerHTML = "";
        }
        document.getElementById("showInfoModel").innerHTML = "";
        document.getElementById("showInfoModel").innerHTML = `<h2>Magnitud: ${dataModel.magnitudo}<br>Frecuencia: ${dataModel.frequency}</h2>`;
    
    });
    
});


async function initMap({lat, lng}) {
    // The location of Uluru
    const position = { lat: lat, lng: lng };
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerView } = await google.maps.importLibrary("marker");

    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
        zoom: 4,
        center: position,
        mapId: "Map_Main",
    });

    // The marker, positioned at Uluru
    const marker = new AdvancedMarkerView({
        map: map,
        position: position,
        title: "Uluru",
    });
}
