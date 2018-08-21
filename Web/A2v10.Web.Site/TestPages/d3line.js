
(function () {

	const chart = d3.select('#chart')
		.append('svg')
		.style('width', 500)
		.style('height', 400);

    const sine = d3.range(0, 40)
        .map(k => {
            let x = .5 * k * Math.PI;
            return [x, Math.sin(x/4)];
        });

    console.dir(sine);

    chart.append("circle")
        .attr('cx', 150)
        .attr('cy', 150)
        .attr('r', 50)
        .attr('fill', 'yellow')
        .attr('stroke', 'red');

    // функции масштабов
    const x = d3.scaleLinear()
        .range([100, 400])
        .domain(d3.extent(sine, d => d[0]));

    const y = d3.scaleLinear()
        .range([200, 20])
        .domain([-1, 1]);

    // генератор линии
    const line = d3.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]));

    chart.append('g')
        .append('path')
        .datum(sine)
        .attr('d', line.curve(d3.curveCardinal))
        .attr('stroke', 'navy')
        .attr('stroke-width', 1)
        .attr('fill', 'none');

    chart.append('g')
        .append('text')
        .text('text node')
        .attr('x', 400)
        .attr('y', 120);

    // Add the scatterplot
    chart.selectAll("dot")
        .data(sine)
        .enter()
        .append("circle")
        .attr("r", 2)
        .attr('fill', 'lime')
        .attr("cx", d => x(d[0]))
        .attr("cy", d => y(d[1]));

    // Add the X Axis
    chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, 200)")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(100, 0)")
        .call(d3.axisLeft(y).ticks(10));

})();