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
            console.error('No se encontraron datos para el país:', countryName);
            return null;
        }
    } catch (error) {
        console.error('Error al obtener datos de REST Countries API:', error);
        return null;
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

    const form = document.getElementById("myForm");
    let mymap; 

    form.addEventListener("submit", function (event) {
        event.preventDefault();

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

        console.log(formData);

        const stateIdElement = document.getElementById("state_id");
        const countryName = stateIdElement.options[stateIdElement.selectedIndex].text;

        if (mymap) {
            mymap.remove();
        }

        getCountryCoordinates(countryName)
            .then(coordinates => {
                if (coordinates) {
                    console.log(`Coordenadas de ${countryName}:`, coordinates);

                    const mymap = L.map('mapid').setView([coordinates.latitude, coordinates.longitude], 2);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '© OpenStreetMap contributors'
                    }).addTo(mymap);

                    const marker = L.marker([coordinates.latitude, coordinates.longitude]).addTo(mymap);
                    marker.bindPopup(`<b>${countryName}</b><br>Latitud: ${coordinates.latitude}<br>Longitud: ${coordinates.longitude}`).openPopup();
                }
            })
            .catch(error => {
                console.error("Error al obtener coordenadas:", error);
            })
            .finally(() => {
                // Asegúrate de que este código se ejecute incluso si hay un error
                fetch("/api/modeloAnalisis", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                })
                    .then(response => response.json())
                    .then(data => {
                        console.log("Respuesta de la API:", data);
                    })
                    .catch(error => {
                        console.error("Error al enviar datos a la API:", error);
                    });
            });

    });



});


