# NBA Salary Visualization: Exploring the Relationship Between Pay and Performance

## Project Overview

This interactive visualization explores the complex relationship between NBA team and player salaries and their performance during the 2022-2023 season. By presenting data on team salaries, win percentages, and individual player metrics, the visualization aims to answer questions NBA fans might be interested in:

- Does higher spending correlate with better performance?
- Which teams had the best performing front office?
- Which players are the most overpaid and underpaid?

The data is sourced from:
[Basketball-Reference](https://www.basketball-reference.com/leagues/NBA_2023_totals.html)
[Kaggle](https://www.kaggle.com/datasets/jamiewelsh2/nba-player-salaries-2022-23-season)

## Narrative Structure

This visualization follows an interactive slideshow structure, allowing users to progress through three main scenes while providing opportunities for in-depth exploration at each stage. The narrative begins with an overview of team salaries, progresses to team performance, and concludes with individual player metrics. This structure enables users to grasp the big picture before diving into more granular data, facilitating a comprehensive understanding of the salary-performance dynamic in the NBA.

## Visual Structure

Each scene employs a distinct visual structure tailored to its specific data:

1. **Team Salaries**: A bar chart ranks NBA teams by total salary, with a horizontal line indicating the salary cap. This visual immediately communicates spending disparities and cap compliance. Clicking the bars opens up a pie chart to provide a visual representation of salary distribution within each team.

2. **Team Salary vs. Performance**: A scatterplot correlates team salaries with win percentages. The addition of a regression line helps viewers quickly discern overall trends, while team logos enhance engagement and recognition.

3. **Player Salaries vs. Performance Metrics**: Another scatterplot compares individual player salaries against various performance metrics. Color-coding by team and selectable metrics allow for multi-dimensional analysis. This scene also allows users to visually compare the performance of players on a team and across different teams, since the dots are color-coded by team. Hovering over a dot will show the salary and performance metrics for that player.

## Scenes

1. **Team Salaries**: This opening scene provides context, showing the financial landscape of the NBA. Users can immediately see which teams are big spenders (either have bad contracts or are contending for a championship) and which are more conservative (perhaps in the process of a rebuild).

2. **Team Salary vs. Performance**: Building on the first scene, this visualization directly visualizes whether a team's investment in salary spending has translated to wins.

3. **Player Salaries vs. Performance Metrics**: The final scene drills down to individual players, allowing users to explore whether high-paid players justify their salaries through performance.

This sequence logically progresses from macro to micro, enabling users to build a layered understanding of the salary-performance relationship.

## Annotations

Consistent tooltip templates across scenes provide detailed information on hover, enhancing the core visualizations without cluttering the main view. In the team salary scene, annotations highlight the salary cap, crucial for understanding spending constraints. The player performance scene uses annotations to explain advanced metrics, aiding users who may be unfamiliar with these statistics.

## Parameters

Key parameters include the selected team, current performance metric, and team visibility. These parameters define the state of each scene and allow for personalized exploration. For instance, users can focus on their favorite team or compare specific metrics across the league.

## Triggers

User interactions serve as triggers, changing the visualization state:

- Clicking on team bars reveals detailed breakdowns in pie charts.
- Clicking on team logos shows tables detailing their player salaries and stats.
- Selecting different performance metrics in the player scene updates the scatterplot.
- Hovering over data points displays tooltips with comprehensive statistics.

These triggers are communicated through visual cues like cursor changes and highlight effects, ensuring users understand how to interact with the visualization.

## Conclusion

This narrative visualization leverages interactive elements and multiple scenes to provide a comprehensive exploration of NBA salaries and performance. By allowing users to examine this relationship from various perspectives – league-wide, team-level, and individual player performance – the visualization offers insights into the complex dynamics of financial investment and athletic success in professional basketball.
