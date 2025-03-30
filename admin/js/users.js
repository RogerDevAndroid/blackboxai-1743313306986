// Get roles from localStorage
function getRoles() {
    return JSON.parse(localStorage.getItem('roles')) || [];
}

// Get users from localStorage
function getUsers() {
    return JSON.parse(localStorage.getItem('users')) || [];
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Modal Management
function showModal(modalId, userId = null) {
    const modal = document.getElementById(modalId);
    const modalTitle = document.getElementById('modalTitle');
    const userForm = document.getElementById('userForm');
    
    if (modal) {
        modal.classList.remove('hidden');
        
        // Clear form
        userForm.reset();
        document.getElementById('userId').value = '';
        
        // Populate roles dropdown
        populateRolesDropdown();
        
        if (userId) {
            // Edit mode
            const user = getUsers().find(u => u.id === userId);
            if (user) {
                modalTitle.textContent = 'Editar Usuario';
                document.getElementById('userId').value = user.id;
                document.getElementById('userName').value = user.name;
                document.getElementById('userEmail').value = user.email;
                document.getElementById('userRole').value = user.roleId;
                document.getElementById('userStatus').value = user.status;
                // Don't populate password field for security
                document.getElementById('userPassword').required = false;
            }
        } else {
            // Create mode
            modalTitle.textContent = 'Crear Nuevo Usuario';
            document.getElementById('userPassword').required = true;
        }
        
        // Add event listener to close modal when clicking outside
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

// Populate roles dropdown
function populateRolesDropdown() {
    const rolesSelect = document.getElementById('userRole');
    const roles = getRoles();
    
    rolesSelect.innerHTML = `
        <option value="">Seleccionar Rol</option>
        ${roles.map(role => `
            <option value="${role.id}">${role.name}</option>
        `).join('')}
    `;
}

// Form Submission
function handleUserSubmit(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const formData = {
        id: userId || Date.now().toString(),
        name: document.getElementById('userName').value,
        email: document.getElementById('userEmail').value,
        roleId: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value,
        createdAt: userId ? undefined : new Date().toISOString()
    };

    // Only include password if it's provided (new user or password change)
    const password = document.getElementById('userPassword').value;
    if (password) {
        formData.password = password; // In a real app, this should be hashed
    }

    const users = getUsers();
    
    if (userId) {
        // Update existing user
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index] = { ...users[index], ...formData };
        }
    } else {
        // Create new user
        users.push(formData);
    }

    // Save to localStorage
    saveUsers(users);
    
    // Update table
    renderUsersTable();
    
    // Close modal
    hideModal('createUserModal');
}

// Delete user
function deleteUser(userId) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
        const users = getUsers().filter(user => user.id !== userId);
        saveUsers(users);
        renderUsersTable();
    }
}

// Toggle user status
function toggleUserStatus(userId) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex !== -1) {
        users[userIndex].status = users[userIndex].status === 'active' ? 'inactive' : 'active';
        saveUsers(users);
        renderUsersTable();
    }
}

// Render users table
function renderUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    const users = getUsers();
    const roles = getRoles();
    
    tbody.innerHTML = users.map(user => {
        const role = roles.find(r => r.id === user.roleId);
        return `
            <tr>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" src="https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff" alt="${user.name}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${user.name}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-900">${user.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        ${role ? role.name : 'Sin rol'}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <button onclick="toggleUserStatus('${user.id}')" 
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                            }">
                        ${user.status === 'active' ? 'Activo' : 'Inactivo'}
                    </button>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onclick="showModal('createUserModal', '${user.id}')" 
                            class="text-indigo-600 hover:text-indigo-900 mr-3">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="deleteUser('${user.id}')" 
                            class="text-red-600 hover:text-red-900">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    renderUsersTable();
});