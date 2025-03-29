// DOM Elements
const birthdateInput = document.getElementById('birthdate');
const currentAgeInput = document.getElementById('current-age');
const lifeExpectancyInput = document.getElementById('life-expectancy');
const milestoneLabel = document.getElementById('milestone-label');
const milestoneAge = document.getElementById('milestone-age');
const addMilestoneBtn = document.getElementById('add-milestone-btn');
const milestonesList = document.getElementById('milestones-list');
const yearViewBtn = document.getElementById('year-view-btn');
const weekViewBtn = document.getElementById('week-view-btn');

const gridContainer = document.getElementById('grid-container');
const visualizationTitle = document.getElementById('visualization-title');
const legend = document.getElementById('legend');

// State
let state = {
    currentAge: 30,
    lifeExpectancy: 90,
    milestones: [],
    viewMode: 'year', // 'year' or 'week'
    birthdate: null // Will store the user's birthdate when provided
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
    
    if (urlParams.has('birthdate')) {
        state.birthdate = urlParams.get('birthdate');
        birthdateInput.value = state.birthdate;
    }
    
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
    
    // Calculate current age if birthdate is provided
    if (state.birthdate) {
        calculateCurrentAge();
    }
}

// Calculate current age based on birthdate
function calculateCurrentAge() {
    if (!state.birthdate) return;
    
    const birthDate = new Date(state.birthdate);
    const today = new Date();
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    state.currentAge = age;
    currentAgeInput.value = age;
}

// Calculate date from age
function getDateFromAge(ageInYears, ageInWeeks = 0) {
    if (!state.birthdate) return null;
    
    const birthDate = new Date(state.birthdate);
    const resultDate = new Date(birthDate);
    
    resultDate.setFullYear(birthDate.getFullYear() + ageInYears);
    resultDate.setDate(resultDate.getDate() + (ageInWeeks * 7));
    
    return resultDate;
}

// Format date to readable string
function formatDate(date) {
    if (!date) return '';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

// Save state to URL parameters
function saveStateToUrl() {
    const urlParams = new URLSearchParams();
    
    if (state.birthdate) {
        urlParams.set('birthdate', state.birthdate);
    }
    
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
    
    // Birthdate input
    birthdateInput.addEventListener('change', () => {
        if (birthdateInput.value) {
            state.birthdate = birthdateInput.value;
            calculateCurrentAge();
            generateVisualization();
            saveStateToUrl();
        }
    });
    
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
    
    // Update visualization when life expectancy changes
    lifeExpectancyInput.addEventListener('change', () => {
        state.lifeExpectancy = parseInt(lifeExpectancyInput.value) || 90;
        generateVisualization();
        saveStateToUrl();
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
    
    // Calculate total years/weeks (including past and future)
    const totalYears = state.lifeExpectancy;
    const totalWeeks = totalYears * 52;
    
    // Set grid class based on view mode
    if (state.viewMode === 'year') {
        gridContainer.className = 'year-grid';
        visualizationTitle.textContent = `Your Life Timeline (${state.lifeExpectancy - state.currentAge} Years Remaining)`;
        generateYearGrid(totalYears);
    } else {
        gridContainer.className = 'week-grid';
        visualizationTitle.textContent = `Your Life Timeline (${(state.lifeExpectancy - state.currentAge) * 52} Weeks Remaining)`;
        generateWeekGrid(totalWeeks);
    }
    
    // Generate legend
    generateLegend();
}

// Generate year grid
function generateYearGrid(years) {
    for (let i = 0; i < years; i++) {
        const age = i + 1;
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        
        // Mark past years (already lived)
        if (age <= state.currentAge) {
            gridItem.classList.add('past');
        }
        
        // Mark current year
        if (age === state.currentAge) {
            gridItem.classList.add('current');
        }
        
        // Calculate start and end dates for this year
        let dateInfo = '';
        if (state.birthdate) {
            const yearStartDate = getDateFromAge(age - 1);
            const yearEndDate = getDateFromAge(age);
            yearEndDate.setDate(yearEndDate.getDate() - 1); // Subtract one day to get the end of the previous year
            
            dateInfo = `\n${formatDate(yearStartDate)} - ${formatDate(yearEndDate)}`;
        }
        
        // Check if this year contains a milestone
        const milestone = state.milestones.find(m => m.age === age);
        if (milestone) {
            gridItem.classList.add('milestone');
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `${milestone.label} (Age ${age})${dateInfo}`;
            
            gridItem.appendChild(tooltip);
        }
        
        // Add age tooltip
        if (!milestone) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `Age ${age}${dateInfo}`;
            
            gridItem.appendChild(tooltip);
        }
        
        gridContainer.appendChild(gridItem);
    }
}

// Generate week grid
function generateWeekGrid(weeks) {
    // Calculate total weeks lived so far
    const weeksLived = state.currentAge * 52;
    
    for (let i = 0; i < weeks; i++) {
        const weekNumber = i + 1;
        const currentWeekInYear = weekNumber % 52 || 52;
        const yearsPassed = Math.floor((weekNumber - 1) / 52);
        const age = yearsPassed + 1;
        
        const gridItem = document.createElement('div');
        gridItem.className = 'grid-item';
        
        // Mark past weeks (already lived)
        if (weekNumber <= weeksLived) {
            gridItem.classList.add('past');
        }
        
        // Mark current week
        if (weekNumber > weeksLived - 1 && weekNumber <= weeksLived) {
            gridItem.classList.add('current');
        }
        
        // Calculate start and end dates for this week
        let dateInfo = '';
        if (state.birthdate) {
            const weekStartDate = getDateFromAge(0, weekNumber - 1);
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6); // Add 6 days to get the end of the week
            
            dateInfo = `\n${formatDate(weekStartDate)} - ${formatDate(weekEndDate)}`;
        }
        
        // Check if this week contains a milestone
        // For simplicity, we'll mark the first week of the milestone year
        const milestone = state.milestones.find(m => {
            const milestoneWeek = m.age * 52 - 51;
            return weekNumber >= milestoneWeek && weekNumber < milestoneWeek + 1;
        });
        
        if (milestone) {
            gridItem.classList.add('milestone');
            
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `${milestone.label} (Age ${milestone.age})${dateInfo}`;
            
            gridItem.appendChild(tooltip);
        }
        
        // Add week tooltip
        if (!milestone) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = `Age ${age}, Week ${currentWeekInYear}${dateInfo}`;
            
            gridItem.appendChild(tooltip);
        }
        
        gridContainer.appendChild(gridItem);
    }
}

// Generate legend
function generateLegend() {
    legend.innerHTML = '';
    
    // Past item
    const pastItem = document.createElement('div');
    pastItem.className = 'legend-item';
    
    const pastColor = document.createElement('div');
    pastColor.className = 'legend-color';
    pastColor.style.backgroundColor = '#16db93';
    pastColor.style.opacity = '0.7';
    pastColor.style.border = '2px solid #13b97c';
    
    const pastLabel = document.createElement('span');
    pastLabel.textContent = 'Past';
    
    pastItem.appendChild(pastColor);
    pastItem.appendChild(pastLabel);
    
    // Current item
    const currentItem = document.createElement('div');
    currentItem.className = 'legend-item';
    
    const currentColor = document.createElement('div');
    currentColor.className = 'legend-color';
    currentColor.style.backgroundColor = '#ffd166';
    currentColor.style.border = '2px solid #e6bc5c';
    
    const currentLabel = document.createElement('span');
    currentLabel.textContent = 'Current';
    
    currentItem.appendChild(currentColor);
    currentItem.appendChild(currentLabel);
    
    // Future item
    const futureItem = document.createElement('div');
    futureItem.className = 'legend-item';
    
    const futureColor = document.createElement('div');
    futureColor.className = 'legend-color';
    futureColor.style.backgroundColor = '#051c30';
    futureColor.style.border = '2px solid #2a628f';
    
    const futureLabel = document.createElement('span');
    futureLabel.textContent = 'Future';
    
    futureItem.appendChild(futureColor);
    futureItem.appendChild(futureLabel);
    
    // Milestone item
    const milestoneItem = document.createElement('div');
    milestoneItem.className = 'legend-item';
    
    const milestoneColor = document.createElement('div');
    milestoneColor.className = 'legend-color';
    milestoneColor.style.backgroundColor = '#3e92cc';
    milestoneColor.style.border = '2px solid #2a628f';
    
    const milestoneLabel = document.createElement('span');
    milestoneLabel.textContent = 'Milestone';
    
    milestoneItem.appendChild(milestoneColor);
    milestoneItem.appendChild(milestoneLabel);
    
    // Add to legend
    legend.appendChild(pastItem);
    legend.appendChild(currentItem);
    legend.appendChild(futureItem);
    legend.appendChild(milestoneItem);
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);