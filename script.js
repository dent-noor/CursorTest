// Dental Visit Records Management System
class DentalVisitManager {
    constructor() {
        this.visits = JSON.parse(localStorage.getItem('dentalVisits')) || [];
        this.currentVisitId = null;
        this.filteredVisits = [...this.visits];
        
        this.initializeEventListeners();
        this.renderVisits();
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

        // Price calculation
        document.getElementById('price').addEventListener('input', () => this.calculateFinalPrice());
        document.getElementById('discount').addEventListener('input', () => this.calculateFinalPrice());

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

    calculateFinalPrice() {
        const price = parseFloat(document.getElementById('price').value) || 0;
        const discount = parseFloat(document.getElementById('discount').value) || 0;
        const finalPrice = Math.max(0, price - discount);
        document.getElementById('finalPrice').value = finalPrice.toFixed(2);
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
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

    openModal(visitId = null) {
        const modal = document.getElementById('patientModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('patientForm');

        if (visitId) {
            // Edit mode
            this.currentVisitId = visitId;
            const visit = this.visits.find(v => v.id === visitId);
            if (visit) {
                modalTitle.textContent = 'Edit Visit Record';
                this.populateForm(visit);
            }
        } else {
            // Add mode
            this.currentVisitId = null;
            modalTitle.textContent = 'Add New Visit Record';
            form.reset();
            // Set today's date as default
            document.getElementById('visitDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('discount').value = '0';
            document.getElementById('finalPrice').value = '0.00';
        }

        modal.classList.add('active');
        document.getElementById('visitDate').focus();
    }

    closeModal() {
        document.getElementById('patientModal').classList.remove('active');
        document.getElementById('patientForm').reset();
        this.currentVisitId = null;
    }

    closeDetailsModal() {
        document.getElementById('detailsModal').classList.remove('active');
    }

    populateForm(visit) {
        const form = document.getElementById('patientForm');
        form.visitDate.value = visit.visitDate;
        form.patientName.value = visit.patientName;
        form.fileNumber.value = visit.fileNumber;
        form.patientType.value = visit.patientType;
        form.procedure.value = visit.procedure;
        form.price.value = visit.price;
        form.discount.value = visit.discount || '0';
        form.finalPrice.value = visit.finalPrice;
        form.notes.value = visit.notes || '';
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const visitData = {
            visitDate: formData.get('visitDate'),
            patientName: formData.get('patientName').trim(),
            fileNumber: formData.get('fileNumber').trim(),
            patientType: formData.get('patientType'),
            procedure: formData.get('procedure').trim(),
            price: parseFloat(formData.get('price')),
            discount: parseFloat(formData.get('discount')) || 0,
            finalPrice: parseFloat(formData.get('finalPrice')),
            notes: formData.get('notes').trim(),
            createdAt: new Date().toISOString()
        };

        if (this.currentVisitId) {
            // Update existing visit
            const index = this.visits.findIndex(v => v.id === this.currentVisitId);
            if (index !== -1) {
                this.visits[index] = { ...this.visits[index], ...visitData };
                this.showToast('Visit record updated successfully!', 'success');
            }
        } else {
            // Add new visit
            visitData.id = this.generateId();
            this.visits.push(visitData);
            this.showToast('Visit record added successfully!', 'success');
        }

        this.saveToLocalStorage();
        this.renderVisits();
        this.updateStats();
        this.closeModal();
    }

    deleteVisit(visitId) {
        if (confirm('Are you sure you want to delete this visit record? This action cannot be undone.')) {
            this.visits = this.visits.filter(v => v.id !== visitId);
            this.saveToLocalStorage();
            this.renderVisits();
            this.updateStats();
            this.showToast('Visit record deleted successfully!', 'success');
        }
    }

    viewVisitDetails(visitId) {
        const visit = this.visits.find(v => v.id === visitId);
        if (!visit) return;

        const detailsContent = document.getElementById('patientDetailsContent');
        detailsContent.innerHTML = this.generateVisitDetailsHTML(visit);
        
        document.getElementById('detailsModal').classList.add('active');
    }

    generateVisitDetailsHTML(visit) {
        const formattedVisitDate = this.formatDate(visit.visitDate);
        const formattedPrice = this.formatCurrency(visit.price);
        const formattedDiscount = this.formatCurrency(visit.discount);
        const formattedFinalPrice = this.formatCurrency(visit.finalPrice);

        return `
            <div class="detail-section">
                <h3>Visit Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Visit Date</label>
                        <span>${formattedVisitDate}</span>
                    </div>
                    <div class="detail-item">
                        <label>Patient Name</label>
                        <span>${visit.patientName}</span>
                    </div>
                    <div class="detail-item">
                        <label>File Number</label>
                        <span>${visit.fileNumber}</span>
                    </div>
                    <div class="detail-item">
                        <label>Patient Type</label>
                        <span class="status-badge status-${visit.patientType}">
                            <i class="fas fa-${visit.patientType === 'cash' ? 'money-bill' : 'shield-alt'}"></i>
                            ${visit.patientType.charAt(0).toUpperCase() + visit.patientType.slice(1)}
                        </span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Treatment Details</h3>
                <div class="detail-grid">
                    <div class="detail-item full-width">
                        <label>Procedure</label>
                        <span>${visit.procedure}</span>
                    </div>
                    <div class="detail-item full-width">
                        <label>Notes/Remarks</label>
                        <span>${visit.notes || 'No notes recorded'}</span>
                    </div>
                </div>
            </div>

            <div class="detail-section">
                <h3>Financial Information</h3>
                <div class="detail-grid">
                    <div class="detail-item">
                        <label>Original Price</label>
                        <span>${formattedPrice}</span>
                    </div>
                    <div class="detail-item">
                        <label>Discount</label>
                        <span>${formattedDiscount}</span>
                    </div>
                    <div class="detail-item">
                        <label>Final Price</label>
                        <span style="font-weight: 700; color: var(--primary-color);">${formattedFinalPrice}</span>
                    </div>
                    <div class="detail-item">
                        <label>Record Created</label>
                        <span>${this.formatDate(visit.createdAt)}</span>
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button class="btn btn-secondary" onclick="visitManager.closeDetailsModal()">Close</button>
                <button class="btn btn-primary" onclick="visitManager.openModal('${visit.id}')">
                    <i class="fas fa-edit"></i> Edit Visit Record
                </button>
            </div>
        `;
    }

    handleSearch(query) {
        const searchTerm = query.toLowerCase().trim();
        
        if (!searchTerm) {
            this.filteredVisits = [...this.visits];
        } else {
            this.filteredVisits = this.visits.filter(visit => 
                visit.patientName.toLowerCase().includes(searchTerm) ||
                visit.fileNumber.toLowerCase().includes(searchTerm) ||
                visit.procedure.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderVisits();
    }

    handleFilter() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
        
        this.filteredVisits = this.visits.filter(visit => {
            const matchesSearch = !searchQuery || 
                visit.patientName.toLowerCase().includes(searchQuery) ||
                visit.fileNumber.toLowerCase().includes(searchQuery) ||
                visit.procedure.toLowerCase().includes(searchQuery);
            
            const matchesStatus = statusFilter === 'all' || visit.patientType === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
        
        this.renderVisits();
    }

    handleSort() {
        const sortBy = document.getElementById('sortBy').value;
        
        this.filteredVisits.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.patientName.localeCompare(b.patientName);
                case 'date':
                    return new Date(b.visitDate) - new Date(a.visitDate);
                case 'lastVisit':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                default:
                    return 0;
            }
        });
        
        this.renderVisits();
    }

    renderVisits() {
        const tbody = document.getElementById('patientsTableBody');
        
        if (this.filteredVisits.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem; color: var(--text-secondary);">
                        <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                        <p>No visit records found</p>
                        <button class="btn btn-primary" onclick="visitManager.openModal()" style="margin-top: 1rem;">
                            <i class="fas fa-plus"></i> Add Your First Visit Record
                        </button>
                    </td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = this.filteredVisits.map(visit => {
            const formattedVisitDate = this.formatDate(visit.visitDate);
            const formattedFinalPrice = this.formatCurrency(visit.finalPrice);

            return `
                <tr>
                    <td>${formattedVisitDate}</td>
                    <td>
                        <div class="patient-details">
                            <h4>${visit.patientName}</h4>
                        </div>
                    </td>
                    <td>${visit.fileNumber}</td>
                    <td>
                        <span class="status-badge status-${visit.patientType}">
                            <i class="fas fa-${visit.patientType === 'cash' ? 'money-bill' : 'shield-alt'}"></i>
                            ${visit.patientType.charAt(0).toUpperCase() + visit.patientType.slice(1)}
                        </span>
                    </td>
                    <td>${visit.procedure}</td>
                    <td style="font-weight: 600; color: var(--primary-color);">${formattedFinalPrice}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn btn-sm btn-primary" onclick="visitManager.viewVisitDetails('${visit.id}')" title="View Details">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-secondary" onclick="visitManager.openModal('${visit.id}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="visitManager.deleteVisit('${visit.id}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    updateStats() {
        const totalVisits = this.visits.length;
        const today = new Date().toISOString().split('T')[0];
        const todayVisits = this.visits.filter(v => v.visitDate === today).length;
        const cashPatients = this.visits.filter(v => v.patientType === 'cash').length;
        const insurancePatients = this.visits.filter(v => v.patientType === 'insurance').length;
        
        // Calculate total revenue
        const totalRevenue = this.visits.reduce((sum, visit) => sum + visit.finalPrice, 0);

        document.getElementById('totalPatients').textContent = totalVisits;
        document.getElementById('todayAppointments').textContent = todayVisits;
        document.getElementById('pendingAppointments').textContent = cashPatients;
        document.getElementById('monthlyRevenue').textContent = this.formatCurrency(totalRevenue);
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
        localStorage.setItem('dentalVisits', JSON.stringify(this.visits));
    }

    loadSampleData() {
        if (this.visits.length === 0) {
            const sampleVisits = [
                {
                    id: this.generateId(),
                    visitDate: '2024-01-15',
                    patientName: 'John Smith',
                    fileNumber: 'P001',
                    patientType: 'cash',
                    procedure: 'Dental Cleaning',
                    price: 150.00,
                    discount: 0.00,
                    finalPrice: 150.00,
                    notes: 'Regular cleaning, no issues found.',
                    createdAt: '2024-01-15T10:30:00.000Z'
                },
                {
                    id: this.generateId(),
                    visitDate: '2024-01-20',
                    patientName: 'Sarah Johnson',
                    fileNumber: 'P002',
                    patientType: 'insurance',
                    procedure: 'Root Canal Treatment',
                    price: 1200.00,
                    discount: 100.00,
                    finalPrice: 1100.00,
                    notes: 'Patient experienced sensitivity. Root canal completed successfully.',
                    createdAt: '2024-01-20T14:15:00.000Z'
                },
                {
                    id: this.generateId(),
                    visitDate: '2024-02-01',
                    patientName: 'Michael Davis',
                    fileNumber: 'P003',
                    patientType: 'cash',
                    procedure: 'Tooth Extraction',
                    price: 300.00,
                    discount: 50.00,
                    finalPrice: 250.00,
                    notes: 'Wisdom tooth extraction. Patient recovered well.',
                    createdAt: '2024-02-01T09:45:00.000Z'
                }
            ];

            this.visits = sampleVisits;
            this.filteredVisits = [...this.visits];
            this.saveToLocalStorage();
            this.renderVisits();
            this.updateStats();
        }
    }
}

// Initialize the application
const visitManager = new DentalVisitManager(); 