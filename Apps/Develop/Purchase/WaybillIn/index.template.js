/*waybillin index template*/


const template = {
    delegates: {
        'DrawSine': drawSine
    }
};

module.exports = template;

function drawSine(graphics) {
    // this == root

    const marginX = 50;
    const width = 300;

    
    graphics
        //.style('width', width + "px"),
        //.style('min-width', width + "px");
        .style("background-color", "lightyellow")
        .style("border", "1px solid brown");

        const chart = graphics.append('svg')
            .attr('viewBox', `0 0 ${width} 240`);
        //.style('width', width)
        //.style('height', 240);

    const sine = d3.range(0, 40)
        .map(k => {
            let x = .5 * k * Math.PI;
            return [x, Math.sin(x / 4)];
        });

    // scale functions
    const x = d3.scaleLinear()
        .range([marginX, width - marginX])
        .domain(d3.extent(sine, d => d[0]));

    const y = d3.scaleLinear()
        .range([200, 20])
        .domain([-1, 1]);

    // line generator
    const line = d3.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]));

    chart.append('g')
        .append('path')
        .datum(sine)
        .attr('d', line.curve(d3.curveCardinal))
        .attr('stroke', '#0d82f8')
        .attr('stroke-width', 1)
        .attr('fill', 'none');

    // Add the X Axis
    chart.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0, 200)")
        .call(d3.axisBottom(x));

    // Add the Y Axis
    chart.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${marginX}, 0)`)
        .call(d3.axisLeft(y).ticks(10));

}
