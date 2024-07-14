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
    // Process the CSV data and calculate team totals
    let teamTotals = {};
    let players = csvData.map(d => {
        // Parse numeric values
        d.Salary = parseFloat(d.Salary);
        d.PER = parseFloat(d.PER);
        
        // Use the latter team if multiple are listed
        d.Team = d.Team.split('/').pop().trim();
        
        // Initialize or update team totals
        if (!teamTotals[d.Team]) {
            teamTotals[d.Team] = {totalSalary: 0, playerCount: 0};
        }
        teamTotals[d.Team].totalSalary += d.Salary;
        teamTotals[d.Team].playerCount++;
        
        return d;
    });
    
    // Convert teamTotals to array and calculate averages
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
            winPercentage: ranking ? parseFloat(ranking['W/L%']) : 'N/A'
        };
    });
    
    return {players, teams};
}

function showScene(sceneNumber) {
    console.log("Showing scene:", sceneNumber);
    currentScene = sceneNumber;
    d3.select("#visualization").html("");
    
    switch(sceneNumber) {
        case 1:
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

    d3.select("#visualization").html(""); // Clear previous content

    // Add toggle button
    const toggleButton = d3.select("#visualization")
        .append("button")
        .text("Sort by " + (sortBySalary ? "Win %" : "Salary"))
        .on("click", function() {
            sortBySalary = !sortBySalary;
            updateChart();
        });

    const svg = d3.select("#visualization")
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

    y.domain([0, d3.max(data.teams, d => d.totalSalary / 1000000)]);

    // Add x axis
    const xAxis = svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);

    // Add y axis
    svg.append("g")
        .call(d3.axisLeft(y)
        .tickFormat(d => `$${d}M`));

    // Create a tooltip
    const tooltip = d3.select("#visualization")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")
        .style("pointer-events", "none");

    function updateChart() {
        // Sort teams
        data.teams.sort((a, b) => sortBySalary ? 
            b.totalSalary - a.totalSalary : 
            b.winPercentage - a.winPercentage);

        x.domain(data.teams.map(d => d.team));

        // Update x-axis
        xAxis.transition().duration(750).call(d3.axisBottom(x))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em");

        // Update bars
        const bars = svg.selectAll(".bar")
            .data(data.teams, d => d.team);

        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("y", d => y(d.totalSalary / 1000000))
            .attr("height", d => height - y(d.totalSalary / 1000000))
            .attr("fill", d => colors[d.team] ? colors[d.team].colors[colors[d.team].mainColor].hex : "#cccccc")
            .merge(bars)
            .transition()
            .duration(750)
            .attr("x", d => x(d.team))
            .attr("width", x.bandwidth());

        bars.exit().remove();

        // Update event listeners
        svg.selectAll(".bar")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                updateTooltipContent(d);
            })
            .on("mousemove", function(event, d) {
                updateTooltipContent(d);
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Update title
        svg.select(".chart-title")
            .text(`NBA Team Salaries (2022-2023 Season) - Sorted by ${sortBySalary ? "Salary" : "Win %"}`);

        // Update x axis label
        svg.select(".x-axis-label")
            .text(`Teams Ranked by ${sortBySalary ? "Salary" : "Win %"}`);

        // Update toggle button text
        toggleButton.text("Sort by " + (sortBySalary ? "Win %" : "Salary"));
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

    // Add y axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Salary (Millions)");

    // Add x axis label
    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("transform", `translate(${width/2}, ${height + margin.bottom - 10})`)
        .style("text-anchor", "middle");

    // Add title
    svg.append("text")
        .attr("class", "chart-title")
        .attr("x", width / 2)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "underline");

    // Add salary cap line
    const salaryCap = 123.655; // 2022-2023 NBA salary cap in millions
    svg.append("line")
        .attr("x1", 0)
        .attr("y1", y(salaryCap))
        .attr("x2", width)
        .attr("y2", y(salaryCap))
        .attr("stroke", "red")
        .attr("stroke-dasharray", "5,5");

    svg.append("text")
        .attr("x", width)
        .attr("y", y(salaryCap))
        .attr("dy", "-0.5em")
        .attr("text-anchor", "end")
        .attr("fill", "red")
        .text("Salary Cap: $123.655M");

    // Initial chart render
    updateChart();

    console.log("Finished rendering team salaries");
}