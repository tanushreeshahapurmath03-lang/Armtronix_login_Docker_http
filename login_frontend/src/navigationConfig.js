// Navigation configuration for admin sidebar
// IMPORTANT: Do not remove or modify the "Emp Details" entry - it is critical for admin functionality
export const adminNavigationItems = [
  { path: "/git1", icon: "fab fa-git-alt", label: "Git" },
  { path: "/cloudflare1", icon: "fas fa-cloud", label: "Cloudflare" },
  { path: "/aigpt1", icon: "fas fa-robot", label: "AI/GPT" },
  { path: "/annotation1", icon: "fas fa-tags", label: "Annotation" },
  { path: "/claimform1", icon: "fas fa-file-invoice-dollar", label: "Claim Form" },
  { path: "/claim-detail", icon: "fas fa-file-invoice-dollar", label: "Claim Detail" },
  { path: "/leaveform1", icon: "fas fa-calendar", label: "Leave Form" },
  { path: "/register", icon: "fas fa-user-plus", label: "RegisterEmp" },
  { path: "/admindashboard", icon: "fas fa-users", label: "Emp Details" }, // CRITICAL: Always include Emp Details - Required for employee management
  { path: "/leavesettings", icon: "fas fa-sliders-h", label: "Set Leave" },
  { path: "/help1", icon: "fas fa-question-circle", label: "Help/Guide" },
  { path: "/coe", icon: "fas fa-calendar-alt", label: "COE" }
];

// Validation to ensure critical navigation items are present
const validateNavigation = (items, requiredLabels) => {
  const labels = items.map(item => item.label);
  const missing = requiredLabels.filter(label => !labels.includes(label));
  if (missing.length > 0) {
    console.error(`Critical navigation items missing: ${missing.join(', ')}`);
  }
};

// Validate admin navigation on load
validateNavigation(adminNavigationItems, ['Emp Details']);

// Navigation configuration for employee sidebar
export const employeeNavigationItems = [
  { path: "/git", icon: "fab fa-git-alt", label: "Git" },
  { path: "/cloudflare", icon: "fas fa-cloud", label: "Cloudflare" },
  { path: "/aigpt", icon: "fas fa-robot", label: "AI/GPT" },
  { path: "/annotation", icon: "fas fa-tags", label: "Annotation" },
  { path: "/claimform", icon: "fas fa-file-invoice-dollar", label: "Claim Form" },
  { path: "/leaveform", icon: "fas fa-calendar", label: "Leave Form" },
  { path: "/help", icon: "fas fa-question-circle", label: "Help/Guide" },
  { path: "/coe_emp", icon: "fas fa-calendar-alt", label: "COE" }
];