// Get patients from localStorage
function getPatients() {
    return JSON.parse(localStorage.getItem('patients')) || [];
}

// Save patients to localStorage
function savePatients(patients) {
    localStorage.setItem('patients', JSON.stringify(patients));
}

// Get appointments from localStorage
function getAppointments() {
    return JSON.parse(localStorage.getItem('appointments')) || [];
}

// Modal Management
function showModal(modalId, patientId = null) {
    const modal = document.getElementById(modalId);
    const modalTitle = document.getElementById('modalTitle');
    const patientForm = document.getElementById('patientForm');
    
    if (modal) {
        modal.classList.remove('hidden');
        patientForm.reset();
        document.getElementById('patientId').value = '';
        
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('patientBirthdate').max = today;
        
        if (patientId) {
            const patient = getPatients().find(p => p.id === patientId);
            if (patient) {
                modalTitle.textContent = 'Editar Paciente';
                document.getElementById('patientId').value = patient.id;
                document.getElementById('patientName').value = patient.name;
                document.getElementById('patientEmail').value = patient.email;
                document.getElementById('patientPhone').value = patient.phone;
                document.getElementById('patientBirthdate').value = patient.birthdate;
                document.getElementById('patientNotes').value = patient.notes || '';
            }
        } else {
            modalTitle.textContent = 'Nuevo Paciente';
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Form Submission
function handlePatientSubmit(event) {
    event.preventDefault();
    
    const patientId = document.getElementById('patientId').value;
    const formData = {
        id: patientId || Date.now().toString(),
        name: document.getElementById('patientName').value,
        email: document.getElementById('patientEmail').value,
        phone: document.getElementById('patientPhone').value,
        birthdate: document.getElementById('patientBirthdate').value,
        notes: document.getElementById('patientNotes').value,
        createdAt: patientId ? undefined : new Date().toISOString()
    };

    const patients = getPatients();
    
    if (patientId) {
        const index = patients.findIndex(p => p.id === patientId);
        if (index !== -1) {
            patients[index] = { ...patients[index], ...formData };
        }
    } else {
        patients.push(formData);
    }

    savePatients(patients);
    renderPatientsTable();
    hideModal('createPatientModal');
}

// Delete patient
function deletePatient(patientId) {
    if (confirm('¿Estás seguro de que deseas eliminar este paciente?')) {
        const patients = getPatients().filter(patient => patient.id !== patientId);
        savePatients(patients);
        renderPatientsTable();
    }
}

// Helper functions
function getLastAppointment(patientId) {
    const appointments = getAppointments()
        .filter(a => a.patientId === patientId)
        .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`));
    return appointments[0];
}

function getAppointmentCount(patientId) {
    return getAppointments().filter(a => a.patientId === patientId).length;
}

function calculateAge(birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Render patients table
function renderPatientsTable(searchQuery = '') {
    const tbody = document.getElementById('patientsTableBody');
    let patients = getPatients();
    
    if (searchQuery) {
        searchQuery = searchQuery.toLowerCase();
        patients = patients.filter(patient => 
            patient.name.toLowerCase().includes(searchQuery) ||
            patient.email.toLowerCase().includes(searchQuery) ||
            patient.phone.includes(searchQuery)
        );
    }
    
    tbody.innerHTML = patients.map(patient => {
        const lastAppointment = getLastAppointment(patient.id);
        const appointmentCount = getAppointmentCount(patient.id);
        const age = calculateAge(patient.birthdate);
        
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" 
                                 src="https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=0D8ABC&color=fff" 
                                 alt="${patient.name}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${patient.name}</div>
                            <div class="text-sm text-gray-500">${age} años</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${patient.email}</div>
                    <div class="text-sm text-gray-500">${patient.phone}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${appointmentCount} citas</div>
                    <div class="text-sm text-gray-500">${patient.notes ? 'Con notas médicas' : 'Sin notas'}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">
                        ${lastAppointment ? formatDate(lastAppointment.date) : 'Sin citas'}
                    </div>
                    <div class="text-sm text-gray-500">
                        ${lastAppointment ? lastAppointment.service : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="showModal('createPatientModal', '${patient.id}')"
                                class="text-indigo-600 hover:text-indigo-900">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deletePatient('${patient.id}')"
                                class="text-red-600 hover:text-red-900">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    renderPatientsTable();
    
    const searchInput = document.getElementById('searchPatient');
    searchInput.addEventListener('input', (e) => renderPatientsTable(e.target.value));
});