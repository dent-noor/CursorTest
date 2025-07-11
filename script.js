// Dental Patient Management System
class DentalPatientManager {
    constructor() {
        this.patients = JSON.parse(localStorage.getItem('dentalPatients')) || [];
        this.currentPatientId = null;
        this.filteredPatients = [...this.patients];
        
        this.initializeEventListeners();
        this.renderPatients();
        this.updateStats();
        this.loadSampleData();
    }

    initializeEventListeners() {
        // Modal controls
        document.getElementById('addPatientBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('closeDetailsModal').addEventListener('click', () => this.closeDetailsModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());

        // Form submission
        document.getElementById('patientForm').addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Search and filter
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('statusFilter').addEventListener('change', (e) => this.handleFilter());
        document.getElementById('sortBy').addEventListener('change', (e) => this.handleSort());

        // Close modals on outside click
        document.getElementById('patientModal').addEventListener('click', (e) => {
            if (e.target.id === 'patientModal') this.closeModal();
        });
        document.getElementById('detailsModal').addEventListener('click', (e) => {
            if (e.target.id === 'detailsModal') this.closeDetailsModal();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                this.closeDetailsModal();
            }
        });
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getInitials(firstName, lastName) {
        return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    }

    formatDate(dateString) {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatPhone(phone) {
        if (!phone) return 'N/A';
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    }

    calculateAge(dateOfBirth) {
        if (!dateOfBirth) return 'N/A';
        const today = new Date();
        const birthDate = new Date(dateOfBirth);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    openModal(patientId = null) {
        const modal = document.getElementById('patientModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('patientForm');

        if (patientId) {
            // Edit mode
            this.currentPatientId = patientId;
            const patient = this.patients.find(p => p.id === patientId);
            if (patient) {
                modalTitle.textContent = 'Edit Patient';
                this.populateForm(patient);
            }
        } else {
            // Add mode
            this.currentPatientId = null;
            modalTitle.textContent = 'Add New Patient';
            form.reset();
        }

        modal.classList.add('active');
        document.getElementById('firstName').focus();
    }

    closeModal() {
        document.getElementById('patientModal').classList.remove('active');
        document.getElementById('patientForm').reset();
        this.currentPatientId = null;
    }

    closeDetailsModal() {
        document.getElementById('detailsModal').classList.remove('active');
    }

    populateForm(patient) {
        const form = document.getElementById('patientForm');
        form.firstName.value = patient.firstName;
        form.lastName.value = patient.lastName;
        form.dateOfBirth.value = patient.dateOfBirth;
        form.phone.value = patient.phone;
        form.email.value = patient.email || '';
        form.address.value = patient.address || '';
        form.medicalHistory.value = patient.medicalHistory || '';
        form.insuranceProvider.value = patient.insuranceProvider || '';
        form.insuranceNumber.value = patient.insuranceNumber || '';
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const patientData = {
            firstName: formData.get('firstName').trim(),
            lastName: formData.get('lastName').trim(),
            dateOfBirth: formData.get('dateOfBirth'),
            phone: formData.get('phone').trim(),
            email: formData.get('email').trim(),
            address: formData.get('address').trim(),
            medicalHistory: formData.get('medicalHistory').trim(),
            insuranceProvider: formData.get('insuranceProvider').trim(),
            insuranceNumber: formData.get('insuranceNumber').trim(),
            status: 'active',
            createdAt: new Date().toISOString(),
            lastVisit: null,
            nextAppointment: null
        };

        if (this.currentPatientId) {
            // Update existing patient
            const index = this.patients.findIndex(p => p.id === this.currentPatientId);
            if (index !== -1) {
                this.patients[index] = { ...this.patients[index], ...patientData };
                this.showToast('Patient updated successfully!', 'success');
            }
        } else {
            // Add new patient
            patientData.id = this.generateId();
            this.patients.push(patientData);
            this.showToast('Patient added successfully!', 'success');
        }

        this.saveToLocalStorage();
        this.renderPatients();
        this.updateStats();
        this.closeModal();
    }

    deletePatient(patientId) {
        if (confirm('Are you sure you want to delete this patient? This action cannot be undone.')) {
            this.patients = this.patients.filter(p => p.id !== patientId);
            this.saveToLocalStorage();
            this.renderPatients();
            this.updateStats();
            this.showToast('Patient deleted successfully!', 'success');
        }
    }

    viewPatientDetails(patientId) {
        const patient = this.patients.find(p => p.id === patientId);
        if (!patient) return;

        const detailsContent = document.getElementById('patientDetailsContent');
        detailsContent.innerHTML = this.generatePatientDetailsHTML(patient);
        
        document.getElementById('detailsModal').classList.add('active');
    }

    generatePatientDetailsHTML(patient) {
        const age = this.calculateAge(patient.dateOfBirth);
        const formattedPhone = this.formatPhone(patient.phone);
        const formattedLastVisit = this.formatDate(patient.lastVisit);
        const formattedNextAppointment = this.formatDate(patient.nextAppointment);

        return `
            <div class="detail-section">
                <h3>Personal Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Full Name</label>
                        <span>${patient.firstName} ${patient.lastName}</span>
                    </div>
                    <div class="detail-item">
                        <label>Date of Birth</label>
                        <span>${this.formatDate(patient.dateOfBirth)} (${age} years old)</span>
                    </div>
                    <div class="detail-item">
                        <label>Phone</label>
                        <span>${formattedPhone}</span>
                    </div>
                    <div class="detail-item">
                        <label>Email</label>
                        <span>${patient.email || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Address</label>
                        <span>${patient.address || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Status</label>
                        <span class="status-badge status-${patient.status}">
                            <i class="fas fa-${patient.status === 'active' ? 'check-circle' : 'times-circle'}"></i>
                            ${patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                        </span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Medical Information</h3>
                <div class="detail-grid">
                    <div class="detail-item full-width">
                        <label>Medical History</label>
                        <span>${patient.medicalHistory || 'No medical history recorded'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Insurance Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Insurance Provider</label>
                        <span>${patient.insuranceProvider || 'N/A'}</span>
                    </div>
                    <div class="detail-item">
                        <label>Insurance Number</label>
                        <span>${patient.insuranceNumber || 'N/A'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Appointment History</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Last Visit</label>
                        <span>${formattedLastVisit}</span>
                    </div>
                    <div class="detail-item">
                        <label>Next Appointment</label>
                        <span>${formattedNextAppointment}</span>
                    </div>
                    <div class="detail-item">
                        <label>Member Since</label>
                        <span>${this.formatDate(patient.createdAt)}</span>
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="patientManager.closeDetailsModal()">Close</button>
                <button class="btn btn-primary" onclick="patientManager.openModal('${patient.id}')">
                    <i class="fas fa-edit"></i> Edit Patient
                </button>
            </div>
        `;
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredPatients = [...this.patients];
        } else {
            this.filteredPatients = this.patients.filter(patient => 
                patient.firstName.toLowerCase().includes(searchTerm) ||
                patient.lastName.toLowerCase().includes(searchTerm) ||
                patient.phone.includes(searchTerm) ||
                (patient.email && patient.email.toLowerCase().includes(searchTerm))
            );
        }
        
        this.renderPatients();
    }

    handleFilter() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
        
        this.filteredPatients = this.patients.filter(patient => {
            const matchesSearch = !searchQuery || 
                patient.firstName.toLowerCase().includes(searchQuery) ||
                patient.lastName.toLowerCase().includes(searchQuery) ||
                patient.phone.includes(searchQuery) ||
                (patient.email && patient.email.toLowerCase().includes(searchQuery));
            
            const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
        
        this.renderPatients();
    }

    handleSort() {
        const sortBy = document.getElementById('sortBy').value;
        
        this.filteredPatients.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return (a.firstName + ' ' + a.lastName).localeCompare(b.firstName + ' ' + b.lastName);
                case 'date':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'lastVisit':
                    if (!a.lastVisit && !b.lastVisit) return 0;
                    if (!a.lastVisit) return 1;
                    if (!b.lastVisit) return -1;
                    return new Date(b.lastVisit) - new Date(a.lastVisit);
                default:
                    return 0;
            }
        });
        
        this.renderPatients();
    }

    renderPatients() {
        const tbody = document.getElementById('patientsTableBody');
        
        if (this.filteredPatients.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        <p>No patients found</p>
                        <button class="btn btn-primary" onclick="patientManager.openModal()" style="margin-top: 1rem;">
                            <i class="fas fa-plus"></i> Add Your First Patient
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredPatients.map(patient => {
            const initials = this.getInitials(patient.firstName, patient.lastName);
            const formattedPhone = this.formatPhone(patient.phone);
            const formattedLastVisit = this.formatDate(patient.lastVisit);
            const formattedNextAppointment = this.formatDate(patient.nextAppointment);

            return `
                <tr>
                    <td>
                        <div class="patient-info">
                            <div class="patient-avatar">${initials}</div>
                            <div class="patient-details">
                                <h4>${patient.firstName} ${patient.lastName}</h4>
                                <p>${this.calculateAge(patient.dateOfBirth)} years old</p>
                            </div>
                        </div>
                    </td>
                    <td>
                        <div class="contact-info">
                            <p><i class="fas fa-phone"></i> ${formattedPhone}</p>
                            ${patient.email ? `<p><i class="fas fa-envelope"></i> ${patient.email}</p>` : ''}
                        </div>
                    </td>
                    <td>${formattedLastVisit}</td>
                    <td>${formattedNextAppointment}</td>
                    <td>
                        <span class="status-badge status-${patient.status}">
                            <i class="fas fa-${patient.status === 'active' ? 'check-circle' : 'times-circle'}"></i>
                            ${patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="patientManager.viewPatientDetails('${patient.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="patientManager.openModal('${patient.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="patientManager.deletePatient('${patient.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateStats() {
        const totalPatients = this.patients.length;
        const activePatients = this.patients.filter(p => p.status === 'active').length;
        const today = new Date().toISOString().split('T')[0];
        const todayAppointments = this.patients.filter(p => p.nextAppointment === today).length;
        const pendingAppointments = this.patients.filter(p => p.nextAppointment && p.nextAppointment > today).length;
        
        // Simulate monthly revenue (in a real app, this would come from actual appointment data)
        const monthlyRevenue = totalPatients * 150; // Average $150 per patient

        document.getElementById('totalPatients').textContent = totalPatients;
        document.getElementById('todayAppointments').textContent = todayAppointments;
        document.getElementById('pendingAppointments').textContent = pendingAppointments;
        document.getElementById('monthlyRevenue').textContent = `$${monthlyRevenue.toLocaleString()}`;
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        const toastMessage = document.querySelector('.toast-message');
        const toastIcon = document.querySelector('.toast-icon');

        toast.className = `toast ${type}`;
        toastMessage.textContent = message;
        
        const iconMap = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle'
        };
        
        toastIcon.className = `toast-icon ${iconMap[type]}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    saveToLocalStorage() {
        localStorage.setItem('dentalPatients', JSON.stringify(this.patients));
    }

    loadSampleData() {
        if (this.patients.length === 0) {
            const samplePatients = [
                {
                    id: this.generateId(),
                    firstName: 'John',
                    lastName: 'Smith',
                    dateOfBirth: '1985-03-15',
                    phone: '555-0123',
                    email: 'john.smith@email.com',
                    address: '123 Main St, Anytown, CA 90210',
                    medicalHistory: 'No known allergies. Regular dental checkups.',
                    insuranceProvider: 'Blue Cross Blue Shield',
                    insuranceNumber: 'BCBS123456789',
                    status: 'active',
                    createdAt: '2024-01-15T10:30:00.000Z',
                    lastVisit: '2024-02-15',
                    nextAppointment: '2024-05-15'
                },
                {
                    id: this.generateId(),
                    firstName: 'Sarah',
                    lastName: 'Johnson',
                    dateOfBirth: '1992-07-22',
                    phone: '555-0456',
                    email: 'sarah.j@email.com',
                    address: '456 Oak Ave, Somewhere, CA 90211',
                    medicalHistory: 'Sensitive to cold temperatures. Prefers warm water for cleaning.',
                    insuranceProvider: 'Aetna',
                    insuranceNumber: 'AET789012345',
                    status: 'active',
                    createdAt: '2024-01-20T14:15:00.000Z',
                    lastVisit: '2024-03-01',
                    nextAppointment: '2024-06-01'
                },
                {
                    id: this.generateId(),
                    firstName: 'Michael',
                    lastName: 'Davis',
                    dateOfBirth: '1978-11-08',
                    phone: '555-0789',
                    email: 'michael.davis@email.com',
                    address: '789 Pine Rd, Elsewhere, CA 90212',
                    medicalHistory: 'History of gum disease. Requires regular deep cleaning.',
                    insuranceProvider: 'Cigna',
                    insuranceNumber: 'CIG456789012',
                    status: 'active',
                    createdAt: '2024-02-01T09:45:00.000Z',
                    lastVisit: '2024-03-20',
                    nextAppointment: '2024-04-20'
                }
            ];

            this.patients = samplePatients;
            this.filteredPatients = [...this.patients];
            this.saveToLocalStorage();
            this.renderPatients();
            this.updateStats();
        }
    }
}

// Initialize the application
const patientManager = new DentalPatientManager(); 