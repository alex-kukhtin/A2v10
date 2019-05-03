/**
 * edit customer
 */


const template = {
	properties: {
		"TRoot.$Cities": getCities,
		"TRoot.$Streets": getStreets,
		'TAgent.$Page0Valid': isPage0Valid,
		'TAgent.$Page3Valid': isPage3Valid,
		'TAgent.$Bit1': Boolean,
		'TAgent.$Mask'() {
			return this.$Bit1 ? '### ### ###' : '+38 (0##) ###-##-##';
		},
		'TAgent.$Placeholder'() {
			return this.$Bit1 ? '000 000 000' : '+38 (000) 000-00-00';
		},
		'TAgent.$MapUrl'() {
			return 'https://www.google.com/maps/embed/v1/place?key=@{AppSettings.GoogleMapsApiKey}&q=Eiffel+Tower,Paris+France&language=uk&region=UA';
		}
	},
	events: {
		"Model.load": modelLoad,
		/*
		 * clear dependent values
		 */
		"Agent.Address.Country.change": (addr) => { addr.City = ''; addr.Street = ''; },
		"Agent.Address.City.change": (addr) => { addr.Street = ''; }
	},
	validators: {
		"Agent.Name": 'Введите наименование.\n С очень очень длинным текстом и какими-то элементами',
		'Agent.$Bit1': 'Установите значение',
		"Agent.Code": [
			'Введите код',
			{ valid: duplicateCode, async: true, msg: "Контрагент с таким кодом ОКПО уже существует" }
		],
		'Agent.Memo': { valid: 'notBlank', msg: 'Введите примечание', severity:'warning'},
		'Agent.Address.Build': 'Введите номер дома'
	},
	delegates: {
		canClose,
		uploadFile
	}

};

module.exports = template;

function modelLoad(root, caller) {
	const ag = root.Agent;
	runMap();
	if (!ag.$isNew) return;
	ag.Type = 'C';
	ag.Kind = 'Customer';
	if (caller.Agents && caller.Agents.$selected) {
		let parentId = caller.Agents.$selected.Id;
		ag.ParentFolder = parentId;
	}
	if (root.Params && root.Params.Name) {
		ag.Name = root.Params.Name;
	}
}


function duplicateCode(agent, code) {
	var vm = agent.$vm;
	if (!agent.Code)
		return true;
	return vm.$asyncValid('duplicateCode', { Code: agent.Code, Id: agent.Id });
}

function getCities() {
	const root = this;
	let addr = root.Agent.Address;
	let cntry = root.Countries.find(c => c.Code === addr.Country);
	if (!cntry) return null;
	cntry.Cities.$load(); // ensure lazy
	return cntry.Cities;
}

function getStreets() {
	const root = this;
	let addr = root.Agent.Address;
	let cntry = root.Countries.find(c => c.Code === addr.Country);
	if (!cntry) return null;
	let city = cntry.Cities.find(c => c.Name === addr.City);
	if (!city) return null;
	city.Streets.$load(); // ensure lazy
	return city.Streets;
}

function isPage0Valid() {
	return !!this.Name;
}

function isPage3Valid() {
	return this.Name === 'VALID';
}


function canClose() {
	let ctrl = this.$vm;
	return ctrl.$saveModified('are you sure?');
}


function uploadFile(result) {
	console.dir(result);
	alert('upload');
}

function runMap() {
	navigator.geolocation.getCurrentPosition(function (pos) {
		var centerPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
		var map = new google.maps.Map(document.getElementById('mapId'), {
			center: centerPos,
			zoom: 15
		});

		var marker = new google.maps.Marker({
			position: centerPos,
			map: map,
			title: 'Center marker'
		});
		console.dir(map);
		drawOsm(centerPos);
	});
}

function drawOsm(pos) {
	var map = new OpenLayers.Map("mapdiv");
	map.addLayer(new OpenLayers.Layer.OSM());

	var lonLat = new OpenLayers.LonLat(pos.lng, pos.lat)
		.transform(
			new OpenLayers.Projection("EPSG:4326"), // transform from WGS 1984
			map.getProjectionObject() // to Spherical Mercator Projection
		);

	var zoom = 16;
	console.dir(map.size);

	var markers = new OpenLayers.Layer.Markers("Markers");
	map.addLayer(markers);

	markers.addMarker(new OpenLayers.Marker(lonLat));

	map.setCenter(lonLat, zoom);
}