var map
var base
var labels
var imagery
var plants
var box
var bounds = L.bounds()
var featurz = []
var filters = document.getElementById('filters');
var checkboxes = document.getElementsByClassName('filter');
var on = ['Yes', 'No', 'In Progress', 'Committed To', 'Not Committed To']
var firstTime = true;

$( document ).ready(function() {
    console.log("document ready")
    main();
    $('#layers-list').dropdown('toggle');
    $('#cover').fadeOut(1);
    welcome();
});

L.mapbox.accessToken = 'pk.eyJ1IjoiZWxjdXJyIiwiYSI6IkZMekZlUEEifQ.vsXDy4z_bxRXyhSIvBXc2A'

function main() {
    map = L.map('map', { 
      zoomControl: false,
      center: [34.2190, -78.5266],
      zoom: 6
    });
  
    base = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
	subdomains: 'abcd',
	maxZoom: 19
    })
    .addTo(map)
    
    labels = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/roads_and_labels/{z}/{x}/{y}.png', {
        attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })
    .setOpacity(.5)
    //.addTo(map)
    
    imagery = L.tileLayer('http://{s}.{base}.maps.cit.api.here.com/maptile/2.1/maptile/{mapID}/hybrid.day/{z}/{x}/{y}/256/png8?app_id={app_id}&app_code={app_code}', {
	attribution: 'Map &copy; 1987-2014 <a href="http://developer.here.com">HERE</a>',
	subdomains: '1234',
	mapID: 'newest',
	app_id: 'nEQ9uuAzSzhj7IqEMT8a',
	app_code: 'YVqVq7pLiQSLqrF6g-jDQQ',
	base: 'aerial',
	maxZoom: 20
    });
    
    /*L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })*/
  
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
                    })
                    polygon.on('mouseover', function(e) {
                        states.setStyle ( {
                            //fillOpacity: 0,
			    weight: 2,
                        });
                        e.layer.setStyle ( {
                            //fillOpacity: .2,
			    weight: 4,
                        });
                    });
                    polygon.on('mouseout', function(e) {
                        e.layer.setStyle ( {
                            //fillOpacity: .2,
			    weight: 4,
                        });
                    });
                } else {
                    polygon.setStyle ( {
                        opacity: 0,
                        weight: 0,
                        fillOpacity: 0,
                    })
                }
            })
        })
    .addTo(map)
    
    addPlants()
    buildPonds()
    
    map.on('zoomend', function() {
        if (map.getZoom()>11) {
    		ponds.eachLayer(function(polygon) {
    		    polygon.setStyle({
    			opacity: 1,
    		    })
    		})
    		//document.getElementById('filters').style.display = 'none'
        } else if (map.getZoom()>8) {
            map.removeLayer(base)
    		map.addLayer(imagery)
    		map.addLayer(ponds)
    		ponds.eachLayer(function(polygon) {
    		    polygon.setStyle({
    			opacity: 0,
    		    })
    		})
    		//document.getElementById('filters').style.display = 'block'
	    } else if (map.getZoom()<=8){
            map.removeLayer(imagery)
    		map.removeLayer(ponds)
    		map.addLayer(base)
        }
    })
}


function addPlants(){
    var query = "SELECT * FROM southeast_coal_ash_sites_update WHERE"
    var clean = ""
    var dirty= ""
    //// Account for SELC litigation filter
    if ($.inArray('Yes', on)==-1) {
	clean = "AND info_selc_ltgtn <>'FILED' "
    }
    if ($.inArray('No', on)==-1) {
	dirty = "AND info_selc_ltgtn <>'NONE' "
    }
    
    //// Account for Clean-Up filter
    if ($.inArray('In Progress', on)==-1) {
	//query += "(info_clean_up <> 'In Progress' "+ clean + dirty +")"
    } else {
	query += "(info_cleanup = 'In Progress' "+ clean + dirty +") OR"
    }
    if ($.inArray('Committed To', on)==-1) {
	//query += " OR (info_clean_up <> 'Committed To' "+ clean + dirty +")"
    } else {
	query += " (info_cleanup = 'Committed To' "+ clean + dirty +") OR"
    }
    if ($.inArray('Not Committed To', on)==-1) {
	//query += "OR (info_clean_up <> 'Not Committed To' "+ clean + dirty +")"
    } else {
	query += " (info_cleanup = 'Not Committed To' "+ clean + dirty +") OR"
    }
    
    query += " info_cleanup = 'foo'"
    
    console.log(query)
    
    
    /*if (on.length == 2) {
	var query = "SELECT * FROM southeast_coal_ash_sites WHERE info_selc_ltgtn ='FILED' OR info_selc_ltgtn ='NONE'"
    } else {
	if (on[0]=='Yes') {
	    var query = "SELECT * FROM southeast_coal_ash_sites WHERE info_selc_ltgtn ='FILED'"
	} else {
	    var query = "SELECT * FROM southeast_coal_ash_sites WHERE info_selc_ltgtn ='NONE'"
	    
	}
    }*/
  plants = L.mapbox.featureLayer("https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=" + query + "&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349")
  .on('ready', function(go){
    console.log(on)
    this.eachLayer(function(marker) {
	console.log("each plant")
	var color
	var border
	if (marker.feature.properties.info_cleanup =='In Progress') {
	    color = '#0D5372'
	} else if (marker.feature.properties.info_cleanup =='Committed To') {
	   color= '#94B257' 
	} else {
	    color= '#EDDC88'//'#949494'
	}
	
	if (marker.feature.properties.info_selc_ltgtn =='FILED') {
	   border= '2px solid black' 
	} else {
	    border= '2px solid rgba(255, 255, 255, .5)'
	}

	var label = '<div style="font-size: 14px">'+ marker.feature.properties.facility_label +'</div>'
	var src = []

	marker.bindLabel(label)
	
	marker.setIcon(L.divIcon( {
	    iconSize: [1, 1],
	    popupAnchor: [0, 10], 
	    html: '<div style="margin-top: -10px; margin-left: -10px; text-align:center; color:#fff; border:'+ border +'; height: 18px; width: 18px; padding: 5px; border-radius:50%; background:' +
	    color + '"></div>'
	}))
	
	/*if (marker.feature.properties.info_selc_ltgtn =='FILED') {
	    marker.setIcon(L.mapbox.marker.icon({
		'marker-color': color,
		'marker-size': 'small',
		'marker-symbol': 'star',
		'marker-outline': '5px solid black',
	    }))
	} else {
	   marker.setIcon(L.mapbox.marker.icon({
		'marker-color': color,
		'marker-size': 'small',
	    }))
	}*/
	
	
	var url = marker.feature.properties.seca_factsheet_url

	marker.on('click', function(e){
	    console.log(e.target.feature.properties.media_count)
	    openDialog(e.target.feature)
	    
	    box = omnivore.geojson('https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM ash_pond_extents WHERE plant_code =' + marker.feature.properties.facility_camdbs +'&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349')
	    .on('ready', function(go) {
		this.eachLayer(function(polygon) {
		    map.fitBounds(polygon.getBounds())
		})
	    })
	    
	    map.removeLayer(base)
	    map.addLayer(imagery)
        ponds.addTo(map)
	    //map.removeLayer(plants)
	    //document.getElementById('filters').style.display = 'none'
	    
	})
    })
    
  }).addTo(map) 
}

function buildPonds() {
    ponds = omnivore.geojson('https://jovianpfeil.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM coalashponds&api_key=a761ed63432c22a255c06266b41e09a4b5cc7349')
    .on('ready', function(go) {
		this.eachLayer(function(polygon) {
		    polygon.setStyle ( {
			    color: 'red', //'#FF6138', //'#1334B9',
			    opacity: 1,
			    weight: 3, 
			    fillColor: '#1334B9',//'#594736',  
			    fillOpacity: 0
		    })
		    var label = '<div style="font-size: 14px">'+ polygon.feature.properties.impoundmen + '</div>'
		    polygon.bindLabel(label)
		})
	    })
}



function openDialog(plant) {
    name = plant.properties.facility_name
    url = plant.properties.seca_webpage_url
    count = plant.properties.media_count
    cleanUp = plant.properties.info_cleanup
    utility = plant.properties.facility_own
    water = plant.properties.water_nearest
    media = []
    media_txt = []

    if (plant.properties.media.length > 0) {
        media = (plant.properties.media).split('&')
    }
    if (plant.properties.media_txt.length > 0) {
        media_txt = (plant.properties.media_txt).split('&')
    }

    console.log(media.length)
    console.log(media_txt.length)
    
    title = '<h3 style="color: black; display: inline;">'+ name +'</h3>'
    
    table = '<table>'
    table +='<tr><td><b>Utility:</b></td><td>'+ utility + '</td></tr>'
    table +='<tr><td><b>Clean Up Status:</b></td><td>'+ cleanUp + '</td></tr>'
    table +='<tr><td><b>Vulnerable Waters:</b></td><td>'+ water + '</td></tr>'
    table += '</table>'
        
    message = table + '<br>'
    
    if (plant.properties.media_count > 1) {
    	message += '<div style="width: 100%; font-color: black;>'
    	message += '<span style="float: left;" id="slider-prev"></span>'
    	message += '<span style="float: right;" id="slider-next"></span>'
    	message += '</div>'
    }

        /// BEGIN IF STATEMENT
    if (plant.properties.media_count != null) {    
    	message += '<ul class="bxslider">'

    	for (i = 0; i < plant.properties.media_count; i++) {
            message += '<li>'
            if (media.length >= 1)   {
                console.log(media)
                message += '<img src="' + media[i] + '" style="width: 100%">'
            }
            if (media_txt.length >= 1)   {
                console.log(media_txt)
                message += '</br><p>'+ media_txt[i] + '</p>'            
            }
            message += '</li>'
    	}
    	
    	message += '</ul>'
    }
        //// END IF STATEMENT
    message += '<div style="margin-left: 10%"">'
    message += '<button class="secoalash" data-dismiss="modal" >Explore the map</button>'
    message += '<p style="display: inline-block;"><b> OR </b></p>'
    message += '<a style="font-size: 12px; color: black;" href="' + url +'" target="_blank;"><button class="secoalash">Learn more at southeastcoalash.org</button> </a>'
    message += '</div>'
    /*} else {
        message += '<a style="font-size: 12px;" href="' + url +'" target="_blank;"><button class="secoalash">Learn more at southeastcoalash.org</button> </a>'
    }*/
    
    /*if (plant.properties.media_count > 1) {
	message += '<div style="width: 100%; margin-top: -50px; padding-bottom: 25px;">'
	message += '<span style="position: absolute; left:10px;" id="slider-prev"></span>'
	message += '<span style="position: absolute; right:10px;" id="slider-next"></span>'
	message += '</div>'
    }*/

    console.log(message)
    
    var dialog = bootbox.dialog({
            message: message,
            title: title,
            onEscape: function(){firstTime = true;}
    })

    $(document).on("shown.bs.modal", function(){
        if (firstTime){
            var slider = $('.bxslider').bxSlider({
                captions: true,
                adaptiveHeight: true,
                nextSelector: '#slider-next',
                prevSelector: '#slider-prev',
                nextText: '<p>Next <i class="fa fa-arrow-right"></i></p>',
                prevText: '<p><i class="fa fa-arrow-left"></i> Previous</p>'
            })  
            firstTime = false;
        }

    })
    

    
    //var reload = setInterval(function () {slider.reloadSlider()}, 2000)
    //setInterval(function(){clearInterval(reload)}, 2000)
}

function change() {
    // Find all checkboxes that are checked and build a list of their values
    on = [];
    for (var i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked) on.push(checkboxes[i].value);
    }

    map.removeLayer(plants)
    if (on.length >= 1) {
	addPlants()
    }
}

function welcome() {
    heading = '<img src="https://www.southernenvironment.org/assets/images/logo-header.png">'
    heading += '</br></br><h3 style="text-align: center; margin: auto;">Welcome to the Interactive Coal Ash Map</h3>'
    body = '<p><b>What is coal ash?</b></p>'
    body += '<p>Nearly every major river in the Southeast has one or more lagoons on its banks holding slurries of coal ash from power plants. Containing hundreds of thousands of tons of toxin-laden waste, these pools are often unlined and have leaked arsenic, mercury, thallium, selenium, and other contaminants into the rivers and the underlying groundwater for years, if not decades.</p>'
    body += '<p>To help Southerners find out more about risks to their communities, the Southern Environmental Law Center (SELC) created this interactive map of coal-fired power plants and coal ash ponds.</p>'
    body += '<p><b>How to use this map</b></p>'
    body += '<p>Click on a marker to learn more about the coal-fired power plant it represents, and to explore the coal ash lagoons it produces. Find out about contamination, clean-up, and litigation.</p>'
    body += '<p><b>Find out more</b></p>'
    body += '<p>Find out more about coal ash at <a href="https://www.southernenvironment.org/cases-and-projects/coal-waste">southernenvironment.org</a>.</p>'
    
    bootbox.dialog({
            message: body,
            title: heading
    })
}

function reset() {
    console.log("resetting")
    map.setZoom(6)
    map.panTo(new L.LatLng(34.2190, -78.5266))
}

