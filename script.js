// DOM Elements
const currentAgeInput = document.getElementById('current-age');
const lifeExpectancyInput = document.getElementById('life-expectancy');
const milestoneLabel = document.getElementById('milestone-label');
const milestoneAge = document.getElementById('milestone-age');
const addMilestoneBtn = document.getElementById('add-milestone-btn');
const milestonesList = document.getElementById('milestones-list');
const yearViewBtn = document.getElementById('year-view-btn');
const weekViewBtn = document.getElementById('week-view-btn');
const updateBtn = document.getElementById('update-btn');
const shareBtn = document.getElementById('share-btn');
const gridContainer = document.getElementById('grid-container');
const visualizationTitle = document.getElementById('visualization-title');
const legend = document.getElementById('legend');

// State
let state = {
    currentAge: 30,
    lifeExpectancy: 90,
    milestones: [],
    viewMode: 'year' // 'year' or 'week'
};

// Initialize the app
function init() {
    // Load state from URL if available
    loadStateFromUrl();
    
    // Set input values based on state
    currentAgeInput.value = state.currentAge;
    lifeExpectancyInput.value = state.lifeExpectancy;
    
    // Render milestones
    renderMilestones();
    
    // Set active view button
    if (state.viewMode === 'year') {
        yearViewBtn.classList.add('active');
        weekViewBtn.classList.remove('active');
    } else {
        weekViewBtn.classList.add('active');
        yearViewBtn.classList.remove('active');
    }
    
    // Generate visualization
    generateVisualization();
    
    // Add event listeners
    addEventListeners();
}

// Load state from URL parameters
function loadStateFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('age')) {
        state.currentAge = parseInt(urlParams.get('age'));
    }
    
    if (urlParams.has('expectancy')) {
        state.lifeExpectancy = parseInt(urlParams.get('expectancy'));
    }
    
    if (urlParams.has('view')) {
        state.viewMode = urlParams.get('view');
    }
    
    if (urlParams.has('milestones')) {
        try {
            state.milestones = JSON.parse(decodeURIComponent(urlParams.get('milestones')));
        } catch (e) {
            console.error('Error parsing milestones from URL', e);
            state.milestones = [];
        }
    }
}

// Save state to URL parameters
function saveStateToUrl() {
    const urlParams = new URLSearchParams();
    
    urlParams.set('age', state.currentAge);
    urlParams.set('expectancy', state.lifeExpectancy);
    urlParams.set('view', state.viewMode);
    urlParams.set('milestones', encodeURIComponent(JSON.stringify(state.milestones)));
    
    const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.pushState({}, '', newUrl);
    
    return newUrl;
}

// Add event listeners
function addEventListeners() {
    // Add milestone button
    addMilestoneBtn.addEventListener('click', addMilestone);
    
    // View mode buttons
    yearViewBtn.addEventListener('click', () => {
        state.viewMode = 'year';
        yearViewBtn.classList.add('active');
        weekViewBtn.classList.remove('active');
        generateVisualization();
    });
    
    weekViewBtn.addEventListener('click', () => {
        state.viewMode = 'week';
        weekViewBtn.classList.add('active');
        yearViewBtn.classList.remove('active');
        generateVisualization();
    });
    
    // Update button
    updateBtn.addEventListener('click', () => {
        state.currentAge = parseInt(currentAgeInput.value) || 0;
        state.lifeExpectancy = parseInt(lifeExpectancyInput.value) || 90;
        generateVisualization();
        saveStateToUrl();
    });
    
    // Share button
    shareBtn.addEventListener('click', () => {
        const url = saveStateToUrl();
        navigator.clipboard.writeText(url)
            .then(() => {
                alert('Link copied to clipboard!');
            })
            .catch(err => {
                console.error('Could not copy link: ', err);
                alert('Could not copy link. Please copy the URL from your browser address bar.');
            });
    });
}

// Add a milestone
function addMilestone() {
    const label = milestoneLabel.value.trim();
    const age = parseInt(milestoneAge.value);
    
    if (!label || isNaN(age)) {
        alert('Please enter both a label and a valid age for the milestone.');
        return;
    }
    
    if (age <= state.currentAge) {
        alert('Milestone age must be greater than your current age.');
        return;
    }
    
    if (age > state.lifeExpectancy) {
        alert('Milestone age cannot exceed your life expectancy.');
        return;
    }
    
    // Add milestone to state
    const milestone = {
        id: Date.now(), // Use timestamp as unique ID
        label,
        age
    };
    
    state.milestones.push(milestone);
    
    // Clear inputs
    milestoneLabel.value = '';
    milestoneAge.value = '';
    
    // Render milestones
    renderMilestones();
    
    // Update visualization
    generateVisualization();
    
    // Save state to URL
    saveStateToUrl();
}

// Render milestones list
function renderMilestones() {
    milestonesList.innerHTML = '';
    
    if (state.milestones.length === 0) {
        milestonesList.innerHTML = '<p>No milestones added yet.</p>';
        return;
    }
    
    // Sort milestones by age
    const sortedMilestones = [...state.milestones].sort((a, b) => a.age - b.age);
    
    sortedMilestones.forEach(milestone => {
        const milestoneItem = document.createElement('div');
        milestoneItem.className = 'milestone-item';
        
        const milestoneInfo = document.createElement('div');
        milestoneInfo.textContent = `${milestone.label} (Age ${milestone.age})`;
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteMilestone(milestone.id));
        
        milestoneItem.appendChild(milestoneInfo);
        milestoneItem.appendChild(deleteBtn);
        
        milestonesList.appendChild(milestoneItem);
    });
}

// Delete a milestone
function deleteMilestone(id) {
    state.milestones = state.milestones.filter(milestone => milestone.id !== id);
    
    // Render milestones
    renderMilestones();
    
    // Update visualization
    generateVisualization();
    
    // Save state to URL
    saveStateToUrl();
}

// Generate visualization
function generateVisualization() {
    // Clear grid container
    gridContainer.innerHTML = '';
    
    // Calculate remaining years/weeks
    const remainingYears = state.lifeExpectancy - state.currentAge;
    const remainingWeeks = remainingYears * 52;
    
    // Set grid class based on view mode
    if (state.viewMode === 'year') {
        gridContainer.className = 'year-grid';
        visualizationTitle.textContent = `Your Remaining ${remainingYears} Years`;
        generateYearGrid(remainingYears);
    } else {
        gridContainer.className = 'week-grid';
        visualizationTitle.textContent = `Your Remaining ${remainingWeeks} Weeks`;
        generateWeekGrid(remainingWeeks);
    }
    
    // Generate legend
    generateLegend();
}

// Generate year grid
function generateYearGrid(years) {
    for (let i = 0; i < years; i++) {
        const age = state.currentAge + i + 1;
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        
        // Check if this year contains a milestone
        const milestone = state.milestones.find(m => m.age === age);
        if (milestone) {
            gridItem.classList.add('milestone');
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `${milestone.label} (Age ${milestone.age})`;
            
            gridItem.appendChild(tooltip);
        }
        
        // Add age tooltip
        if (!milestone) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `Age ${age}`;
            
            gridItem.appendChild(tooltip);
        }
        
        gridContainer.appendChild(gridItem);
    }
}

// Generate week grid
function generateWeekGrid(weeks) {
    for (let i = 0; i < weeks; i++) {
        const weekNumber = i + 1;
        const currentWeekInYear = weekNumber % 52;
        const yearsPassed = Math.floor(weekNumber / 52);
        const age = state.currentAge + yearsPassed + (currentWeekInYear === 0 ? 0 : 1);
        
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        
        // Check if this week contains a milestone
        // For simplicity, we'll mark the first week of the milestone year
        const milestone = state.milestones.find(m => {
            const milestoneWeek = (m.age - state.currentAge) * 52;
            return weekNumber >= milestoneWeek && weekNumber < milestoneWeek + 1;
        });
        
        if (milestone) {
            gridItem.classList.add('milestone');
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `${milestone.label} (Age ${milestone.age})`;
            
            gridItem.appendChild(tooltip);
        }
        
        // Add week tooltip
        if (!milestone) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `Age ${age}, Week ${currentWeekInYear || 52}`;
            
            gridItem.appendChild(tooltip);
        }
        
        gridContainer.appendChild(gridItem);
    }
}

// Generate legend
function generateLegend() {
    legend.innerHTML = '';
    
    // Regular item
    const regularItem = document.createElement('div');
    regularItem.className = 'legend-item';
    
    const regularColor = document.createElement('div');
    regularColor.className = 'legend-color';
    regularColor.style.backgroundColor = '#e9ecef';
    
    const regularLabel = document.createElement('span');
    regularLabel.textContent = state.viewMode === 'year' ? 'Year' : 'Week';
    
    regularItem.appendChild(regularColor);
    regularItem.appendChild(regularLabel);
    
    // Milestone item
    const milestoneItem = document.createElement('div');
    milestoneItem.className = 'legend-item';
    
    const milestoneColor = document.createElement('div');
    milestoneColor.className = 'legend-color';
    milestoneColor.style.backgroundColor = '#4dabf7';
    
    const milestoneLabel = document.createElement('span');
    milestoneLabel.textContent = 'Milestone';
    
    milestoneItem.appendChild(milestoneColor);
    milestoneItem.appendChild(milestoneLabel);
    
    // Add to legend
    legend.appendChild(regularItem);
    legend.appendChild(milestoneItem);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);