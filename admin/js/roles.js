// Modal Management
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
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

// Permission Management
function toggleModuleAccess(moduleId, checked) {
    const permissionInputs = document.querySelectorAll(`#${moduleId} input[type="checkbox"]`);
    permissionInputs.forEach(input => {
        input.disabled = !checked;
        if (!checked) {
            input.checked = false;
        }
    });
}

// Form Submission
function handleRoleSubmit(event) {
    event.preventDefault();
    
    // Collect form data
    const formData = {
        name: document.getElementById('roleName').value,
        description: document.getElementById('roleDescription').value,
        permissions: {}
    };

    // Collect permissions
    const modules = ['dashboard', 'users', 'appointments', 'patients', 'sales', 'inventory'];
    modules.forEach(module => {
        const moduleAccess = document.querySelector(`#${module}Module input[name="${module}Access"]`);
        if (moduleAccess && moduleAccess.checked) {
            formData.permissions[module] = {
                access: true,
                create: document.querySelector(`#${module}Module input[name="${module}Create"]`)?.checked || false,
                edit: document.querySelector(`#${module}Module input[name="${module}Edit"]`)?.checked || false,
                delete: document.querySelector(`#${module}Module input[name="${module}Delete"]`)?.checked || false,
                view: document.querySelector(`#${module}Module input[name="${module}View"]`)?.checked || false
            };
        }
    });

    // Here you would typically send this data to your backend
    console.log('Role Data:', formData);
    
    // Close the modal
    hideModal('createRoleModal');
}

// Initialize event listeners when the document loads
document.addEventListener('DOMContentLoaded', () => {
    // Add form submit handler
    const roleForm = document.getElementById('roleForm');
    if (roleForm) {
        roleForm.addEventListener('submit', handleRoleSubmit);
    }

    // Add module access toggle handlers
    const moduleToggles = document.querySelectorAll('.module-access-toggle');
    moduleToggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const moduleId = e.target.getAttribute('data-module');
            toggleModuleAccess(moduleId, e.target.checked);
        });
    });
});