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
            .attr("fill", d => {
                const teamColors = colors[d.Team];
                if (teamColors && teamColors.colors && teamColors.colors[teamColors.mainColor]) {
                    return teamColors.colors[teamColors.mainColor].hex;
                }
                // Fallback color if the team or color is not found
                return "#888888";
            })
            .style("opacity", d => teamVisibility[d.Team] ? 1 : 0.1)
            .on("click", function(event, d) {
                if (!teamVisibility[d.Team]) {
                    teamVisibility[d.Team] = true;
                    d3.select(`#checkbox-${d.Team}`).property('checked', true);
                    updateChart();
                }
            })
            .on("mouseover", function(event, d) {
                console.log("Player data:", d);  // Keep this line for debugging
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`
                    <table class="tooltip-table">
                        <tr class="header-row">
                            <th colspan="2">${d['Player Name']} - ${d.Team}</th>
                        </tr>
                        <tr>
                            <td>Position</td>
                            <td>${d.Position}</td>
                        </tr>
                        <tr>
                            <td>Age</td>
                            <td>${d.Age}</td>
                        </tr>
                        <tr>
                            <td>Salary</td>
                            <td>$${(d.Salary / 1000000).toFixed(2)}M</td>
                        </tr>
                        <tr>
                            <td>PER</td>
                            <td>${typeof d.PER === 'number' ? d.PER.toFixed(2) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Games Played</td>
                            <td>${d.GP}</td>
                        </tr>
                        <tr>
                            <td>Games Started</td>
                            <td>${d.GS}</td>
                        </tr>
                        <tr>
                            <td>Minutes Per Game</td>
                            <td>${typeof d.MP === 'number' ? d.MP.toFixed(1) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Points</td>
                            <td>${typeof d.PTS === 'number' ? d.PTS.toFixed(1) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Rebounds</td>
                            <td>${typeof d.TRB === 'number' ? d.TRB.toFixed(1) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Assists</td>
                            <td>${typeof d.AST === 'number' ? d.AST.toFixed(1) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Steals</td>
                            <td>${typeof d.STL === 'number' ? d.STL.toFixed(1) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Blocks</td>
                            <td>${typeof d.BLK === 'number' ? d.BLK.toFixed(1) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Field Goal %</td>
                            <td>${typeof d['FG%'] === 'number' ? (d['FG%'] * 100).toFixed(1) : 'N/A'}%</td>
                        </tr>
                        <tr>
                            <td>3 Point %</td>
                            <td>${typeof d['3P%'] === 'number' ? (d['3P%'] * 100).toFixed(1) : 'N/A'}%</td>
                        </tr>
                        <tr>
                            <td>True Shooting %</td>
                            <td>${typeof d['TS%'] === 'number' ? (d['TS%'] * 100).toFixed(1) : 'N/A'}%</td>
                        </tr>
                        <tr>
                            <td>Win Share</td>
                            <td>${typeof d.WS === 'number' ? d.WS.toFixed(1) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Box Plus Minus</td>
                            <td>${typeof d.BPM === 'number' ? d.BPM.toFixed(1) : 'N/A'}</td>
                        </tr>
                        <tr>
                            <td>Value Over Replacement</td>
                            <td>${typeof d.VORP === 'number' ? d.VORP.toFixed(1) : 'N/A'}</td>
                        </tr>
                    </table>
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px");
            })

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
// Load team logos
d3.csv("teams_logos.csv").then(function(logoData) {
    const logoMap = new Map(logoData.map(d => [d.team, d.nba_team_imageURL]));

    // Sort teams alphabetically
    const sortedTeams = data.teams.sort((a, b) => a.team.localeCompare(b.team));

    // Create team logo checkboxes
    const logoContainer = d3.select("#bar-chart")
        .append("div")
        .style("display", "flex")
        .style("flex-wrap", "wrap")
        .style("justify-content", "center")
        .style("margin-top", "20px");

    sortedTeams.forEach(team => {
        const logoDiv = logoContainer.append("div")
            .style("margin", "5px")
            .style("text-align", "center")
            .style("display", "flex")
            .style("flex-direction", "column")
            .style("align-items", "center");

        logoDiv.append("img")
            .attr("src", logoMap.get(team.team))
            .attr("width", "60")
            .attr("height", "40");

        logoDiv.append("span")
            .text(team.team)
            .style("font-size", "12px")
            .style("margin-top", "2px");

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