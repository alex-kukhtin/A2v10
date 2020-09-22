
/* index template */

const template = {
	properties: {
		"TRoot.$Donor"() { return {Id: 7866}}
	},
	delegates: {
		drawArrow
	}
};

module.exports = template;

function drawArrow(g) {

	const color = "#ccc";
	const svg = d3.select("#page-canvas")
		.attr("style", "display:block;position:absolute;top:40px;right:20px;width:calc(50% - 190px);")
		.append('svg')
		.attr('width', '100%')
		.attr('height', 170)
		.attr('viewBox', '0 0 620 270')
		.attr('preserveAspectRatio', 'xMaxYMax slice');
	svg.append("defs")
		.append("marker").attr("id", "Triangle")
		.attr('viewBox', '0, 0, 15, 15')
		.attr("markerMidth", 30)
		.style('overflow', 'visible')
		.attr("refX", 15)
		.attr("refY", 30)
		.attr("markerHeight", 30)
		.append('path')
			//.attr('d', 'M 60,0 L -30,60 L -30,-50 L 60,0 z ')
			.attr('d', 'M 15,0 L 30,30 L 0,30 Z')
			.attr('fill', 'transparent')
			.attr('stroke', color)
			.attr('stroke-width', '4')
			.attr('transform', 'translate(0, 0)')
			.append('animate')
				.attr('attributeType', 'xml')
				.attr('attributeName', 'fill')
				.attr('repeatCount', 'indefinite')
				.attr('from', 'transparent')
				.attr('to', color)
				.attr('dur', '1s');
	svg.append('path')
		.attr('d', "M 0,250 C 600, 250 600, 250 600,30")
		.attr('stroke', color)
		.attr('stroke-width', '4')
		.attr('stroke-dasharray', '5,5')
		.attr('marker-end', 'url(#Triangle)')
		.attr('fill', 'none')
		.append('animate')
		.attr('attributeType', 'xml')
		.attr('attributeName', 'stroke-dashoffset')
		.attr('repeatCount', 'indefinite')
		.attr('from', '100')
		.attr('to', '0')
		.attr('dur', '1s');
	console.dir(svg);
}

