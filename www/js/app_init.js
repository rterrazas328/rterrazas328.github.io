var map;
var geocoder;
var pos;
var marker;
var cur_x=0;
var cur_y=0;
var infoWindows = [];
var lastShopClicked;
var locICON = {
    url:'img/loc.png',
    size: new google.maps.Size(20, 32)
};
var totalPrice = 0.00;

//geolocation and map initialization
function initialize_Map() {
    
    console.log("initial values: " + cur_x + " " + cur_y);

    var mapOptions = {
        zoom: 16
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    geocoder = new google.maps.Geocoder();

    if (navigator.geolocation){
        console.log("geolocation supported");
    
        //following happens when geolocation is allowed by user
        navigator.geolocation.getCurrentPosition(function (position){
            cur_x = position.coords.latitude;
            cur_y = position.coords.longitude;

            pos = new google.maps.LatLng( cur_x, cur_y);
            map.setCenter(pos);

            createMyMarker(pos, map);

            console.log("My location: " + cur_x + " " + cur_y);

            //works for tap and click
            google.maps.event.addListener(map, 'click', function(event) {

                pos = event.latLng;
                console.log("NEW Click/tap");
                console.log(pos);
                createMyMarker(pos, map);
                console.log("done creating marker on tap!");
            });

            google.maps.event.addListenerOnce(map, 'idle', function() {
                    google.maps.event.trigger(map, 'resize');
                    map.setCenter(pos);
            });

        })//end event

        
    }
    else{
        //navigator.app.exitApp();
        console.log("geolocation not supported");
    }
}

function createMyMarker(posObj, mapObj){
    if (marker == null){
        marker = new google.maps.Marker({
            position: posObj,
            map: mapObj,
            title: 'my location',
            icon: locICON
        });
    }
    else{
        marker.position = posObj;
        marker.setMap(null);
        marker.setMap(mapObj);
    }
}

function loadStores(region){
    console.log("loading stores within " + region);

    console.log("~~~~~~BEGIN AJAX REQUEST!!!~~~~~~~~~");
    //=======AJAX REQUEST==============================================================================================================
    var request = new XMLHttpRequest();
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            console.log("Got request and now printing it...");
            var resString = request.responseText;
            var resObj = JSON.parse(resString);
            //console.log(resString);
            //console.log(resObj);
            //populate map
            var index = 0;
            for (var i=0; i<resObj.length; i++){
                console.log("number of markers" + resObj.length);

                var coordArr = resObj[i].coordinates.split(",");
                var shpPos = new google.maps.LatLng(coordArr[0], coordArr[1]);

                //create marker
                var shpMarker = new google.maps.Marker({
                    position: shpPos,
                    map: map,
                    title: resObj[i].name
                });

                console.log("Printing marker...");
                //console.log(shpMarker);

                //create infowindow
                var shpInfoWindow = new google.maps.InfoWindow({
                    content: "<a href='#menu' onclick='loadMenu(\""+resObj[i].name+"\")' > <h3>" + resObj[i].name + "</h3>" + "\n" + resObj[i].address + "</a>",
                    maxWidth: 200
                });
                console.log("after create info window");
                infoWindows.push(shpInfoWindow);
                console.log("after push");

                //create click event listener
                addListenerToShopMarker(shpMarker, index);
                console.log("after add listener");
                index++;
            }
            //console.log(infoWindows);
        }
    }
    request.open("GET", "https://salty-sierra-4017.herokuapp.com/shops.php?cName="+region, true);//https://salty-sierra-4017.herokuapp.com
    request.send();
    console.log("~~~~~~SENT AJAX REQUEST!!!~~~~~~~~~");
    //========================================================================================================================
}

function addListenerToShopMarker(sMarker, n){
    var infWindowRef = infoWindows[n];
    google.maps.event.addListener(sMarker, 'click', function() {
        if(sMarker == lastShopClicked){
            console.log("SAME!");
            console.log("Opening menu for " + sMarker.title);
        }
        else{
            console.log("Clicked on different shop!");
            closeAllInfoWindows();
            infWindowRef.open(map, sMarker);
        }
        lastShopClicked = sMarker;
        
    });

}

function loadMenu(shopNm){
    console.log("Opening Menu... for " + shopNm);
    var request = new XMLHttpRequest();
    
    request.onreadystatechange = function() {
        if(request.readyState == 4 && request.status == 200) {
            console.log("Got request and now printing it...");
            console.log(request.responseText);
            var resObj = JSON.parse(request.responseText);
            var menuObj = resObj[0];
            console.log(menuObj);
            //get menu html main element
            var listRoot = document.getElementById("menuList");//$('#shopMenu > ul');
            console.log(listRoot);
            listRoot.innerHTML = "";

            //create and build menu html elements

            //append dynamic html menu variable to DOM
            //var appendString = "";
            var count = 0;
            for (var key in menuObj) {
                console.log(key);
                
                var dataType = typeof menuObj[key];
                var value = menuObj[key];
                if (key == "_id"){
                    //do nothing
                }
                else if (dataType == "number"){
                    //create list element, add checkbox to it
                    var lstElement = document.createElement("li");
                    console.log(lstElement);
                        lstElement.innerHTML = "<label><input type='checkbox' name='checkbox-" + count + "'>" + key + " : " + value + "</label>";//"<label><input type='checkbox' name='checkbox-" + count + "'><p style='font-size: 100%'>" + key + "</p><br><p style='font-size: 50%'>" + menuObj[key] + "</p></label>";
                        listRoot.appendChild(lstElement);
                }
                else if (dataType == "object"){
                    for (var innerKey in value){
                        console.log(innerKey);
                        if (typeof value[innerKey] == "number"){
                            var content = "<label><input type='checkbox' name='checkbox-" + count + "'>" + innerKey + " for " + value[innerKey] + "</label>";
                            $(content).appendTo("#menuList");
                        }
                    }
                }
                count++;
            }
            $("#menuList").enhanceWithin();
            console.log("count: " + count)
        }
    }
    request.open("GET", "https://salty-sierra-4017.herokuapp.com/shops.php?sName="+shopNm, true);
    request.send();
}

function addToTotal(priceToAdd){//change to changeTotal possibility of removing item
    var totalLabel = document.getElementById('menuTotal');
    totalPrice += priceToAdd;
    totalLabel.innerHTML = "Total: $" + totalPrice;
}

function closeAllInfoWindows(){
    for (var i=0; i<infoWindows.length; i++ ) {
        infoWindows[i].close();
    }
}


function initShopsView(){
    console.log("In initShopsView");
    //console.log("latLng: " + coordPair);

    google.maps.event.clearListeners(map, 'click');
    google.maps.event.addListener(map, "click", function(event) {
        closeAllInfoWindows();
    });

    //transition to shops view
    $('#h1 h1').text("Select a coffee shop!");
    $('#f1').text("");

    map.setZoom(13);

    //reverse geocode pos to get address
    geocoder.geocode({"latLng" : pos}, function(results, status){
        if (status == google.maps.GeocoderStatus.OK) {
            if (results[0]) {
                var addrArray = results[0].address_components
                var city;
                for (var j=0; j<addrArray.length; j++){
                   
                    if (addrArray[j].types[0] == "locality" ){
                        city = addrArray[j].long_name;
                    }
                }
                var myAddress = results[0].formatted_address;
                console.log("Found city:" + city);
                loadStores(city);
            }
        } 
        else {
            console.log("Geocoder failed due to: " + status);
        }
    });
}

function selectLocationButton(){

}