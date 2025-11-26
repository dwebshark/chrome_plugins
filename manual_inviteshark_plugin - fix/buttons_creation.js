function createButtons() {
    // Get the existing div
    var existingDiv = document.getElementById('global-nav');

    // Create a new div for the buttons
    var buttonsDiv = document.createElement('div');
    buttonsDiv.style.display = 'flex';
    buttonsDiv.style.justifyContent = 'space-between'; // To distribute space evenly
    buttonsDiv.style.height = '50px'

    // Create the buttons
    var button1 = document.createElement('button');
    button1.textContent = 'Start';
    button1.style.backgroundColor = '#008000';
    button1.style.flex = '1';

    var button2 = document.createElement('button');
    button2.textContent = 'Uitgenodigd';
    button2.style.backgroundColor = '#0000FF';
    button2.style.flex = '1';

    var button3 = document.createElement('button');
    button3.textContent = 'Skip';
    button3.style.backgroundColor = '#808080';
    button3.style.flex = '1';

    // Append the buttons to the new div
    buttonsDiv.appendChild(button1);
    buttonsDiv.appendChild(button2);
    buttonsDiv.appendChild(button3);

    // Append the new div to the existing div
    existingDiv.appendChild(buttonsDiv);
}

// Call the function to create and append the buttons
createButtons();