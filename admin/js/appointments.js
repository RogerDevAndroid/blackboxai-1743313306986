// Get appointments from localStorage
function getAppointments() {
    return JSON.parse(localStorage.getItem('appointments')) || [];
}

// Save appointments to localStorage
function saveAppointments(appointments) {
    localStorage.setItem('appointments', JSON.stringify(appointments));
}

// Get patients from localStorage
function getPatients() {
    return JSON.parse(localStorage.getItem('patients')) || [];
}

// Modal Management
function showModal(modalId, appointmentId = null) {
    const modal = document.getElementById(modalId);
    const modalTitle = document.getElementById('modalTitle');
    const appointmentForm = document.getElementById('appointmentForm');
    
    if (modal) {
        modal.classList.remove('hidden');
        appointmentForm.reset();
        document.getElementById('appointmentId').value = '';
        populatePatientsDropdown();
        
        // Set min date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('appointmentDate').min = today;
        
        if (appointmentId) {
            // Edit mode
            const appointment = getAppointments().find(a => a.id === appointmentId);
            if (appointment) {
                modalTitle.textContent = 'Editar Cita';
                document.getElementById('appointmentId').value = appointment.id;
                document.getElementById('patientSelect').value = appointment.patientId;
                document.getElementById('appointmentDate').value = appointment.date;
                document.getElementById('appointmentTime').value = appointment.time;
                document.getElementById('serviceSelect').value = appointment.service;
                document.getElementById('appointmentNotes').value = appointment.notes || '';
            }
        } else {
            modalTitle.textContent = 'Nueva Cita';
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modalId);
            }
        });
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Populate patients dropdown
function populatePatientsDropdown() {
    const patientsSelect = document.getElementById('patientSelect');
    const patients = getPatients();
    
    patientsSelect.innerHTML = `
        <option value="">Seleccionar Paciente</option>
        ${patients.map(patient => `
            <option value="${patient.id}">${patient.name}</option>
        `).join('')}
    `;
}

// Form Submission
function handleAppointmentSubmit(event) {
    event.preventDefault();
    
    const appointmentId = document.getElementById('appointmentId').value;
    const formData = {
        id: appointmentId || Date.now().toString(),
        patientId: document.getElementById('patientSelect').value,
        date: document.getElementById('appointmentDate').value,
        time: document.getElementById('appointmentTime').value,
        service: document.getElementById('serviceSelect').value,
        notes: document.getElementById('appointmentNotes').value,
        status: appointmentId ? undefined : 'scheduled',
        createdAt: appointmentId ? undefined : new Date().toISOString()
    };

    const appointments = getAppointments();
    
    if (appointmentId) {
        const index = appointments.findIndex(a => a.id === appointmentId);
        if (index !== -1) {
            appointments[index] = { ...appointments[index], ...formData };
        }
    } else {
        appointments.push(formData);
    }

    saveAppointments(appointments);
    renderAppointmentsTable();
    hideModal('createAppointmentModal');
}

// Update appointment status
function updateAppointmentStatus(appointmentId, status) {
    const appointments = getAppointments();
    const index = appointments.findIndex(a => a.id === appointmentId);
    
    if (index !== -1) {
        appointments[index].status = status;
        saveAppointments(appointments);
        renderAppointmentsTable();
    }
}

// Delete appointment
function deleteAppointment(appointmentId) {
    if (confirm('¿Estás seguro de que deseas eliminar esta cita?')) {
        const appointments = getAppointments().filter(appointment => appointment.id !== appointmentId);
        saveAppointments(appointments);
        renderAppointmentsTable();
    }
}

// Filter appointments
function filterAppointments() {
    const dateFilter = document.getElementById('filterDate').value;
    const statusFilter = document.getElementById('filterStatus').value;
    renderAppointmentsTable(dateFilter, statusFilter);
}

// Get status badge class
function getStatusBadgeClass(status) {
    const classes = {
        scheduled: 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        cancelled: 'bg-red-100 text-red-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

// Get status display text
function getStatusDisplayText(status) {
    const texts = {
        scheduled: 'Programada',
        completed: 'Completada',
        cancelled: 'Cancelada'
    };
    return texts[status] || 'Desconocido';
}

// Render appointments table
function renderAppointmentsTable(dateFilter = '', statusFilter = '') {
    const tbody = document.getElementById('appointmentsTableBody');
    let appointments = getAppointments();
    const patients = getPatients();
    
    if (dateFilter) {
        appointments = appointments.filter(a => a.date === dateFilter);
    }
    if (statusFilter) {
        appointments = appointments.filter(a => a.status === statusFilter);
    }
    
    appointments.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
    });
    
    tbody.innerHTML = appointments.map(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" 
                                 src="https://ui-avatars.com/api/?name=${encodeURIComponent(patient?.name || 'Usuario')}&background=0D8ABC&color=fff" 
                                 alt="${patient?.name || 'Usuario'}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${patient?.name || 'Usuario no encontrado'}</div>
                            <div class="text-sm text-gray-500">${patient?.phone || ''}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${appointment.date}</div>
                    <div class="text-sm text-gray-500">${appointment.time}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${appointment.service}</div>
                    <div class="text-sm text-gray-500">${appointment.notes || ''}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(appointment.status)}">
                        ${getStatusDisplayText(appointment.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        ${appointment.status === 'scheduled' ? `
                            <button onclick="updateAppointmentStatus('${appointment.id}', 'completed')"
                                    class="text-green-600 hover:text-green-900">
                                <i class="fas fa-check"></i>
                            </button>
                            <button onclick="updateAppointmentStatus('${appointment.id}', 'cancelled')"
                                    class="text-red-600 hover:text-red-900">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                        <button onclick="showModal('createAppointmentModal', '${appointment.id}')"
                                class="text-indigo-600 hover:text-indigo-900">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteAppointment('${appointment.id}')"
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
    renderAppointmentsTable();
    
    // Add filter event listeners
    document.getElementById('filterDate').addEventListener('change', filterAppointments);
    document.getElementById('filterStatus').addEventListener('change', filterAppointments);
});