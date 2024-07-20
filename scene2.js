import { data } from './main.js';

export function renderSalaryVsPerformance() {
    console.log("Rendering salary vs performance");
    if (!data || !data.teams || data.teams.length === 0) {
        console.error("No data available to render");
        return;
    }

    const margin = {top: 40, right: 150, bottom: 60, left: 80};
    const width = 1000 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

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

    // Load team logos
    d3.csv("teams_logos.csv").then(function(logoData) {
        const logoMap = new Map(logoData.map(d => [d.team, d.nba_team_imageURL]));

        function updateChart() {
            x.domain([0, d3.max(data.teams, d => d.totalSalary / 1000000)]);
            y.domain([0, d3.max(data.teams, d => d.winPercentage)]);
        
            xAxis.transition().duration(750)
                .call(d3.axisBottom(x).tickFormat(d => `$${d}M`));
        
            yAxis.transition().duration(750)
                .call(d3.axisLeft(y).tickFormat(d => `${(d * 100).toFixed(0)}%`));
        
            const logoSize = 30;
        
            // Remove existing logos
            svg.selectAll(".team-logo-group").remove();
        
            // Create new logo groups
            const logoGroups = svg.selectAll(".team-logo-group")
                .data(data.teams, d => d.team)
                .enter()
                .append("g")
                .attr("class", "team-logo-group");
        
            logoGroups.append("image")
                .attr("class", "team-logo")
                .attr("xlink:href", d => logoMap.get(d.team))
                .attr("width", logoSize)
                .attr("height", logoSize)
                .attr("x", -logoSize / 2)
                .attr("y", -logoSize / 2);
        
            // Set up force simulation
            const simulation = d3.forceSimulation(data.teams)
                .force("x", d3.forceX(d => x(d.totalSalary / 1000000)).strength(0.2))
                .force("y", d3.forceY(d => y(d.winPercentage)).strength(0.2))
                .force("collide", d3.forceCollide().radius(logoSize / 2 + 2).iterations(4))
                .on("tick", ticked);
        
            function ticked() {
                logoGroups.attr("transform", d => `translate(${d.x},${d.y})`);
            }
        
            logoGroups
                .on("click", function(event, d) {
                    console.log("Logo clicked:", d);
                    displayPlayerStats(d);
                })
                .on("mouseover", function(event, d) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    updateTooltipContent(d);
                    tooltip.style("left", (event.pageX + 10) + "px")
                           .style("top", (event.pageY - 10) + "px");
                    d3.select(this).select("image")
                        .transition()
                        .duration(200)
                        .attr("width", logoSize * 1.5)
                        .attr("height", logoSize * 1.5)
                        .attr("x", -logoSize * 1.5 / 2)
                        .attr("y", -logoSize * 1.5 / 2);
                })
                .on("mouseout", function(d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                    d3.select(this).select("image")
                        .transition()
                        .duration(200)
                        .attr("width", logoSize)
                        .attr("height", logoSize)
                        .attr("x", -logoSize / 2)
                        .attr("y", -logoSize / 2);
                });
        
            // Calculate and draw regression line
            const regression = calculateRegression(data.teams);
            
            svg.selectAll(".regression-line").remove();
            
            svg.append("line")
                .attr("class", "regression-line")
                .attr("x1", x(regression.x1))
                .attr("y1", y(regression.y1))
                .attr("x2", x(regression.x2))
                .attr("y2", y(regression.y2))
                .attr("stroke", "black")
                .attr("stroke-width", 2)
                .attr("stroke-dasharray", "5,5");
        
            // Add annotation to regression line
            svg.append("text")
                .attr("class", "regression-annotation")
                .attr("x", x(regression.x2))
                .attr("y", y(regression.y2))
                .attr("dx", "0.5em")
                .attr("dy", "-0.5em")
                .attr("text-anchor", "start")
                .text("Expected performance")
                .attr("fill", "black")
                .attr("font-size", "12px");
        
            svg.select(".chart-title")
                .text("NBA Team Salary vs Performance (2022-2023 Season)");
        
            svg.select(".x-axis-label")
                .text("Total Salary (Millions)");
        
            svg.select(".y-axis-label")
                .text("Win Percentage");
        
        }
        function updateTooltipContent(d) {
            const expectedWinPercentage = calculateExpectedWinPercentage(d.totalSalary / 1000000);
            const difference = d.winPercentage - expectedWinPercentage;
            const performanceText = difference > 0 ? "Outperformed" : "Underperformed";
            
            tooltip.html(`
                Team: ${d.teamFullName}<br/>
                Power Ranking: ${d.rank}<br/>
                Wins: ${d.wins}<br/>
                Losses: ${d.losses}<br/>
                Win %: ${(d.winPercentage * 100).toFixed(1)}%<br/>
                Total Salary: $${(d.totalSalary / 1000000).toFixed(2)}M<br/>
                ${performanceText} by ${Math.abs(difference * 100).toFixed(1)}%<br/>
                Click for player stats
            `);
        }

        function calculateRegression(data) {
            const xValues = data.map(d => d.totalSalary / 1000000);
            const yValues = data.map(d => d.winPercentage);
            
            const xMean = d3.mean(xValues);
            const yMean = d3.mean(yValues);
            
            const ssxx = d3.sum(xValues.map(x => Math.pow(x - xMean, 2)));
            const ssyy = d3.sum(yValues.map(y => Math.pow(y - yMean, 2)));
            const ssxy = d3.sum(xValues.map((x, i) => (x - xMean) * (yValues[i] - yMean)));
            
            const slope = ssxy / ssxx;
            const intercept = yMean - (slope * xMean);
            
            const x1 = d3.min(xValues);
            const y1 = slope * x1 + intercept;
            const x2 = d3.max(xValues);
            const y2 = slope * x2 + intercept;
            
            return {x1, y1, x2, y2, slope, intercept};
        }

        function calculateExpectedWinPercentage(salary) {
            const regression = calculateRegression(data.teams);
            return regression.slope * salary + regression.intercept;
        }

        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle");

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

        // Add a line for average salary
        const avgSalary = d3.mean(data.teams, d => d.totalSalary / 1000000);

        svg.append("line")
            .attr("class", "avg-salary-line")
            .attr("x1", x(avgSalary))
            .attr("x2", x(avgSalary))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "red")
            .attr("stroke-dasharray", "5,5");

        svg.append("text")
            .attr("class", "avg-salary-text")
            .attr("x", x(avgSalary))
            .attr("y", height + 20)
            .attr("text-anchor", "middle")
            .text(`Avg Salary: $${avgSalary.toFixed(2)}M`);

        updateChart();

        console.log("Finished rendering salary vs performance");
    }).catch(function(error) {
        console.log("Error loading the logo CSV file:", error);
    });

    function displayPlayerStats(teamData) {
        // Remove existing table and container if any
        d3.select("#player-stats-container").remove();
    
        // Create a new container for the table
        const container = d3.select("#bar-chart")
            .append("div")
            .attr("id", "player-stats-container")
            .style("margin-top", "20px")
            .style("width", "100%")
            .style("max-height", "400px")  // Adjust this value as needed
            .style("overflow-y", "auto");
    
        // Create a new table inside the container
        const table = container
            .append("table")
            .attr("id", "player-stats-table")
            .style("width", "100%")
            .style("border-collapse", "collapse");
        
        // Add table header
        const thead = table.append("thead");
        thead.append("tr")
            .selectAll("th")
            .data([
                "Player Name", "Position", "Age", "Salary", "GP", "GS", "MP", "FG%", 
                "3P%", "FT%", 
                "AST", "STL", "BLK",  "PTS",
            ])
            .enter()
            .append("th")
            .attr("class", (d, i) => i === 0 ? "player-name-cell" : null)  // Add class to Player Name header
            .text(d => d)
            .style("background-color", "#f2f2f2")
            .style("padding", "8px")
            .style("border", "1px solid #ddd")
            .style("position", "sticky")
            .style("top", "0")
            .style("z-index", "10")
            .style("font-size", "12px");

        // Add table body
        const tbody = table.append("tbody");
        const rows = tbody.selectAll("tr")
            .data(teamData.players)
            .enter()
            .append("tr");
    
        const formatValue = (value, isPercentage = false) => {
            if (typeof value === 'number') {
                return isPercentage ? (value * 100).toFixed(1) + '%' : value.toFixed(1);
            }
            return 'N/A';
        };
    
        rows.selectAll("td")
            .data(d => [
                d['Player Name'], d.Position, d.Age, 
                `$${(d.Salary / 1000000).toFixed(2)}M`, 
                d.GP, d.GS, formatValue(d.MP), 
                formatValue(d['FG%'], true),
                formatValue(d['3P%'], true),
                formatValue(d['FT%'], true),
                formatValue(d.AST), formatValue(d.STL), formatValue(d.BLK), 
                formatValue(d.PTS),
            ])
            .enter()
            .append("td")
            .attr("class", (d, i) => i === 0 ? "player-name-cell" : null)  // Add class to Player Name cell
            .text(d => d)
            .style("padding", "8px")
            .style("border", "1px solid #ddd")
            .style("font-size", "10px");
    
        // Add team name as caption
        table.append("caption")
            .text(`${teamData.teamFullName} Player Stats`)
            .style("font-weight", "bold")
            .style("font-size", "14px")
            .style("margin-bottom", "10px");
    
        // Alternating row colors
        rows.style("background-color", (d, i) => i % 2 === 0 ? "#f9f9f9" : "white");
    
        // Add tooltips for stat explanations
        const statExplanations = {
            'PER': 'Player Efficiency Rating',
            'TS%': 'True Shooting Percentage',
            '3PAr': '3-Point Attempt Rate',
            'FTr': 'Free Throw Rate',
            'ORB%': 'Offensive Rebound Percentage',
            'DRB%': 'Defensive Rebound Percentage',
            'TRB%': 'Total Rebound Percentage',
            'AST%': 'Assist Percentage',
            'STL%': 'Steal Percentage',
            'BLK%': 'Block Percentage',
            'TOV%': 'Turnover Percentage',
            'USG%': 'Usage Percentage',
            'OWS': 'Offensive Win Shares',
            'DWS': 'Defensive Win Shares',
            'WS': 'Win Shares',
            'WS/48': 'Win Shares per 48 minutes',
            'OBPM': 'Offensive Box Plus/Minus',
            'DBPM': 'Defensive Box Plus/Minus',
            'BPM': 'Box Plus/Minus',
            'VORP': 'Value Over Replacement Player'
        };
    
        thead.selectAll("th")
            .append("title")
            .text(d => statExplanations[d] || d);
    }}