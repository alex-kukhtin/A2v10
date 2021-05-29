
const utils = require('std:utils');
const cyTools = utils.currency;
const dtTools = utils.date;

const template = {
		delegates: {
			drawLinks
		}
	};

module.exports = template;


// TODO:
let now = dtTools.today();

const flatData = [
	{ Id: 0, Name: 'Податкове зобов\'язання', ParentId: null, Done:true, Sum:500, Date: now, SNo:'223' },
	{ Id: 1, Name: 'Отримання рахунку', ParentId: 0, Done: true, Sum: 12500, Date: now, SNo: '172s' },
	{ Id: 2, Name: 'Оплата постачальнику', ParentId: 0, Done: false, Sum: 1305.55, Date: now, SNo: '511' },
	{ Id: 11, Name: 'Придбання матеріальних активів', ParentId: 1, Done: true, Sum: 5000, Date: now, SNo: '1233/33' },
	{ Id: 12, Name: 'Виставлення рахунку', ParentId: 1, Sum: 1500, Date: now, SNo: '078/f' },
	{ Id: 13, Name: 'Оплата покупця', ParentId: 1, Done: true, Sum: 500000, Date: now, SNo: '8908' },
	{ Id: 111, Name: 'Реалізація запасів', ParentId: 11, Done: true, Sum: 5000, Date: now, SNo: '9-09-09' },
	{ Id: 112, Name: 'Податковий кредит', ParentId: 11, Sum: 3000, Date: now, SNo: '7898'},
	{ Id: 131, Name: 'Повернення постачальнику', ParentId: 13, Sum: 12300, Date: now, SNo: '233' },
	{ Id: 1111, Name: 'Повернення від покупця', ParentId: 111, Sum: 1300, Date: now, SNo: '23243' }
	//{ id: 11111, name: 'elem 1.1.1.1.1', ParentId: 1111 },
	//{ id: 11112, name: 'elem 1.1.1.1.2', ParentId: 1111 }
];

function clickCard(d) {
	console.dir(this);
	alert(d.Name);
}

const currentId = 11;

const CARD_SIZE = { cx: 210, cy: 56, dx: 20, dy: 40, mx: 40, my: 40 };

function createHtml(d) {

	function getIcon() {
		return d.Done ? 'file-success' : 'file-failure';
	}

	function getTitle() {
		return d.Done ? 'Документ проведено' : 'Документ не проведено в обліку';
	}

	return `<div class='doc-card'>
	<i class="ico ico-${getIcon()}" title="${getTitle()}"></i> 
	<div class="doc-card-body">
		<span>${d.Name}</span>
		<span>№ ${d.SNo} від ${dtTools.format(d.Date)}</span>
		<span>Сума: ${cyTools.format(d.Sum)}</span>
	</div>
</div>`;
}

function drawLinks(graphics, arg) {

	console.dir(this.$vm);

	let treeData = d3.stratify()
		.id(d => d.Id)
		.parentId(d => d.ParentId)
	(flatData);

	let nodes = d3.hierarchy(treeData, d => d.children);
	const treeLayout = d3.tree()
		.nodeSize([CARD_SIZE.cx + CARD_SIZE.dx, CARD_SIZE.cy + CARD_SIZE.dy]);
	nodes = treeLayout(nodes);

	let sizes = {
		minX: 1000,
		maxX: -1000,
		maxY: -1000,
		width() {
			return this.maxX - this.minX;
		},
		height() {
			return this.maxY;
		}
	};


	function getNodeClass(d) {
		let c = 'node ' + (d.Done ? 'done' : 'draft');
		if (d.Id === currentId)
			c += ' current';
		return c;
	}

	nodes.descendants().forEach(d => {
		sizes.minX = Math.min(sizes.minX, d.x);
		sizes.maxX = Math.max(sizes.maxX, d.x);
		sizes.maxY = Math.max(sizes.maxY, d.y);
	});


	const TREE_SIZE = { cx: sizes.width() + CARD_SIZE.cx + CARD_SIZE.mx * 2, cy: sizes.height() + CARD_SIZE.cy + CARD_SIZE.my * 2 };

	const delta = { cx: CARD_SIZE.cx / 2, cy: CARD_SIZE.cy / 2 };

	const svg = graphics
		.append('svg')
		.attr('width', TREE_SIZE.cx)
		.attr('height', TREE_SIZE.cy)
		.style('min-width', TREE_SIZE.cx)
		.style('min-height', TREE_SIZE.cy);

	svg.append('defs')
		.html(`
<marker id="dot" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth"><circle r="5" cx="5" cy="5"></circle></marker>
<filter xmlns="http://www.w3.org/2000/svg" id="dropShadow"><feGaussianBlur in="SourceAlpha" stdDeviation="1.7" result="blur"></feGaussianBlur> <feOffset in="blur" dx="3" dy="3" result="offsetBlur"></feOffset> <feFlood flood-color="#999" flood-opacity="0.3" result="offsetColor"></feFlood> <feComposite in="offsetColor" in2="offsetBlur" operator="in" result="offsetBlur"></feComposite> <feBlend in="SourceGraphic" in2="offsetBlur"></feBlend></filter>`);

	let hie = svg.append('g')
		.attr('filter', 'url(#dropShadow)')
		.attr('class', 'doc-links')
		.attr('transform', `translate(${-sizes.minX + CARD_SIZE.cx / 2 + CARD_SIZE.mx}, ${CARD_SIZE.cy / 2 + CARD_SIZE.my})`);

	// adds each node as a group
	let node = hie.selectAll(".node")
		.data(nodes.descendants())
		.enter().append("g")
		.attr("class", d => getNodeClass(d.data.data))
		.attr("transform", d => `translate(${d.x}, ${d.y})`);

	node.append("rect")
		.attr("x", -CARD_SIZE.cx / 2)
		.attr("y", -CARD_SIZE.cy / 2)
		.attr('width', CARD_SIZE.cx)
		.attr('height', CARD_SIZE.cy);

	node.append('foreignObject')
		.attr('class', 'doc-fo')
		.attr("x", -CARD_SIZE.cx / 2)
		.attr("y", -CARD_SIZE.cy / 2)
		.attr('width', CARD_SIZE.cx)
		.attr('height', CARD_SIZE.cy)
		.append('xhtml:div')
		.html(d => createHtml(d.data.data))
		.on('click', d => clickCard.call(this, d.data.data));

	const link = d3.linkVertical()
		.x(d => d.x)
		.y(d => d.y);

	var links = hie.selectAll(".link")
		.data(nodes.descendants().slice(1))
		.enter().append("path")
		.attr("class", "link")
		.attr('marker-start', 'url(#dot')
		.attr('marker-end', 'url(#dot')
		.attr('d', d => link({ source: { x: d.x, y: d.y - delta.cy }, target: { x: d.parent.x, y: d.parent.y + delta.cy } }));
}
