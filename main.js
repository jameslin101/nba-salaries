import { processData, showScene } from './script.js';
import colors from './nba_colors.js';

// Global variables
let currentScene = 1;
let data;
let rankingsData;

function setCurrentScene(newScene) {
    currentScene = newScene;
    updateButtonStates();
}

function updateButtonStates() {
    document.querySelectorAll('.scene-button').forEach((btn, index) => {
        btn.classList.toggle('active', index + 1 === currentScene);
    });
    document.getElementById('prevButton').disabled = currentScene === 1;
    document.getElementById('nextButton').disabled = currentScene === 3;
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
    document.querySelectorAll('.scene-button').forEach((btn, index) => {
        btn.addEventListener('click', () => showScene(index + 1));
    });

    document.getElementById('prevButton').addEventListener('click', () => {
        if (currentScene > 1) showScene(currentScene - 1);
    });

    document.getElementById('nextButton').addEventListener('click', () => {
        if (currentScene < 3) showScene(currentScene + 1);
    });

    document.getElementById('back-to-salaries').addEventListener('click', () => showScene(1));

    // Initialize button states
    updateButtonStates();
});



export { currentScene, setCurrentScene, data, rankingsData, colors };