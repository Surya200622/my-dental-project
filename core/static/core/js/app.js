// [1] def variables 
let btnMenu = document.querySelector('#menu-btn'); 
let navbar = document.querySelector('.header .nav');
let header = document.querySelector('.header');

// [2] Add Event onClick on btnMenu 
btnMenu.onclick = () => { 
    // [2][1] Add fa-times class on btnMenu and active class on navbar 
    btnMenu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
};
// [3] Add Event onScroll on window 
window.onscroll = () => { 
    // [3][1] remove classes on btnMenu and navbar
    btnMenu.classList.remove('fa-times');
    navbar.classList.remove('active');

    //[3][2] check scrollY > 30 
    if (window.scrollY > 30) {
        header.classList.add('active')
    } else {
        header.classList.remove('active')
    }
};

// [4] Handle appointment form input interactions
const appointmentInputs = document.querySelectorAll('.appointment .field-group .box');

appointmentInputs.forEach(input => {
    // Add click and focus handlers
    input.addEventListener('focus', () => {
        // Remove active class from all field groups first
        document.querySelectorAll('.appointment .field-group').forEach(group => {
            group.classList.remove('active');
        });
        // Add active class to current field group
        input.parentElement.classList.add('active');
    });

    // Remove active class when clicking outside
    input.addEventListener('blur', () => {
        if (!input.value) {
            input.parentElement.classList.remove('active');
        }
    });
});

form.addEventListener('submit', e => {
  e.preventDefault();
  formMessage.textContent = "Submitting...";

  // Set submission timestamp
  document.getElementById('submittedDate').value = new Date().toLocaleString();

  const formData = new FormData(form);
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    number: formData.get('number'),
    appointmentDate: formData.get('date'),
    submittedDate: formData.get('submittedDate') // new line
  };
  
  fetch(scriptURL, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  })
  .then(response => {
    if (response.ok) {
      formMessage.textContent = "Appointment scheduled successfully!";
      formMessage.style.color = "green";
      form.reset();
    } else {
      throw new Error('Network response was not ok');
    }
  })
  .catch(error => {
    formMessage.textContent = "Error submitting form. Please try again.";
    formMessage.style.color = "red";
    console.error('Error!', error.message);
  });
});

function sendEmail() {
    const developerEmail = "cssurya2006@gmail.com"; // Replace with your email
    const name = document.getElementById('name').value;
    const number = document.getElementById('number').value;
    const message = document.getElementById('message').value;

    const subject = encodeURIComponent(`Message from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nNumber: ${number}\n\nMessage:\n${message}`);

    window.location.href = `mailto:${developerEmail}?subject=${subject}&body=${body}`;
}