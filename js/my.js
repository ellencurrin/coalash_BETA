var base
var labels
var imagery
var plants

$( document ).ready(function() {
    console.log("document ready")
    main();
    $('#layers-list').dropdown('toggle');
    $('#cover').fadeOut(1);
    //$('.bxslider').bxSlider();
});

function main() {
    var map = L.map('map', { 
      zoomControl: false,
      center: [34.2190, -78.5266],
      zoom: 6
    });
  
    base = L.tileLayer('http://a{s}.acetate.geoiq.com/tiles/acetate-base/{z}/{x}/{y}.png', {
	attribution: '&copy;2012 Esri & Stamen, Data from OSM and Natural Earth',
	subdomains: '0123',
	minZoom: 2,
	maxZoom: 18
    }).addTo(map)
    
    labels = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/roads_and_labels/{z}/{x}/{y}.png', {
        attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    })
    .setOpacity(.5)
    .addTo(map)
    
    imagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })
  
    states = omnivore.geojson('https://ellencurrin.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM all_states')
    .on('ready', function(go) {
            this.eachLayer(function(polygon) {
                if (polygon.feature.properties.name == 'North Carolina' || polygon.feature.properties.name =='South Carolina' || polygon.feature.properties.name == 'Virginia' || polygon.feature.properties.name =='Tennessee' || polygon.feature.properties.name == 'Georgia' || polygon.feature.properties.name =='Alabama') {
                    polygon.setStyle ( {
                        color: '#fff', 
                        opacity: 1,
                        weight: 1,
                        fillColor: '#C3CC8F',//'#C2D193',
                        fillOpacity: .4,
                    });
                    
                    polygon.on('click', function(e){    
                        map.fitBounds(polygon.getBounds())
                        states.setStyle({
                            weight: 1,
                            fillColor: '#C3C3BE',
                            fillOpacity: .4,
                        });
                        e.layer.setStyle ( {
                            weight: 1, 
                            fillOpacity: 0, 
                        });
                    })
                    polygon.on('mouseover', function(e) {
                        states.setStyle ( {
                            fillOpacity: .4, 
                        });
                        e.layer.setStyle ( {
                            fillOpacity: 0, 
                        });
                    });
                    polygon.on('mouseout', function(e) {
                        e.layer.setStyle ( {
                            fillOpacity: 0, 
                        });
                    });
                } else {
                    polygon.setStyle ( {
                        color: '#fff', 
                        opacity: 1,
                        weight: 1,
                        fillColor: '#FFF8E3',
                        fillOpacity: .4,
                    })
                }
            })
        })
    .addTo(map)
    

  plants = omnivore.geojson('https://ellencurrin.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM coalashplants')
  .on('ready', function(go){
    console.log("plants ready")
    this.eachLayer(function(marker) {
        console.log("each plant")
        var color= '#374140'//'rgba(0, 163, 136, 1)' //'#00A388'
        var border_color
        var label = marker.feature.properties.power_plan
        var content
        var src = []
        
        if (marker.feature.properties.selc_ltgtn == "Yes") {
            color = 'rgba(255, 97, 56, 1)'
            border_color = 'rgba(255, 255, 255, .5)', //'#FF6138'
            src.push('http://welovemountainislandlake.files.wordpress.com/2013/01/riverbendcoalash-wbobbit.jpg'),
            src.push('http://switchboard.nrdc.org/blogs/bhayat/assets_c/2014/02/Dan%20River%20Spill%20Aerial%202%20Photo%20by%20Waterkeeper%20AllianceRick%20Dove-thumb-500x333-14631.jpg')
            content = marker.feature.properties.power_plan + '</br><img src="' + src[0] + '" style="width: 180px; height: 180px;">',
            marker.bindLabel(content)
        } else {
            color = '#374140'
            border_color = 'rgba(255, 255, 255, .5)',
            marker.bindLabel(label)
        }
        
        marker.setIcon(L.divIcon( {
            iconSize: [1, 1],
            popupAnchor: [0, 10], 
            html: '<div style="margin-top: -10px; margin-left: -10px; text-align:center; color:#fff; border:3px solid ' + border_color +'; height: 20px; width: 20px; padding: 5px; border-radius:50%; background:' +
            color + '"></div>'
        }))
        /*var label = marker.feature.properties.power_plan
        marker.bindLabel(label)*/
        var url = marker.feature.properties.factsheet
        
        
        marker.on('click', function(e){
            console.log(e.target.feature.properties.media_count)
            if (e.target.feature.properties.media_count > 0) {
                openDialog(e.target.feature)
            }
            ponds = L.geoJson()
            omnivore.geojson('https://ellencurrin.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM coalashponds')
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
		    polygon.on('click', function(){
			openDialog("00")
		    }) 
                })
                //pondStyle(ponds)  
            })
            .addTo(map)
	    map.setView(e.latlng, 15)
            map.removeLayer(plants)
            map.removeLayer(base)
            map.addLayer(imagery)
            
        })
    })
  }).addTo(map) 
}

function buildPonds(plant) {
    omnivore.geojson('https://ellencurrin.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT * FROM coalashponds')
    .addTo(map)
}



function openDialog(plant) {
    if (plant != "00") {
        name = plant.properties.power_plan
        url = plant.properties.seca_url
	count = plant.properties.media_count
	media = (plant.properties.media).split(',')
	//media_array = media.split(',')
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

