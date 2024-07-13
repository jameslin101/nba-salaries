document.addEventListener("DOMContentLoaded", function() {
  // Scene 1: Overview of Player Salaries
  const scene1 = d3.select("#scene1");
  scene1.append("h2").text("Overview of Player Salaries");

  // Set up SVG canvas dimensions
  const margin = { top: 20, right: 30, bottom: 40, left: 90 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = scene1.append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Load the data
  d3.csv("nba_salaries_2022_2023.csv").then(data => {
      // Parse the data
      data.forEach(d => {
          d['2022/2023'] = +d['2022/2023'];
      });

      // Set up scales
      const x = d3.scaleLinear()
          .domain([0, d3.max(data, d => d['2022/2023'])])
          .range([0, width]);

      const y = d3.scaleBand()
          .domain(data.map(d => d['Player Name']))
          .range([0, height])
          .padding(0.1);

      // Add axes
      svg.append("g")
          .call(d3.axisLeft(y));

      svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x).ticks(5));

      // Create bars
      svg.selectAll(".bar")
          .data(data)
        .enter().append("rect")
          .attr("class", "bar")
          .attr("x", 0)
          .attr("y", d => y(d['Player Name']))
          .attr("width", d => x(d['2022/2023']))
          .attr("height", y.bandwidth())
          .attr("fill", "steelblue");

      // Add annotations for average, median, highest, and lowest salaries
      const averageSalary = d3.mean(data, d => d['2022/2023']);
      const medianSalary = d3.median(data, d => d['2022/2023']);
      const highestSalary = d3.max(data, d => d['2022/2023']);
      const lowestSalary = d3.min(data, d => d['2022/2023']);

      svg.append("line")
          .attr("x1", x(averageSalary))
          .attr("x2", x(averageSalary))
          .attr("y1", 0)
          .attr("y2", height)
          .attr("stroke", "red")
          .attr("stroke-dasharray", "4");

      svg.append("text")
          .attr("x", x(averageSalary))
          .attr("y", -5)
          .attr("class", "annotation")
          .text(`Average: $${d3.format(",")(averageSalary)}`);

      svg.append("line")
          .attr("x1", x(medianSalary))
          .attr("x2", x(medianSalary))
          .attr("y1", 0)
          .attr("y2", height)
          .attr("stroke", "green")
          .attr("stroke-dasharray", "4");

      svg.append("text")
          .attr("x", x(medianSalary))
          .attr("y", -5)
          .attr("class", "annotation")
          .text(`Median: $${d3.format(",")(medianSalary)}`);

      svg.append("text")
          .attr("x", x(highestSalary))
          .attr("y", height + 20)
          .attr("class", "annotation")
          .text(`Highest: $${d3.format(",")(highestSalary)}`);

      svg.append("text")
          .attr("x", x(lowestSalary))
          .attr("y", height + 20)
          .attr("class", "annotation")
          .text(`Lowest: $${d3.format(",")(lowestSalary)}`);
  });
});
