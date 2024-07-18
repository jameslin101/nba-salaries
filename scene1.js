import { data, colors } from './main.js';
import { showScene } from './script.js';

export function renderTeamSalaries() {
    console.log("Rendering team salaries");
    if (!data || !data.teams || data.teams.length === 0) {
        console.error("No data available to render");
        return;
    }

    const margin = {top: 40, right: 20, bottom: 100, left: 80};
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    d3.select("#bar-chart").html("");

    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    const y = d3.scaleLinear()
        .range([height, 0]);

    const xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);

    const yAxis = svg.append("g")
        .attr("class", "y-axis");

    const tooltip = d3.select("#bar-chart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    const salaryCap = 123.655;

    function updateChart() {
        data.teams.sort((a, b) => b.totalSalary - a.totalSalary);

        x.domain(data.teams.map(d => d.team));
        y.domain([0, d3.max(data.teams, d => d.totalSalary / 1000000)]);

        xAxis.transition().duration(750)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

        yAxis.transition().duration(750)
            .call(d3.axisLeft(y).tickFormat(d => `$${d}M`));

        const bars = svg.selectAll(".bar")
            .data(data.teams, d => d.team);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.team))
            .attr("width", x.bandwidth())
            .attr("y", height)
            .attr("height", 0)
            .merge(bars)
            .on("click", function(event, d) {
                console.log("Bar clicked:", d);
                showScene(5, d);
            })
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                updateTooltipContent(d);
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition()
            .duration(750)
            .attr("x", d => x(d.team))
            .attr("width", x.bandwidth())
            .attr("y", d => y(d.totalSalary / 1000000))
            .attr("height", d => height - y(d.totalSalary / 1000000))
            .attr("fill", d => colors[d.team] ? colors[d.team].colors[colors[d.team].mainColor].hex : "#cccccc");

        bars.exit()
            .transition()
            .duration(750)
            .attr("y", height)
            .attr("height", 0)
            .remove();

        // Remove existing salary cap line and text
        svg.select(".salary-cap-line").remove();
        svg.select(".salary-cap-text").remove();

        // Add salary cap line
        svg.append("line")
            .attr("class", "salary-cap-line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(salaryCap))
            .attr("y2", y(salaryCap))
            .attr("stroke", "red")
            .attr("stroke-dasharray", "5,5");

        // Add salary cap text
        svg.append("text")
            .attr("class", "salary-cap-text")
            .attr("x", width)
            .attr("y", y(salaryCap))
            .attr("dy", "-0.5em")
            .attr("text-anchor", "end")
            .attr("fill", "red")
            .text("Salary Cap: $123.655M");

        svg.select(".chart-title")
            .text("NBA Team Salaries (2022-2023 Season) - Sorted by Salary");

        svg.select(".x-axis-label")
            .text("Teams Ranked by Salary");
    }

    function updateTooltipContent(d) {
        tooltip.html(`
            Team: ${d.teamFullName}<br/>
            Power Ranking: ${d.rank}<br/>
            Wins: ${d.wins}<br/>
            Losses: ${d.losses}<br/>
            Win %: ${(d.winPercentage * 100).toFixed(1)}%<br/>
            Total Salary: $${(d.totalSalary / 1000000).toFixed(2)}M
        `);
    }

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Salary (Millions)");

    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", `translate(${width/2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle");

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline");

    updateChart();

    console.log("Finished rendering team salaries");
}