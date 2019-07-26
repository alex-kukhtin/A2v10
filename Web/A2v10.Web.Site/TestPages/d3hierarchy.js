"use strict";

/*TODO:
1. drop shadow
2. applied/draft icon
3. hint
4. current document style
5. styles: hover/current
*/

const CARD_SIZE = { cx: 200, cy: 72, dx: 20, dy: 40, mx: 40, my: 40 };

function createHtml(d) {
	return `<div class='doc-card' @click.prevent='$click'>
	<i class="ico ico-file-content" title='Документ не проведено'></i> 
	<div class="doc-card-body">
		<span>Податкове зобов'язання</span><popover class="a2-inline po-bottom-right" content='№ 23 від 20.05.2019'>це документ з номером 23 від 20.05.2019</popover>
		<span>Сума: <b>400 000.00</b><span>${d.name}</span>
		<div class="dropdown hlink-dd-wrapper dir-up a2-inline" v-dropdown>
			<a class="a2-hyperlink a2-inline" toggle><i class="ico ico-ellipsis-vertical"></i></span></a><div class="dropdown-menu menu up-left background-white" role="menu">
				<template>
					<button class="dropdown-item" @click.prevent="$navigateSimple('/reports/agents/turnoversheetagent361/0', true)" v-disable>Показати</button>
					<button class="dropdown-item" @click.prevent="$navigateSimple('/reports/entities/warehouseturnoversheetentity/0', true)" v-disable>Перейти до...</button>
				</template>
			</div>
		</div>
	</div>
</div>`;
}

const currentId = 112;

const flatData = [
	{ id: 0, name: 'elem 0', parent: null },
	{ id: 1, name: 'elem 1', parent: 0 },
	{ id: 2, name: 'elem 2', parent: 0 },
	{ id: 11, name: 'elem 1.1', parent: 1 },
	{ id: 12, name: 'elem 1.2', parent: 1 },
	{ id: 13, name: 'elem 1.3', parent: 1 },
	{ id: 111, name: 'elem 1.1.1', parent: 11 },
	{ id: 112, name: 'elem 1.1.2', parent: 11 },
	{ id: 131, name: 'elem 1.3.1', parent: 13 },
	{ id: 1111, name: 'elem 1.1.1.1', parent: 111 },
	{ id: 11111, name: 'elem 1.1.1.1.1', parent: 1111 },
	{ id: 11112, name: 'elem 1.1.1.1.2', parent: 1111 }
];

//const width = 900;
//const height = 600;

// convert the flat data into a hierarchy 
let treeData = d3.stratify()
	.id(d => d.id)
	.parentId(d => d.parent)
	(flatData);

//  assigns the data to a hierarchy using parent-child relationships
let nodes = d3.hierarchy(treeData, d => d.children);

// declares a tree layout and assigns the size
var treemap = d3.tree()
	.nodeSize([CARD_SIZE.cx + CARD_SIZE.dx, CARD_SIZE.cy + CARD_SIZE.dy]);

// maps the node data to the tree layout
nodes = treemap(nodes);

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

console.dir(sizes);


nodes.descendants().forEach(d => {
	sizes.minX = Math.min(sizes.minX, d.x);
	sizes.maxX = Math.max(sizes.maxX, d.x);
	sizes.maxY = Math.max(sizes.maxY, d.y);
});

console.dir(sizes.width());
const TREE_SIZE = { cx: sizes.width() + CARD_SIZE.cx + CARD_SIZE.mx * 2, cy: sizes.height() + CARD_SIZE.cy + CARD_SIZE.my * 2 };

// height -> max 

let svg = d3.select("#hie")
	.append('svg')
	.attr('width', TREE_SIZE.cx)
	.attr('height', TREE_SIZE.cy);
//.style('height', '100%')
//.attr('viewBox', `0 0 ${TREE_SIZE.cx} ${TREE_SIZE.cy}`)
//.attr('preserveAspectRatio', 'xMidYMid meet');

svg.append('defs')
	.html('<marker id="dot" markerWidth="10" markerHeight="10" refX="5" refY="5" orient="auto" markerUnits="strokeWidth"><circle r="5" cx="5" cy="5"></circle></marker>');

let hie = svg.append('g')
	.attr('transform', `translate(${-sizes.minX + CARD_SIZE.cx / 2 + CARD_SIZE.mx}, ${CARD_SIZE.cy / 2 + CARD_SIZE.my})`);
//.attr('transform', `translate(${TREE_SIZE.cx / 2 + CARD_SIZE.cx / 2 + CARD_SIZE.mx}, ${CARD_SIZE.cy / 2 + CARD_SIZE.my})`);


const delta = { cx: CARD_SIZE.cx / 2, cy: CARD_SIZE.cy / 2 };

const link = d3.linkVertical()
	.x(d => d.x)
	.y(d => d.y);
/*
	.x(d)
	.y(function (d, t) { console.dir(d); return d.y - delta.cy; });
*/

// adds the links between the nodes
var links = hie.selectAll(".link")
	.data(nodes.descendants().slice(1))
	.enter().append("path")
	.attr("class", "link")
	.attr('marker-start', 'url(#dot')
	.attr('marker-end', 'url(#dot')
	.attr('d', d => link({ source: { x: d.x, y: d.y - delta.cy }, target: { x: d.parent.x, y: d.parent.y + delta.cy } }));
//.attr('d', d => `M${d.parent.x},${d.parent.y}V${d.y}H${d.x}`);
//.attr('d', d => `M${d.x},${d.y - delta.cy}C${(d.x + d.parent.x) / 2}, ${d.y} ${(d.x + d.parent.x) / 2}, ${d.parent.y} ${d.parent.x},${d.parent.y + delta.cy}`);
/*
	.attr("d", function (d) {
		return "M" + d.x + "," + d.y
			+ "C" + (d.x + d.parent.x) / 2 + "," + d.y
			+ " " + (d.x + d.parent.x) / 2 + "," + d.parent.y
			+ " " + d.parent.x + "," + d.parent.y;
	});
*/
/*
return "M" + d.parent.y + "," + d.parent.x
	+ "V" + d.x + "H" + d.y;      
*/

// adds each node as a group
let node = hie.selectAll(".node")
	.data(nodes.descendants())
	.enter().append("g")
	.attr("class", d => { console.dir(d); return `node ${d.data.data.id === currentId ? 'current' : ''}`; })
	.attr("transform", d => `translate(${d.x}, ${d.y})`);

node.append("rect")
	.attr('class', 'doc')
	.attr("x", -CARD_SIZE.cx / 2)
	.attr("y", -CARD_SIZE.cy / 2)
	.attr('width', CARD_SIZE.cx)
	.attr('height', CARD_SIZE.cy)

node.append('foreignObject')
	.attr('class', 'doc-fo')
	.attr("x", -CARD_SIZE.cx / 2)
	.attr("y", -CARD_SIZE.cy / 2)
	.attr('width', CARD_SIZE.cx)
	.attr('height', CARD_SIZE.cy)
	.append('xhtml:div')
	.html(d => createHtml(d.data.data));

/*<span class="tag-label warning">${d.data.data.name}</span>*/
/*
.append('div')
.attr('class', 'link-card')
.text('I am the text');
*/

// adds the circle to the node

const ShellController = component('std:shellController');

new ShellController({
	el: '#app',
	methods: {
		$navigateSimple(url) {
			alert(url);
		},
		$click(url) {
			alert(url);
		}
	},
	mounted() {
		console.dir('mounted');
	}
});