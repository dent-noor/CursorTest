# DentalCare Pro - Patient Management System

A modern, responsive web application for dental practice patient management built with HTML, CSS, and JavaScript.

## 🦷 Features

### Patient Management
- **Add New Patients**: Complete patient registration with personal, medical, and insurance information
- **Edit Patients**: Update patient information at any time
- **View Patient Details**: Comprehensive patient profile view with all information
- **Delete Patients**: Remove patients with confirmation dialog
- **Patient Search**: Search by name, phone number, or email
- **Status Filtering**: Filter patients by active/inactive status
- **Sorting Options**: Sort by name, registration date, or last visit date

### Dashboard & Analytics
- **Real-time Statistics**: Total patients, today's appointments, pending appointments, and monthly revenue
- **Interactive Cards**: Hover effects and visual feedback
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices

### User Experience
- **Modern UI**: Clean, professional design with smooth animations
- **Toast Notifications**: Success, error, and warning messages
- **Modal Dialogs**: Intuitive forms and detailed views
- **Keyboard Shortcuts**: ESC key to close modals
- **Local Storage**: Data persists between browser sessions
- **Sample Data**: Pre-loaded with example patients for demonstration

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- No additional software installation required

### Installation
1. Download or clone the repository
2. Open `index.html` in your web browser
3. Start managing your dental patients!

### File Structure
```
dental-patient-system/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and responsive design
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## 📱 Usage

### Adding a New Patient
1. Click the "Add Patient" button in the header
2. Fill out the patient information form
3. Required fields: First Name, Last Name, Date of Birth, Phone Number
4. Optional fields: Email, Address, Medical History, Insurance Information
5. Click "Save Patient" to add the patient

### Managing Patients
- **View Details**: Click the eye icon to see complete patient information
- **Edit Patient**: Click the edit icon to modify patient data
- **Delete Patient**: Click the trash icon to remove a patient (with confirmation)
- **Search**: Use the search bar to find patients by name, phone, or email
- **Filter**: Use the status dropdown to filter active/inactive patients
- **Sort**: Use the sort dropdown to organize patients by different criteria

### Patient Information
Each patient record includes:
- **Personal Information**: Name, date of birth, age calculation
- **Contact Details**: Phone number, email, address
- **Medical History**: Allergies, conditions, preferences
- **Insurance Information**: Provider and policy number
- **Appointment History**: Last visit and next appointment dates
- **Status**: Active or inactive patient status

## 🎨 Design Features

### Modern UI Elements
- **CSS Grid & Flexbox**: Responsive layouts that adapt to any screen size
- **CSS Custom Properties**: Consistent theming with easy customization
- **Smooth Animations**: Hover effects, modal transitions, and toast notifications
- **Professional Color Scheme**: Medical/dental industry appropriate colors
- **Typography**: Inter font family for excellent readability

### Responsive Design
- **Mobile-First**: Optimized for mobile devices
- **Tablet Support**: Perfect layout on tablet screens
- **Desktop Experience**: Full-featured interface on larger screens
- **Touch-Friendly**: Large touch targets for mobile users

## 💾 Data Storage

The application uses **localStorage** to persist patient data between browser sessions. This means:
- Data is stored locally in your browser
- No server or database required
- Data persists until browser data is cleared
- Works offline

## 🔧 Customization

### Colors
Modify the CSS custom properties in `styles.css` to change the color scheme:

```css
:root {
    --primary-color: #2563eb;      /* Main brand color */
    --secondary-color: #64748b;    /* Secondary actions */
    --success-color: #10b981;      /* Success states */
    --warning-color: #f59e0b;      /* Warning states */
    --danger-color: #ef4444;       /* Error states */
    /* ... more variables */
}
```

### Features
The JavaScript code is modular and well-commented, making it easy to:
- Add new patient fields
- Modify validation rules
- Add new sorting options
- Implement additional features

## 🛠️ Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you have any questions or need help with the application, please open an issue in the repository.

---

**Built with ❤️ for dental professionals** 