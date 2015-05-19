var base
var labels
var imagery
var plants
var box
var bounds = L.bounds()
var featurz = []

$( document ).ready(function() {
    console.log("document ready")
    main();
    $('#layers-list').dropdown('toggle');
    $('#cover').fadeOut(1);
    //$('.bxslider').bxSlider();
});

L.mapbox.accessToken = 'pk.eyJ1IjoiZWxjdXJyIiwiYSI6IkZMekZlUEEifQ.vsXDy4z_bxRXyhSIvBXc2A'

function main() {
    var map = L.map('map', { 
      zoomControl: false,
      center: [34.2190, -78.5266],
      zoom: 6
    });
  
    base = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
    })
    /*L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/terrain.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
	attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
	subdomains: '1234',
	mapID: 'newest',
	app_id: 'Y8m9dK2brESDPGJPdrvs',
	app_code: 'dq2MYIvjAotR8tHvY8Q_Dg',
	base: 'aerial',
	maxZoom: 20
    })*/
    /*L.tileLayer('http://a{s}.acetate.geoiq.com/tiles/acetate-base/{z}/{x}/{y}.png', {
	attribution: '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
	subdomains: '0123',
	minZoom: 2,
	maxZoom: 18
    })*/
    .addTo(map)
    
    labels = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/roads_and_labels/{z}/{x}/{y}.png', {
        attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })
    .setOpacity(.5)
    //.addTo(map)
    
    imagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })
  
    states = omnivore.geojson('https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM all_states&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349')
    .on('ready', function(go) {
            this.eachLayer(function(polygon) {
                if (polygon.feature.properties.name == 'North Carolina' || polygon.feature.properties.name =='South Carolina' || polygon.feature.properties.name == 'Virginia' || polygon.feature.properties.name =='Tennessee' || polygon.feature.properties.name == 'Georgia' || polygon.feature.properties.name =='Alabama') {
                    polygon.setStyle ( {
                        color: '#999', 
                        opacity: 1,
                        weight: 2,
                        fillColor: '#C3CC8F',//'#C2D193',
                        fillOpacity: 0,
                    });
                    
                    polygon.on('click', function(e){    
                        map.fitBounds(polygon.getBounds())
                        /*states.setStyle({
                            weight: 1,
                            fillColor: '#C3CC8F',//'#C3C3BE',
                            fillOpacity: .4,
                        });
                        e.layer.setStyle ( {
                            weight: 1, 
                            fillOpacity: .3, 
                        });*/
                    })
                    polygon.on('mouseover', function(e) {
                        states.setStyle ( {
                            fillOpacity: 0, 
                        });
                        e.layer.setStyle ( {
                            fillOpacity: .2, 
                        });
                    });
                    polygon.on('mouseout', function(e) {
                        e.layer.setStyle ( {
                            fillOpacity: .2, 
                        });
                    });
                } else {
                    polygon.setStyle ( {
                        color: '#fff', 
                        opacity: 1,
                        weight: 0,
                        fillColor: '#FFF8E3',
                        fillOpacity: 0,
                    })
                }
            })
        })
    .addTo(map)
    
  plants = omnivore.geojson("https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM coalashplants WHERE state <> 'KY' AND selc_ltgtn ='No'&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349")
  .on('ready', function(go){
    console.log("plants ready")
    this.eachLayer(function(marker) {
        console.log("each plant")
        var color= '#374140'//'rgba(0, 163, 136, 1)' //'#00A388'
        var border_color= 'rgba(255, 255, 255, .5)'
        var label = marker.feature.properties.power_plan
        var src = []

        marker.bindLabel(label)
        
	marker.setIcon(L.divIcon( {
            iconSize: [1, 1],
            popupAnchor: [0, 10], 
            html: '<div style="margin-top: -10px; margin-left: -10px; text-align:center; color:#fff; border:3px solid ' + border_color +'; height: 20px; width: 20px; padding: 5px; border-radius:50%; background:' +
            color + '"></div>'
        }))
	
        /*marker.setIcon(L.mapbox.marker.icon({
	    'marker-size': 'large',
	    'marker-symbol': 'danger',
	    'marker-color': '#374140',
	    })
	)*/
	
        var url = marker.feature.properties.factsheet
        
        
        marker.on('click', function(e){
            console.log(e.target.feature.properties.media_count)
            if (e.target.feature.properties.media_count > 0) {
                openDialog(e.target.feature)
            }
            //ponds = L.geoJson()
            ponds = omnivore.geojson('https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM coalashponds WHERE plant_id =' + marker.feature.properties.plant_code +'&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349')
            .on('ready', function(go) {
                this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                            color: '#1334B9',//'#594736', 
                            opacity: 1,
                            weight: 3, 
                            fillColor: '#1334B9',//'#594736',  
                            fillOpacity: 0
                    })
                    var label = '<div>'+ polygon.feature.properties.impoundmen +' | '+polygon.feature.properties.plant_full+''
                        label += '</br> Condition Assessment: '+ polygon.feature.properties.epa_con_as
                        label += '</div>'
                    polygon.bindLabel(label)
		    if (e.target.feature.properties.media_count != null) {
			polygon.on('click', function(){
			    openDialog("00")
			}) 
		    } 
                })
                //pondStyle(ponds)  
            })
            .addTo(map)
	    
	    box = omnivore.geojson('https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM ash_pond_extents WHERE plant_code =' + marker.feature.properties.plant_code +'&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349')
	    .on('ready', function(go) {
		this.eachLayer(function(polygon) {
		    map.fitBounds(polygon.getBounds())
		})
	    })
	    
	    map.removeLayer(base)
	    map.addLayer(imagery)
            map.removeLayer(plants)
	    map.removeLayer(selc_plants)
	    document.getElementById('menu-ui').style.display = 'none'
            
        })
    })
    layer = plants
    var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
	link.innerHTML = '<i class="fa fa-lg fa-circle others sp"></i>No SELC litigation'
        //link.innerHTML = '<img style="width: 25px" src="https://api.tiles.mapbox.com/v4/marker/pin-l-danger+374140.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q"><p>No SELC litigation</p>';

    link.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (map.hasLayer(layer)) {
            map.removeLayer(layer);
            this.className = '';
        } else {
            map.addLayer(layer);
            this.className = 'active';
        }
    };
    var layers = document.getElementById('menu-ui')
    layers.appendChild(link);
    
  }).addTo(map)
  
  selc_plants = omnivore.geojson("https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM coalashplants WHERE state <> 'KY' AND selc_ltgtn ='Yes'&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349")
  .on('ready', function(go){
    //console.log("plants ready")
    this.eachLayer(function(marker) {
        console.log("each plant")
        var label = marker.feature.properties.power_plan
        var content
	count = marker.feature.properties.media_count
        
        var color = '#FF6138'
        var border_color = 'rgba(255, 255, 255, .5)', //'#FF6138'
        content = marker.feature.properties.power_plan + '</br>'
	if (count != null) {
	    border_color = '#007E85',//'#003685'
	    media = (marker.feature.properties.media).split('&')
	    content += '<img src="' + media[0] + '" style="width: 180px; height: 180px;">'
	}
        marker.bindLabel(content)
        
	marker.setIcon(L.divIcon( {
            iconSize: [1, 1],
            popupAnchor: [0, 10], 
            html: '<div style="margin-top: -10px; margin-left: -10px; text-align:center; color:#fff; border:3px solid ' + border_color +'; height: 20px; width: 20px; padding: 5px; border-radius:50%; background:' +
            color + '"></div>'
        }))
	
        /*marker.setIcon(L.mapbox.marker.icon({
	    'marker-size': 'large',
	    'marker-symbol': 'danger',
	    'marker-color': '#FF6138',
	    })
	)*/

        var url = marker.feature.properties.factsheet
        

        marker.on('click', function(e){
            console.log(e.target.feature.properties.media_count)
            if (e.target.feature.properties.media_count > 0) {
                openDialog(e.target.feature)
            }
            //ponds = L.geoJson()
            ponds = omnivore.geojson('https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM coalashponds WHERE plant_id =' + marker.feature.properties.plant_code +'&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349')
            .on('ready', function(go) {
             this.eachLayer(function(polygon) {
                    polygon.setStyle ( {
                            color: '#1334B9',//'#594736', 
                            opacity: 1,
                            weight: 3, 
                            fillColor: '#1334B9',//'#594736',  
                            fillOpacity: 0
                    })
                    var label = '<div>'+ polygon.feature.properties.impoundmen +' | '+polygon.feature.properties.plant_full+''
                        label += '</br> Condition Assessment: '+ polygon.feature.properties.epa_con_as
                        label += '</div>'
                    polygon.bindLabel(label)
		    if (e.target.feature.properties.media_count != null) {
			polygon.on('click', function(){
			    openDialog("00")
			}) 
		    }
                })

            })
            .addTo(map)
	    
	    box = omnivore.geojson('https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM ash_pond_extents WHERE plant_code =' + marker.feature.properties.plant_code +'&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349')
	    .on('ready', function(go) {
		this.eachLayer(function(polygon) {
		    map.fitBounds(polygon.getBounds())
		})
	    })
	    
	    map.removeLayer(base)
	    map.addLayer(imagery)
            map.removeLayer(plants)
	    map.removeLayer(selc_plants)
	    document.getElementById('menu-ui').style.display = 'none'
            
        })
    })
    layer2 = selc_plants
    var link = document.createElement('a');
        link.href = '#';
        link.className = 'active';
	link.innerHTML = '<i class="fa fa-lg fa-circle selc sp"></i>SELC litigation';
        //link.innerHTML = '<img style="width: 25px" src="https://api.tiles.mapbox.com/v4/marker/pin-l-danger+FF6138.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6IlhHVkZmaW8ifQ.hAMX5hSW-QnTeRCMAy9A8Q">SELC litigation';

    link.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();

        if (map.hasLayer(layer2)) {
            map.removeLayer(layer2);
            this.className = '';
        } else {
            map.addLayer(layer2);
            this.className = 'active';
        }
    };
    var layers = document.getElementById('menu-ui')
    layers.appendChild(link);
    
  }).addTo(map)
  
  map.on('zoomend', function(){
            if (map.getZoom()>=13) {
                map.addLayer(imagery);
            } else if (map.getZoom()<=10){
                //map.removeLayer(ponds);
                map.addLayer(base);
                //map.addLayer(labels)
                map.addLayer(plants)
		map.addLayer(selc_plants)
                map.removeLayer(imagery);
                document.getElementById("menu-ui").style.display= "block"
            }
    })
  
  
}

function buildPonds(plant) {
    omnivore.geojson('https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM coalashponds&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349')
    .addTo(map)
}



function openDialog(plant) {
    if (plant != "00") {
        name = plant.properties.power_plan
        url = plant.properties.seca_url
	count = plant.properties.media_count
	media = (plant.properties.media).split('&')
	media_txt = (plant.properties.media_txt).split('&')
    }
        
    title = '<h4 style="color: black; display: inline;">'+ name +'</h4>'
    title += '<a style="font-size: 12px; margin-left: 20px;" href="' + url +'" target="_blank;"><button>more at southeastcoalash.org</button> </a>'
    message = '<ul class="bxslider">'
    
    
    for (i = 0; i < media.length; i++) {
	message += '<li><img src="' + media[i] + '" style="width: 100%"><p>'+ media_txt[i] + '</p></li>'
    }
    
    message += '</ul>'
    
    bootbox.dialog({
            message: message,
            title: title
    })
    
    var slider = $('.bxslider').bxSlider({
        captions: true,
    })
    
    var reload = setInterval(function () {slider.reloadSlider()}, 1000)
    setInterval(function(){clearInterval(reload)}, 2000)
}

