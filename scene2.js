import { colors } from './nba_colors.js';

export function renderPlayerSalariesVsPerformance(data, container) {
    console.log("Rendering player salaries vs performance");
    if (!data || !data.players || data.players.length === 0) {
        console.error("No data available to render");
        return;
    }

    const margin = {top: 40, right: 20, bottom: 60, left: 80};
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select(container).html("");

    const svg = d3.select(container)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);

    const yAxis = svg.append("g")
        .attr("class", "y-axis");

    const tooltip = d3.select(container)
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    let currentMetric = 'PER';

    function updateChart() {
        x.domain([0, d3.max(data.players, d => d.Salary / 1000000)]);
        y.domain([0, d3.max(data.players, d => d[currentMetric])]);

        xAxis.transition().duration(750)
            .call(d3.axisBottom(x).tickFormat(d => `$${d}M`));

        yAxis.transition().duration(750)
            .call(d3.axisLeft(y));

        const circles = svg.selectAll("circle")
            .data(data.players, d => d['Player Name']);

        circles.enter()
            .append("circle")
            .attr("r", 5)
            .attr("cx", d => x(d.Salary / 1000000))
            .attr("cy", d => y(d[currentMetric]))
            .attr("fill", d => colors[d.Team] ? colors[d.Team].colors[colors[d.Team].mainColor].hex : "#cccccc")
            .attr("opacity", 0.7)
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`
                    Player: ${d['Player Name']}<br/>
                    Team: ${d.Team}<br/>
                    Salary: $${(d.Salary / 1000000).toFixed(2)}M<br/>
                    ${currentMetric}: ${d[currentMetric].toFixed(2)}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition().duration(500).style("opacity", 0);
            });

        circles.transition().duration(750)
            .attr("cx", d => x(d.Salary / 1000000))
            .attr("cy", d => y(d[currentMetric]));

        circles.exit().remove();

        svg.select(".chart-title")
            .text(`Player Salaries vs ${currentMetric} (2022-2023 Season)`);

        svg.select(".x-axis-label")
            .text("Salary (Millions)");

        svg.select(".y-axis-label")
            .text(currentMetric);
    }

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline");

    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .attr("text-anchor", "middle");

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle");

    const toggleButton = d3.select(container)
        .append("button")
        .text("Toggle Metric")
        .on("click", function() {
            currentMetric = currentMetric === 'PER' ? 'WS' : 'PER';
            updateChart();
        });

    updateChart();
    console.log("Finished rendering player salaries vs performance");
}