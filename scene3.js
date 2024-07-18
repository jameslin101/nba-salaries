import colors from './nba_colors.js';
import { data } from './main.js';

export function renderPlayerSalariesVsPER() {
    console.log("Rendering player salaries vs PER");
    if (!data || !data.players || data.players.length === 0) {
        console.error("No data available to render");
        return;
    }

    // Filter players with minimum 20 games played
    const filteredPlayers = data.players.filter(player => player.GP >= 20);

    const margin = {top: 40, right: 20, bottom: 150, left: 60};
    const width = 1000 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    d3.select("#bar-chart").html("");

    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .range([0, width]);

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

    // Set up initial team visibility
    const teamVisibility = {};
    data.teams.forEach(team => {
        teamVisibility[team.team] = (team.team === 'MEM' || team.team === 'DET');
    });

    function updateChart() {
        x.domain([0, d3.max(filteredPlayers, d => d.Salary / 1000000)]);
        y.domain([Math.min(0, d3.min(filteredPlayers, d => d.PER)), d3.max(filteredPlayers, d => d.PER)]);

        xAxis.transition().duration(750)
            .call(d3.axisBottom(x).tickFormat(d => `$${d}M`));

        yAxis.transition().duration(750)
            .call(d3.axisLeft(y));

        const dots = svg.selectAll(".player-dot")
            .data(filteredPlayers, d => d['Player Name']);

        dots.enter()
            .append("circle")
            .attr("class", "player-dot")
            .merge(dots)
            .attr("cx", d => x(d.Salary / 1000000))
            .attr("cy", d => y(d.PER))
            .attr("r", 5)
            .attr("fill", d => colors[d.Team].colors[colors[d.Team].mainColor].hex)
            .style("opacity", d => teamVisibility[d.Team] ? 1 : 0.1)
            .on("click", function(event, d) {
                if (!teamVisibility[d.Team]) {
                    teamVisibility[d.Team] = true;
                    d3.select(`#checkbox-${d.Team}`).property('checked', true);
                    updateChart();
                }
            })
            .on("mouseover", function(event, d) {
                // Remove the condition to show tooltip for all dots
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    Name: ${d['Player Name']}<br/>
                    Position: ${d.Position}<br/>
                    PER: ${d.PER.toFixed(2)}<br/>
                    Salary: $${(d.Salary / 1000000).toFixed(2)}M
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        dots.exit().remove();

        svg.select(".chart-title")
            .text("NBA Player Salaries vs PER (2022-2023 Season)");

        svg.select(".x-axis-label")
            .text("Salary (Millions)");

        svg.select(".y-axis-label")
            .text("Player Efficiency Rating (PER)");
    }

    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Player Efficiency Rating (PER)");

    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", `translate(${width/2}, ${height + margin.bottom - 110})`)
        .style("text-anchor", "middle")
        .text("Salary (Millions)");

    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("NBA Player Salaries vs PER (2022-2023 Season)");

    // Load team logos
    d3.csv("teams_logos.csv").then(function(logoData) {
        const logoMap = new Map(logoData.map(d => [d.team, d.nba_team_imageURL]));

        // Create team logo checkboxes
        const logoContainer = d3.select("#bar-chart")
            .append("div")
            .style("display", "flex")
            .style("flex-wrap", "wrap")
            .style("justify-content", "center")
            .style("margin-top", "20px");

        data.teams.forEach(team => {
            const logoDiv = logoContainer.append("div")
                .style("margin", "5px")
                .style("text-align", "center");

            logoDiv.append("img")
                .attr("src", logoMap.get(team.team))
                .attr("width", "30")
                .attr("height", "30");

            logoDiv.append("input")
                .attr("type", "checkbox")
                .attr("id", `checkbox-${team.team}`)
                .attr("checked", teamVisibility[team.team] ? true : null)
                .on("change", function() {
                    teamVisibility[team.team] = this.checked;
                    updateChart();
                });
        });

        updateChart();
    }).catch(function(error) {
        console.log("Error loading the logo CSV file:", error);
    });

    console.log("Finished rendering player salaries vs PER");
}