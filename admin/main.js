ocument.addEventListener('DOMContentLoaded', () => {
    
function openModal(modalId) {
    document.getElementById(modalId).style.display = "block";
    loadData(modalId);
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = "none";
}
async function fetchData(endpoint) {
    const response = await fetch(`http://localhost:3000/${endpoint}`);
    return response.json();
}
async function loadData(modalId) {
    let data, tableBody;
    switch (modalId) {
        case 'bestSellingDrugsModal':
            data = await fetchData('best-selling-drugs');
            tableBody = document.getElementById('bestSellingDrugsTable').querySelector('tbody');
            tableBody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.tradename}</td>
                    <td>K${row.price}</td>
                    <td>${row.sales}</td>
                    <td>K${row.income}</td>
                </tr>
            `).join('');
            break;
        case 'bestPharmaciesModal':
            data = await fetchData('best-pharmacies');
            tableBody = document.getElementById('bestPharmaciesTable').querySelector('tbody');
            tableBody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.name}</td>
                    <td>${row.ordercount}</td>
                    <td>${row.income}</td>
                </tr>
            `).join('');
            break;
        case 'doctorsModal':
            data = await fetchData('doctors');
            tableBody = document.getElementById('doctorsTable').querySelector('tbody');
            tableBody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.ssn}</td>
                    <td>${row.specialty}</td>
                    <td>${row.yearsofexperience}</td>
                    <td>${row.userid}</td>
                </tr>
            `).join('');
            break;
        case 'patientsModal':
            data = await fetchData('patients');
            tableBody = document.getElementById('patientsTable').querySelector('tbody');
            tableBody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.ssn}</td>
                    <td>${row.address}</td>
                    <td>${row.age}</td>
                    <td>${row.primaryphysicianssn}</td>
                    <td>${row.userid}</td>
                </tr>
            `).join('');
            break;
        case 'pharmaciesModal':
            data = await fetchData('pharmacies');
            tableBody = document.getElementById('pharmaciesTable').querySelector('tbody');
            tableBody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.name}</td>
                    <td>${row.address}</td>
                    <td>${row.phonenumber}</td>
                </tr>
            `).join('');
            break;
        case 'pharmaceuticalCompaniesModal':
            data = await fetchData('pharmaceutical-companies');
            tableBody = document.getElementById('pharmaceuticalCompaniesTable').querySelector('tbody');
            tableBody.innerHTML = data.map(row => `
                <tr>
                    <td>${row.name}</td>
                    <td>${row.phonenumber}</td>
                    <td>${row.registered_on}</td>
                </tr>
            `).join('');
            break;
        default:
            console.error(`Unknown modal ID: ${modalId}`);
    }
}
document.getElementById('add-doctor-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const ssn = document.getElementById('doctor-ssn').value;
    const specialty = document.getElementById('doctor-specialty').value;
    const yearsOfExperience = document.getElementById('doctor-years-of-experience').value;
    const userid = document.getElementById('doctor-userid').value;
    const data = await fetchData('add-doctor', { ssn, specialty, yearsOfExperience, userid });
    console.log(data);
});
document.getElementById('add-pharmacy-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('pharmacy-name').value;
    const address = document.getElementById('pharmacy-address').value;
    const phoneNumber = document.getElementById('pharmacy-phone-number').value;
    const data = await fetchData('add-pharmacy', { name, address, phoneNumber });
    console.log(data);
});
document.getElementById('add-pharmaceutical-company-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('company-name').value;
    const phoneNumber = document.getElementById('company-phone-number').value;
    const registeredOn = document.getElementById('company-registered-on').value;
    const data = await fetchData('add-pharmaceutical-company', { name, phoneNumber, registeredOn });
    console.log(data);
});
document.getElementById('add-drug-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const tradename = document.getElementById('drug-tradename').value;
    const price = document.getElementById('drug-price').value;
    const sales = document.getElementById('drug-sales').value;
    const data = await fetchData('add-drug', { tradename, price, sales });
    console.log(data);
});
})