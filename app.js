document.addEventListener("DOMContentLoaded", function() {
    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"];
    const monthSelect = document.getElementById('month-select');
    const fullDateInput = document.getElementById('date');
    const yearInput = document.getElementById('year');
    const prevYearBtn = document.getElementById('prev-year');
    const nextYearBtn = document.getElementById('next-year');
    const calendarGrid = document.querySelector('.calendar-grid');

    function populateMonthSelect() {
        // Loop through month names and add them as options to the select element
        monthNames.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            monthSelect.appendChild(option);
        });
    }

    function initializeDateInput() {
        // Set today's date as default
        const today = new Date();
        monthSelect.value = today.getMonth();
        fullDateInput.value = today.toISOString().substring(0, 10);
        yearInput.value = today.getFullYear();
    }

    function updateFullDateInput() {
        // Update the full date input if you change the month or year
        const selectedMonth = parseInt(monthSelect.value) + 1; // +1 because months are 0-indexed in JS but not in ISO strings
        const selectedYear = parseInt(yearInput.value);
        const numDays = daysInMonth(selectedMonth - 1, selectedYear); // correct month index for function
        const currentDay = Math.min(parseInt(fullDateInput.value.substring(8, 10)), numDays); // correct month index for function
        fullDateInput.value = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
    }

    function daysInMonth(month, year) {
        // Get the number of days in a month
        // Month +1 to get the next month, then day 0 gives the last day of the current month
        return new Date(year, month + 1, 0).getDate(); 
    }

    async function fetchHolidays() {
        try {
            const response = await fetch('prazniki.txt');
            const data = await response.text();
            const holidays = {};
            data.split('\n').slice(1).forEach(line => {
                const [holiday, dateString, recurring] = line.split(',');
                let dateParts = dateString.split('-');
                if (recurring.trim() === '*') {
                    // Store recurring holidays without the year
                    holidays[dateParts[0] + '-' + dateParts[1]] = { name: holiday.trim(), recurring: true };
                } else {
                    // Store non-recurring holidays normally
                    holidays[dateParts.join('-')] = { name: holiday.trim(), recurring: false };
                }
            });
            //console.log('Holidays data:', holidays); // Debug log
            return holidays;
        } catch (error) {
            console.error('Failed to read holidays data:', error);
            return {};
        }
    }

    async function generateCalendar() {
        // Generate the calendar grid
        const selectedMonth = parseInt(monthSelect.value);
        const selectedYear = parseInt(yearInput.value);
        let startDay = new Date(selectedYear, selectedMonth).getDay();
        startDay = startDay === 0 ? 6 : startDay - 1; // .getDay() returns 1-7, 1 is Monday, we want 0-6, 0 is Monday
        const numDays = daysInMonth(selectedMonth, selectedYear);
        const holidays = await fetchHolidays(); // Fetch the holidays data

        calendarGrid.innerHTML = ""; // Clear the grid
        let divCounter = 1; // Counter for the divs, used to set the class of the last day of the week
        // Add empty cells for the days before the first day of the month
        for (let i = 0; i < startDay; i++) {
            calendarGrid.appendChild(document.createElement('div'));
            if (divCounter % 7 === 0) {
                // Give the div class named Sun if it's the last day of the week
                calendarGrid.lastChild.classList.add('Sun');
            }
            divCounter++;
        }
        // Add cells for the days of the month
        for (let day = 1; day <= numDays; day++) {
            const cell = document.createElement('div');
            cell.textContent = day;
            calendarGrid.appendChild(cell);

            const monthString = (selectedMonth + 1).toString().padStart(2, '0');
            const dayString = day.toString().padStart(2, '0');
            const currentDayRecurring = `${monthString}-${dayString}`; 
            const currentDayNonRecurring = `${selectedYear}-${monthString}-${dayString}`;

            if (holidays[currentDayRecurring] || holidays[currentDayNonRecurring]) {
                const holiday = holidays[currentDayRecurring] || holidays[currentDayNonRecurring];
                //console.log(`Holiday found: ${currentDayNonRecurring} - ${holiday.name}`); // Debug log
                cell.classList.add('Holiday');

                // add span element to div element
                const span = document.createElement('span');
                cell.appendChild(span);
                span.classList.add('popupText');
                span.classList.add('popupText', 'holidayPopup'); // Added a class for targeting
                span.textContent = holiday.name;

                cell.title = holiday.name;
            } 

            if (divCounter % 7 === 0) {
                // Give the div class named Sun if it's the last day of the week
                cell.classList.add('Sun');
            }
            divCounter++;
        }
        markSelectedDay();
    }

    function changeYear(delta) {
        // Change the year by delta, which can be -1 or 1 and is determined by the button clicked
        yearInput.value = parseInt(yearInput.value) + delta;
        updateFullDateInput();
        generateCalendar();
    }

    function markSelectedDay() {
        // Mark the selected day in the calendar grid
        const selectedDate = new Date(fullDateInput.value);
        const selectedDay = selectedDate.getDate();
        const selectedMonth = selectedDate.getMonth();
        const selectedYear = selectedDate.getFullYear();
        const days = calendarGrid.querySelectorAll('div');
        days.forEach(day => {
            if (day.textContent == selectedDay) {
                day.classList.add('selectedDay');
            } else {
                day.classList.remove('selectedDay');
            }
        });
    }

    // Event listeners
    calendarGrid.addEventListener('click', function(event) {
        // Check if the clicked element or its parent has a 'Holiday' class
        const holidayCell = event.target.closest('.Holiday');
        if (holidayCell) {
            const popout = holidayCell.querySelector('.holidayPopup');
            popout.classList.toggle('show');
        }
    });
    monthSelect.addEventListener('change', () => {
        updateFullDateInput();
        generateCalendar();
    });
    yearInput.addEventListener('change', () => {
        updateFullDateInput();
        generateCalendar();
    });
    prevYearBtn.addEventListener('click', () => changeYear(-1));
    nextYearBtn.addEventListener('click', () => changeYear(1));
    fullDateInput.addEventListener('change', () => {
        const date = new Date(fullDateInput.value);
        monthSelect.value = date.getMonth();
        yearInput.value = date.getFullYear();
        updateFullDateInput();
        generateCalendar();
    });

    // Initial setup
    populateMonthSelect();
    initializeDateInput();
    generateCalendar();
    markSelectedDay();
});