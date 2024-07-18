import { processData, showScene } from './script.js';
import colors from './nba_colors.js';

// Global variables
let currentScene = 1;
let data;
let rankingsData;

function setCurrentScene(newScene) {
    currentScene = newScene;
}

// Load and process the data
Promise.all([
    d3.csv("nba_2022-23_all_stats_with_salary.csv"),
    d3.csv("nba_2022-23_rankings.csv")
]).then(function([salaryData, rankings]) {
    console.log("Data loaded:", salaryData, rankings);
    rankingsData = rankings;
    data = processData(salaryData, rankings);
    console.log("Processed data:", data);
    showScene(currentScene);
}).catch(function(error) {
    console.log("Error loading the CSV files:", error);
});

// Add event listeners to buttons
document.addEventListener('DOMContentLoaded', (event) => {
    document.getElementById('scene1').addEventListener('click', () => showScene(1));
    document.getElementById('scene2').addEventListener('click', () => showScene(2));
    document.getElementById('scene3').addEventListener('click', () => showScene(3));
    document.getElementById('scene4').addEventListener('click', () => showScene(4));
    document.getElementById('back-to-salaries').addEventListener('click', () => showScene(1));
});

export { currentScene, setCurrentScene, data, rankingsData, colors };