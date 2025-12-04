// DOM Elements
const startInput = document.getElementById('startNumber');
const endInput = document.getElementById('endNumber');
const calculateBtn = document.getElementById('calculateBtn');
const clearBtn = document.getElementById('clearBtn');
const themeBtn = document.getElementById('themeBtn');

const totalNumbersEl = document.getElementById('totalNumbers');
const squaresCountEl = document.getElementById('squaresCount');
const evensCountEl = document.getElementById('evensCount');

const squaresListEl = document.getElementById('squaresList');
const evensListEl = document.getElementById('evensList');
const allListEl = document.getElementById('allList');

const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Chart variables
let numbersChart = null;

// Theme management
let isDarkMode = false;

// Initialize the application
function init() {
    // Set up event listeners
    calculateBtn.addEventListener('click', calculate);
    clearBtn.addEventListener('click', clearAll);
    themeBtn.addEventListener('click', toggleTheme);
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Enter key support
    startInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
    
    endInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') calculate();
    });
    
    // Calculate with default values
    calculate();
}

// Main calculation function
function calculate() {
    try {
        // Get and validate input
        const start = parseInt(startInput.value);
        const end = parseInt(endInput.value);
        
        if (isNaN(start) || isNaN(end)) {
            showError('Please enter valid numbers in both fields!');
            return;
        }
        
        if (start > end) {
            showError('Start number must be less than or equal to end number!');
            return;
        }
        
        // Calculate ranges
        const rangeSize = Math.abs(end - start) + 1;
        if (rangeSize > 10000) {
            const confirmLarge = confirm(`Warning: You're about to process ${rangeSize} numbers.\nThis might slow down your browser.\nContinue anyway?`);
            if (!confirmLarge) return;
        }
        
        // Show loading state
        calculateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Calculating...';
        calculateBtn.disabled = true;
        
        // Small delay to show loading state
        setTimeout(() => {
            // Calculate results
            const squares = [];
            const evens = [];
            const allNumbers = [];
            
            for (let i = start; i <= end; i++) {
                allNumbers.push(i);
                
                // Check if perfect square
                const sqrt = Math.sqrt(i);
                if (sqrt === Math.floor(sqrt)) {
                    squares.push(i);
                }
                
                // Check if even
                if (i % 2 === 0) {
                    evens.push(i);
                }
            }
            
            // Update statistics
            updateStats(start, end, squares, evens);
            
            // Update number lists
            updateNumberLists(start, end, squares, evens, allNumbers);
            
            // Update chart
            updateChart(squares, evens, allNumbers);
            
            // Reset button state
            calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate';
            calculateBtn.disabled = false;
            
            // Show success animation
            calculateBtn.style.animation = 'pulse 0.5s ease';
            setTimeout(() => {
                calculateBtn.style.animation = '';
            }, 500);
            
        }, 100);
        
    } catch (error) {
        showError('An error occurred during calculation. Please check your inputs.');
        console.error(error);
        calculateBtn.innerHTML = '<i class="fas fa-calculator"></i> Calculate';
        calculateBtn.disabled = false;
    }
}

// Update statistics display
function updateStats(start, end, squares, evens) {
    const total = end - start + 1;
    const squaresCount = squares.length;
    const evensCount = evens.length;
    
    totalNumbersEl.textContent = total.toLocaleString();
    squaresCountEl.textContent = squaresCount.toLocaleString();
    evensCountEl.textContent = evensCount.toLocaleString();
    
    // Animate the count
    animateCount(totalNumbersEl, total);
    animateCount(squaresCountEl, squaresCount);
    animateCount(evensCountEl, evensCount);
}

// Animate number counting
function animateCount(element, finalValue) {
    const duration = 1000;
    const startValue = parseInt(element.textContent.replace(/,/g, '')) || 0;
    const increment = (finalValue - startValue) / (duration / 16);
    let current = startValue;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= finalValue) || (increment < 0 && current <= finalValue)) {
            current = finalValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(current).toLocaleString();
    }, 16);
}

// Update number lists with visual styling
function updateNumberLists(start, end, squares, evens, allNumbers) {
    // Clear previous lists
    squaresListEl.innerHTML = '';
    evensListEl.innerHTML = '';
    allListEl.innerHTML = '';
    
    // Function to create number element
    const createNumberElement = (number, type) => {
        const div = document.createElement('div');
        div.className = `number-item ${type}`;
        div.textContent = number;
        div.title = type === 'square' ? 'Perfect Square' : 
                   type === 'even' ? 'Even Number' : 
                   type === 'both' ? 'Perfect Square & Even' : 'Number';
        return div;
    };
    
    // Display perfect squares
    if (squares.length === 0) {
        squaresListEl.innerHTML = '<p class="empty-message">No perfect squares found in this range</p>';
    } else {
        squares.forEach(num => {
            const isEven = num % 2 === 0;
            const type = isEven ? 'both' : 'square';
            squaresListEl.appendChild(createNumberElement(num, type));
        });
    }
    
    // Display even numbers
    if (evens.length === 0) {
        evensListEl.innerHTML = '<p class="empty-message">No even numbers found in this range</p>';
    } else {
        evens.forEach(num => {
            const isSquare = Math.sqrt(num) === Math.floor(Math.sqrt(num));
            const type = isSquare ? 'both' : 'even';
            evensListEl.appendChild(createNumberElement(num, type));
        });
    }
    
    // Display all numbers
    if (allNumbers.length === 0) {
        allListEl.innerHTML = '<p class="empty-message">No numbers in this range</p>';
    } else {
        allNumbers.forEach(num => {
            const isSquare = Math.sqrt(num) === Math.floor(Math.sqrt(num));
            const isEven = num % 2 === 0;
            let type = '';
            
            if (isSquare && isEven) {
                type = 'both';
            } else if (isSquare) {
                type = 'square';
            } else if (isEven) {
                type = 'even';
            }
            
            allListEl.appendChild(createNumberElement(num, type));
        });
    }
}

// Update the chart visualization
function updateChart(squares, evens, allNumbers) {
    const ctx = document.getElementById('numbersChart').getContext('2d');
    
    // Destroy previous chart if exists
    if (numbersChart) {
        numbersChart.destroy();
    }
    
    const total = allNumbers.length;
    const squaresCount = squares.length;
    const evensCount = evens.length;
    const othersCount = total - squaresCount - evensCount + squares.filter(s => s % 2 === 0).length;
    
    numbersChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Perfect Squares', 'Even Numbers', 'Other Numbers'],
            datasets: [{
                data: [squaresCount, evensCount, othersCount],
                backgroundColor: [
                    'rgba(67, 97, 238, 0.8)',
                    'rgba(247, 37, 133, 0.8)',
                    'rgba(76, 201, 240, 0.4)'
                ],
                borderColor: [
                    'rgba(67, 97, 238, 1)',
                    'rgba(247, 37, 133, 1)',
                    'rgba(76, 201, 240, 1)'
                ],
                borderWidth: 2,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 14,
                            family: "'Poppins', sans-serif"
                        },
                        color: isDarkMode ? '#ffffff' : '#333333'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = context.raw;
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${context.label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });
}

// Tab switching function
function switchTab(tabName) {
    // Update active tab button
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });
    
    // Show active tab content
    tabContents.forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
}

// Clear all inputs and results
function clearAll() {
    startInput.value = '1';
    endInput.value = '100';
    
    totalNumbersEl.textContent = '0';
    squaresCountEl.textContent = '0';
    evensCountEl.textContent = '0';
    
    squaresListEl.innerHTML = '<p class="empty-message">Click "Calculate" to see perfect squares</p>';
    evensListEl.innerHTML = '<p class="empty-message">Click "Calculate" to see even numbers</p>';
    allListEl.innerHTML = '<p class="empty-message">Click "Calculate" to see all numbers</p>';
    
    if (numbersChart) {
        numbersChart.destroy();
        numbersChart = null;
    }
    
    // Reset to first tab
    switchTab('squares');
    
    // Focus on first input
    startInput.focus();
    
    // Show clear animation
    clearBtn.style.animation = 'pulse 0.5s ease';
    setTimeout(() => {
        clearBtn.style.animation = '';
    }, 500);
}

// Toggle dark/light theme
function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    
    // Update theme button
    const icon = themeBtn.querySelector('i');
    const text = themeBtn.querySelector('span') || document.createElement('span');
    
    if (isDarkMode) {
        icon.className = 'fas fa-sun';
        themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        themeBtn.classList.add('btn-warning');
        themeBtn.classList.remove('btn-accent');
    } else {
        icon.className = 'fas fa-moon';
        themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
        themeBtn.classList.add('btn-accent');
        themeBtn.classList.remove('btn-warning');
    }
    
    // Update chart colors if chart exists
    if (numbersChart) {
        numbersChart.options.plugins.legend.labels.color = isDarkMode ? '#ffffff' : '#333333';
        numbersChart.update();
    }
    
    // Store theme preference in localStorage
    localStorage.setItem('numberAnalyzerTheme', isDarkMode ? 'dark' : 'light');
}

// Show error message
function showError(message) {
    // Create error notification
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-notification';
    errorDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        <span>${message}</span>
        <button class="close-error">&times;</button>
    `;
    
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #f72585, #7209b7);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
        max-width: 400px;
    `;
    
    document.body.appendChild(errorDiv);
    
    // Close button event
    errorDiv.querySelector('.close-error').addEventListener('click', () => {
        errorDiv.remove();
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.style.opacity = '0';
            errorDiv.style.transform = 'translateX(100px)';
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 5000);
}

// Load saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('numberAnalyzerTheme');
    if (savedTheme === 'dark') {
        isDarkMode = true;
        document.body.classList.add('dark-mode');
        themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
        themeBtn.classList.add('btn-warning');
        themeBtn.classList.remove('btn-accent');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    init();
    
    // Add CSS for error notification
    const style = document.createElement('style');
    style.textContent = `
        .error-notification {
            font-family: 'Poppins', sans-serif;
            font-weight: 500;
        }
        
        .close-error {
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            margin-left: 10px;
            padding: 0 5px;
        }
        
        .close-error:hover {
            opacity: 0.8;
        }
        
        .btn-warning {
            background: linear-gradient(135deg, #ff9e00, #ff5400) !important;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});
