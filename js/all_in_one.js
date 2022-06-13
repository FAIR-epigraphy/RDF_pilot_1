﻿const allData = JSON.parse(localStorage.getItem('jsonAllData'));


if (allData !== undefined && allData !== null) {
    //console.log(allData);
    //const myLatLng = { lat: -25.363, lng: 131.044 };
    var legend = document.getElementById("legend");
    var uniqueLanguages = [];
    var commonInscriptions = [];

    var map = null;

    var infoWindow = new google.maps.InfoWindow({
        content: "",
        disableAutoPan: true,
    });

    //// Show Map
    $('#map').hide();
    $('#legend').hide();
    $('#loader-wrapper').show()
    initMap().then((res) => {
        $('#map').show();
        $('#legend').show();
        $('#loader-wrapper').hide()
    })

    ///////////////////////////////////////////////////////////////
    async function initMap() {
        var lat_lng = '';

        for (let inscription of allData) {
            if (inscription.geo !== undefined) {
                lat_lng = [parseFloat(inscription.geo.split(',')[0]), parseFloat(inscription.geo.split(',')[1])]
            }
            else {
                let lt_lg = await getLatLng(inscription.foundAt);
                if (lt_lg !== undefined && lt_lg !== null && lt_lg.length > 0) {
                    //showGoogleMap(lat_lng, inscription);
                    lat_lng = lt_lg
                }
            }

            if (commonInscriptions.length === 0) {
                let dictTMID = { tmId: 0, lat_lng: '', inscriptions: [] };
                //
                //showGoogleMap(lat_lng, inscription);
                dictTMID.tmId = inscription.tmId;
                dictTMID.lat_lng = lat_lng;
                dictTMID.inscriptions.push(inscription);
                commonInscriptions.push(dictTMID);
            }
            else if (commonInscriptions.find(x => x.tmId === inscription.tmId) === undefined) {
                if (commonInscriptions.find(x => JSON.stringify(x.lat_lng) === JSON.stringify(lat_lng)) === undefined) {
                    let dictTMID = { tmId: 0, lat_lng: '', inscriptions: [] };
                    //
                    //showGoogleMap(lat_lng, inscription);
                    dictTMID.tmId = inscription.tmId;
                    dictTMID.lat_lng = lat_lng;
                    dictTMID.inscriptions.push(inscription);
                    commonInscriptions.push(dictTMID);
                }
                else {
                    let obj = commonInscriptions.find(x => JSON.stringify(x.lat_lng) === JSON.stringify(lat_lng));
                    obj.inscriptions.push(inscription)
                }
            }
            else {
                let obj = commonInscriptions.find(x => x.tmId === inscription.tmId);
                obj.inscriptions.push(inscription)
            }

            //uniqueLanguages.push(inscription.language);
            //break;
        }

        for (let commonIns of commonInscriptions) {
            uniqueLanguages.push(commonIns.inscriptions[0].language)
            showGoogleMap(commonIns.lat_lng, commonIns.inscriptions);
        }

        uniqueLanguages = [...new Set(uniqueLanguages)];
        for (let l of uniqueLanguages) {
            const div = document.createElement("div");
            div.innerHTML = '<img src="' + getDisplayIcon(l) + '"> ' + getLanguageName(l);
            legend.appendChild(div);
        }
        map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(legend);
        //alert(uniqueLanguages)
    }

    function showGoogleMap(lat_lng, inscriptions) {
        const myLatLng = { lat: parseFloat(lat_lng[0]), lng: parseFloat(lat_lng[1]) };
        //map.setCenter(myLatLng);
        if (map === null) {
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 4,
                center: myLatLng,
            });
        }
        
        const marker = new google.maps.Marker({
            position: myLatLng,
            map,
            //title: inscription.inscriptionLabel,
            icon: {
                url: getDisplayIcon(inscriptions[0].language)
            },
        });

        // markers can only be keyboard focusable when they have click listeners
        // open info window when marker is clicked
        marker.addListener("click", () => {
            let ins = '<div style="width:250px;max-height: 200px;">';
            for (let inscription of inscriptions) {
                ins += `
                            <a href="${inscription.inscriptionURI}" target="_blank" class="text-decoration-none" title="${inscription.inscriptionLabel}">${inscription.inscriptionLabel.length <= 50 ? inscription.inscriptionLabel : inscription.inscriptionLabel.substring(0, 49) + '...'}</a> <br />
                           <b>Inscription Id:</b> ${getInscriptionId(inscription.inscriptionId)} <br />
                           <b>Trismegistos Id:</b> ${getTrismegistosID(inscription.tmId)}
                        <hr />`;
            }
            ins += '</div>';
            infoWindow.setContent(ins);
            infoWindow.open(map, marker);
        });

    }

    function getDisplayIcon(language) {
        let url = "https://maps.google.com/mapfiles/ms/icons/";

        switch (language) {
            case 'la':
                url += "blue-dot.png";
                break;
            case 'grc':
                url += "green-dot.png";
                break;
            default:
                url += "red-dot.png";
        }

        return url;
    }
}
else {
    location.href = 'index.html';
}