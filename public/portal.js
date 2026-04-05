// In a real application, you would fetch this data from a server
const appointments = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '123-456-7890',
        service: 'Lawn Mowing',
        date: '2024-07-20',
        time: '10:00 AM'
    },
    {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '098-765-4321',
        service: 'Tree Trimming',
        date: '2024-07-22',
        time: '2:00 PM'
    }
];

const tableBody = document.querySelector('.appointments-table tbody');

appointments.forEach(appointment => {
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${appointment.name}</td>
        <td>${appointment.email}</td>
        <td>${appointment.phone}</td>
        <td>${appointment.service}</td>
        <td>${appointment.date}</td>
        <td>${appointment.time}</td>
    `;

    tableBody.appendChild(row);
});