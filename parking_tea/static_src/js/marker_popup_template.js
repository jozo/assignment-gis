var markerPopupTemplate = '\
<h1>{{ name }}</h1>\
<div class="popup-icon">\
    <i class="fa fa-eur" title="{{ fee }}" aria-hidden="true"></i> \
    <i class="fa fa-map-marker" title="{{ coordinates }}" aria-hidden="true"></i> \
    <i class="fa fa-globe" title="Area: {{ area }} m2" aria-hidden="true"></i> \
    <i class="fa fa-tags" title="{{ tags }}" aria-hidden="true"></i> \
    <i class="fa fa-plane" title="Distance: {{ distance }} m" aria-hidden="true"></i> \
</div>\
<strong>Capacity: </strong> {{ capacity }} cars<br>\
\
{% if bus_stop_end %}\
    <h2>MHD connections</h2>\
    <div class="buses">\
        <i class="fa fa-bus" aria-hidden="true"></i> \
        <strong>{{ bus_stop_end }}</strong> \
        <i class="fa fa-angle-double-right" aria-hidden="true"></i> \
        <i class="fa fa-bus" aria-hidden="true"></i> \
        <strong>{{ bus_stop_start }}</strong> \
        <i class="fa fa-clock-o" aria-hidden="true"></i> {{ duration }} min\
    </div>\
    <div>\
        <strong>Bus: </strong>\
        {% for bus in transfers %}\
            <a href="http://imhd.sk/ba/cestovny-poriadok/linka/{{bus}}" target="_blank">{{bus}}</a>\
            {% if not loop.last %},{% endif %} \
        {% endfor %}\
    </div>\
{% endif %}\
';