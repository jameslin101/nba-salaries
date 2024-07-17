export function createTooltip(container) {
  return d3.select(container)
      .append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);
}