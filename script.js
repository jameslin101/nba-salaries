import { renderTeamSalaries } from './scene1.js';
import { renderSalaryVsPerformance } from './scene2.js';
import { setCurrentScene, data, rankingsData } from './main.js';

function processData(csvData, rankingsData) {
    let teamTotals = {};
    let players = csvData.map(d => {
        d.Salary = parseFloat(d.Salary);
        d.PER = parseFloat(d.PER);
        d.Age = parseInt(d.Age);
        d.Team = d.Team.split('/').pop().trim();
        
        if (!teamTotals[d.Team]) {
            teamTotals[d.Team] = {totalSalary: 0, playerCount: 0, players: []};
        }
        teamTotals[d.Team].totalSalary += d.Salary;
        teamTotals[d.Team].playerCount++;
        teamTotals[d.Team].players.push(d);
        
        return d;
    });
    
    let teams = Object.entries(teamTotals).map(([team, data]) => {
        const ranking = rankingsData.find(r => r.Team === team);
        return {
            team: team,
            teamFullName: ranking ? ranking.TeamFullName : team,
            totalSalary: data.totalSalary,
            averageSalary: data.totalSalary / data.playerCount,
            rank: ranking ? parseInt(ranking.Rk) : 'N/A',
            wins: ranking ? parseInt(ranking.W) : 'N/A',
            losses: ranking ? parseInt(ranking.L) : 'N/A',
            winPercentage: ranking ? parseFloat(ranking['W/L%']) : 'N/A',
            players: data.players
        };
    });
    
    return {players, teams};
}

function showScene(sceneNumber, teamData = null) {
    console.log("Showing scene:", sceneNumber);
    setCurrentScene(sceneNumber);
    d3.select("#bar-chart").html("");
    d3.select("#pie-chart").html("");
    
    d3.select("#bar-chart").style("display", "none");
    d3.select("#pie-chart").style("display", "none");
    d3.select("#back-button").style("display", "none");

    switch(sceneNumber) {
        case 1:
            d3.select("#bar-chart").style("display", "block");
            renderTeamSalaries();
            break;
        case 2:
            d3.select("#bar-chart").style("display", "block");
            renderSalaryVsPerformance();
            break;
        case 3:
            // Implement Player Salaries vs PER scene
            break;
        case 4:
            // Implement Team Salary Distribution scene
            break;
        case 5:
            d3.select("#pie-chart").style("display", "block");
            d3.select("#back-button").style("display", "block");
            if (teamData) {
                renderPieChart(teamData);
            } else {
                console.error("No team data provided for pie chart");
            }
            break;
    }
}

function renderPieChart(teamData) {
    console.log("Rendering pie chart for:", teamData);
    if (!teamData || !teamData.players) {
        console.error("Invalid team data for pie chart");
        return;
    }

    d3.select("#pie-chart").html("");

    const width = 800;
    const height = 600;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select("#pie-chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    const pie = d3.pie()
        .value(d => d.Salary)
        .sort(null);

    const arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius * 0.8);

    const labelArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    const arcs = svg.selectAll("arc")
        .data(pie(teamData.players))
        .enter()
        .append("g")
        .attr("class", "arc");

    arcs.append("path")
        .attr("d", arc)
        .attr("fill", (d, i) => color(i));

    arcs.append("text")
        .attr("transform", d => `translate(${labelArc.centroid(d)})`)
        .attr("dy", ".35em")
        .text(d => {
            const percentage = ((d.data.Salary / teamData.totalSalary) * 100).toFixed(1);
            return percentage > 3 ? `${d.data['Player Name']} (${percentage}%)` : '';
        })
        .style("text-anchor", "middle")
        .style("font-size", "12px")
        .style("fill", "black");

    const pieTooltip = d3.select("#pie-chart")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    arcs.on("mouseover", function(event, d) {
        pieTooltip.transition()
            .duration(200)
            .style("opacity", .9);
        pieTooltip.html(`
            Player: ${d.data['Player Name']}<br/>
            Age: ${d.data.Age}<br/>
            Position: ${d.data.Position}<br/>
            Salary: $${(d.data.Salary / 1000000).toFixed(2)}M<br/>
            % of Total: ${((d.data.Salary / teamData.totalSalary) * 100).toFixed(1)}%
        `)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
        pieTooltip.transition()
            .duration(500)
            .style("opacity", 0);
    });

    svg.append("text")
        .attr("x", 0)
        .attr("y", -height / 2 + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text(`${teamData.teamFullName} Salary Distribution`);
}

export { processData, showScene, renderPieChart };