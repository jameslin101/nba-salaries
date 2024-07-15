import colors from './nba_colors.js';

// Global variables
let currentScene = 1;
let data;
let rankingsData;
let sortBySalary = true;

// Add event listeners to buttons
document.getElementById('scene1').addEventListener('click', () => showScene(1));
document.getElementById('scene2').addEventListener('click', () => showScene(2));
document.getElementById('scene3').addEventListener('click', () => showScene(3));
document.getElementById('scene4').addEventListener('click', () => showScene(4));
document.getElementById('back-to-salaries').addEventListener('click', () => showScene(1));

// Load and process the data
Promise.all([
    d3.csv("nba_2022-23_all_stats_with_salary.csv"),
    d3.csv("nba_2022-23_rankings.csv")
]).then(function([salaryData, rankings]) {
    console.log("Data loaded:", salaryData, rankings);
    rankingsData = rankings;
    data = processData(salaryData);
    console.log("Processed data:", data);
    showScene(currentScene);
}).catch(function(error) {
    console.log("Error loading the CSV files:", error);
});

function processData(csvData) {
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
    currentScene = sceneNumber;
    d3.select("#bar-chart").html("");
    d3.select("#pie-chart").html("");
    
    d3.select("#bar-chart").style("display", "none");
    d3.select("#pie-chart").style("display", "none");
    d3.select("#navigation").style("display", "none");
    d3.select("#back-button").style("display", "none");

    switch(sceneNumber) {
        case 1:
            d3.select("#bar-chart").style("display", "block");
            d3.select("#navigation").style("display", "block");
            renderTeamSalaries();
            break;
        case 2:
            // Implement Team Salary vs Performance scene
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

function renderTeamSalaries() {
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
        data.teams.sort((a, b) => sortBySalary ? 
            b.totalSalary - a.totalSalary : 
            b.winPercentage - a.winPercentage);

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

        svg.select(".salary-cap-line")
            .transition()
            .duration(750)
            .attr("y1", y(salaryCap))
            .attr("y2", y(salaryCap));

        svg.select(".salary-cap-text")
            .transition()
            .duration(750)
            .attr("y", y(salaryCap));

        svg.select(".chart-title")
            .text(`NBA Team Salaries (2022-2023 Season) - Sorted by ${sortBySalary ? "Salary" : "Win %"}`);

        svg.select(".x-axis-label")
            .text(`Teams Ranked by ${sortBySalary ? "Salary" : "Win %"}`);
    }

    function updateTooltipContent(d) {
        tooltip.html(`
            Team: ${d.teamFullName}<br/>
            Power Ranking: ${d.rank}<br/>
            Wins: ${d.wins}<br/>
            Losses: ${d.losses}<br/>
            Win %: ${d.winPercentage}<br/>
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

    svg.append("line")
        .attr("class", "salary-cap-line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("stroke", "red")
        .attr("stroke-dasharray", "5,5");

    svg.append("text")
        .attr("class", "salary-cap-text")
        .attr("x", width)
        .attr("dy", "-0.5em")
        .attr("text-anchor", "end")
        .attr("fill", "red")
        .text("Salary Cap: $123.655M");

    const toggleButton = d3.select("#bar-chart")
        .append("button")
        .text("Sort by " + (sortBySalary ? "Win %" : "Salary"))
        .on("click", function() {
            sortBySalary = !sortBySalary;
            updateChart();
        });

    updateChart();

    console.log("Finished rendering team salaries");
}


function renderPieChart(teamData) {
    console.log("Rendering pie chart for:", teamData);
    if (!teamData || !teamData.players) {
        console.error("Invalid team data for pie chart");
        return;
    }

    d3.select("#pie-chart").html("");

    const width = 600;
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
            return percentage > 3 ? `${d.data['Player Name'].split(' ').pop()} (${percentage}%)` : '';
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

// Initial scene
showScene(1);