import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Icon from '../components/Icon';
import DashboardShell from '../features/shared/components/DashboardShell';
import './UserProfile.css';

export default function UserProfile() {
  const { user, company, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const buildProfileFormData = (sourceUser = {}) => {
    const profile = sourceUser.profile || {};
    return {
      first_name: profile.first_name || '',
      middle_name: profile.middle_name || '',
      last_name: profile.last_name || '',
      full_name: profile.full_name || '',
      email: sourceUser.email || profile.personal_email || '',
      phone: sourceUser.phone || profile.personal_phone || '',
      personal_email: profile.personal_email || sourceUser.email || '',
      personal_phone: profile.personal_phone || sourceUser.phone || '',
      gender: profile.gender || '',
      dob: profile.dob || '',
      photo_url: profile.photo_url || '',
      employee_code: sourceUser.employee_code || profile.employee_code || '',
      department: sourceUser.department || profile.department || 'Not assigned',
      designation: sourceUser.designation || profile.designation || 'Not assigned',
      joining_date: sourceUser.joining_date || profile.joining_date || 'Not available',
      reporting_manager: sourceUser.reporting_manager || profile.reporting_manager || 'Not assigned',
      location: sourceUser.location || profile.location || 'Not specified',
      address_line1: profile.address_line1 || '',
      address_line2: profile.address_line2 || '',
      city: profile.city || '',
      state: profile.state || '',
      country: profile.country || '',
      postal_code: profile.postal_code || '',
    };
  };

  // Initialize form data from user profile
  useEffect(() => {
    setFormData(buildProfileFormData(user || {}));
  }, [user]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real implementation, this would call an API to update profile
    console.log('Profile update submitted:', formData);
    setIsEditing(false);
    // Show success message
    alert('Profile updated successfully!');
  };

  // Calculate user initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const words = name.split(' ').filter(word => word.length > 0);
    if (words.length === 0) return 'U';
    
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }
    
    const firstLetter = words[0][0].toUpperCase();
    const lastLetter = words[words.length - 1][0].toUpperCase();
    return firstLetter + lastLetter;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Not available') return dateString;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  // Get user's full name
  const getUserFullName = () => {
    if (user?.profile?.full_name) return user.profile.full_name;
    if (user?.profile?.first_name || user?.profile?.last_name) {
      return `${user.profile.first_name || ''} ${user.profile.middle_name || ''} ${user.profile.last_name || ''}`.trim();
    }
    if (formData.first_name || formData.last_name) {
      return `${formData.first_name || ''} ${formData.middle_name || ''} ${formData.last_name || ''}`.trim();
    }
    return 'User';
  };

  // Get user role display name
  const getUserRole = () => {
    if (user?.roles?.length > 0) {
      return user.roles.map(role => role.name).join(', ');
    }
    return 'Employee';
  };

  // Handle back to workspace
  const handleBackToWorkspace = () => {
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  const userFullName = getUserFullName();
  const userRole = getUserRole();
  const userInitials = getInitials(userFullName);
  const personalEmail = formData.personal_email || formData.email || 'Not provided';
  const personalPhone = formData.personal_phone || formData.phone || 'Not provided';

  return (
    <DashboardShell activeKey="user-setup">
      <div className="profile-container">

        {/* Main Profile Card */}
        <div className="profile-main-card">
          {/* Profile Overview Section */}
          <div className="profile-overview">
            <div className="profile-avatar-section">
              <div className="profile-avatar-left">
                <div className="profile-avatar">
                  {user?.profile?.photo_url ? (
                    <img
                      src={user.profile.photo_url}
                      alt={userFullName}
                      className="profile-avatar-img"
                    />
                  ) : (
                    <span className="profile-avatar-initials">{userInitials}</span>
                  )}
                </div>
                <div className="profile-basic-info">
                  <div className="profile-line-1">
                    <h2>{userFullName}</h2>
                    <span className="profile-separator">•</span>
                    <span className="profile-role">{userRole}</span>
                  </div>
                  <div className="profile-line-2">
                    <span className="profile-email">
                      <Icon name="mail" size={10} />
                      {personalEmail}
                    </span>
                    {company && (
                      <>
                        <span className="profile-separator">•</span>
                        <span className="profile-company">
                          <Icon name="building" size={10} />
                          {company.name}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="profile-avatar-actions">
                <button
                  type="button"
                  className="btn-back-workspace"
                  onClick={handleBackToWorkspace}
                >
                  <Icon name="arrow-left" size={14} />
                  <span>Back to Workspace</span>
                </button>
                {!isEditing ? (
                  <button
                    type="button"
                    className="btn-edit-profile"
                    onClick={() => setIsEditing(true)}
                  >
                    <Icon name="edit" size={12} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => {
                        setIsEditing(false);
                        // Reset form data
                        if (user?.profile) {
                          setFormData(buildProfileFormData(user));
                        }
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="btn-save"
                      onClick={handleSubmit}
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-label">Employee ID</div>
                <div className="stat-value">{user?.employee_code || 'N/A'}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Department</div>
                <div className="stat-value">{formData.department}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Joining Date</div>
                <div className="stat-value">{formatDate(formData.joining_date)}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Location</div>
                <div className="stat-value">{formData.location}</div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="profile-tabs">
            <button
              className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
              onClick={() => setActiveTab('personal')}
            >
              <Icon name="user" size={16} />
              <span>Personal</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveTab('professional')}
            >
              <Icon name="briefcase" size={16} />
              <span>Professional</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              <Icon name="lock" size={16} />
              <span>Security</span>
            </button>
            <button
              className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
              onClick={() => setActiveTab('preferences')}
            >
              <Icon name="sliders" size={16} />
              <span>Preferences</span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {activeTab === 'personal' && (
              <div className="personal-info">
                <h3>Personal Information</h3>
                <form className="profile-form" onSubmit={handleSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      ) : (
                        <div className="form-value">{formData.first_name || 'Not provided'}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Middle Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="middle_name"
                          value={formData.middle_name}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      ) : (
                        <div className="form-value">{formData.middle_name || 'Not provided'}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      ) : (
                        <div className="form-value">{formData.last_name || 'Not provided'}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <div className="form-value">{personalEmail}</div>
                    </div>
                    <div className="form-group">
                      <label>Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      ) : (
                        <div className="form-value">{personalPhone}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Gender</label>
                      {isEditing ? (
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleInputChange}
                          className="form-control"
                        >
                          <option value="">Select Gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      ) : (
                        <div className="form-value">{formData.gender || 'Not provided'}</div>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Date of Birth</label>
                      {isEditing ? (
                        <input
                          type="date"
                          name="dob"
                          value={formData.dob}
                          onChange={handleInputChange}
                          className="form-control"
                        />
                      ) : (
                        <div className="form-value">{formatDate(formData.dob)}</div>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'professional' && (
              <div className="professional-info">
                <h3>Professional Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">Employee Code</div>
                    <div className="info-value">{formData.employee_code || 'N/A'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Department</div>
                    <div className="info-value">{formData.department}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Designation</div>
                    <div className="info-value">{formData.designation}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Joining Date</div>
                    <div className="info-value">{formatDate(formData.joining_date)}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Reporting Manager</div>
                    <div className="info-value">{formData.reporting_manager}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Location</div>
                    <div className="info-value">{formData.location}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Address</div>
                    <div className="info-value">
                      {[formData.address_line1, formData.address_line2, formData.city, formData.state, formData.postal_code, formData.country]
                        .filter(Boolean)
                        .join(', ') || 'Not specified'}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Employment Type</div>
                    <div className="info-value">Full-time</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">Work Schedule</div>
                    <div className="info-value">Standard (9 AM - 6 PM)</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="security-info">
                <h3>Security Settings</h3>
                <div className="security-grid">
                  <div className="security-card">
                    <div className="security-icon">
                      <Icon name="key" size={20} />
                    </div>
                    <div className="security-content">
                      <h4>Password</h4>
                      <p>Change your password regularly to keep your account secure</p>
                      <button className="btn-action">Change Password</button>
                    </div>
                  </div>
                  <div className="security-card">
                    <div className="security-icon">
                      <Icon name="shield" size={20} />
                    </div>
                    <div className="security-content">
                      <h4>Two-Factor Authentication</h4>
                      <p>Add an extra layer of security to your account</p>
                      <button className="btn-action">Enable 2FA</button>
                    </div>
                  </div>
                  <div className="security-card">
                    <div className="security-icon">
                      <Icon name="desktop" size={20} />
                    </div>
                    <div className="security-content">
                      <h4>Active Sessions</h4>
                      <p>Manage devices that are currently logged into your account</p>
                      <button className="btn-action">View Sessions</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="preferences-info">
                <h3>Preferences</h3>
                <div className="preferences-grid">
                  <div className="preference-item">
                    <div className="preference-header">
                      <h4>Email Notifications</h4>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <p>Receive email notifications for important updates</p>
                  </div>
                  <div className="preference-item">
                    <div className="preference-header">
                      <h4>Push Notifications</h4>
                      <label className="switch">
                        <input type="checkbox" defaultChecked />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <p>Get push notifications on your device</p>
                  </div>
                  <div className="preference-item">
                    <div className="preference-header">
                      <h4>Dark Mode</h4>
                      <label className="switch">
                        <input type="checkbox" />
                        <span className="slider"></span>
                      </label>
                    </div>
                    <p>Switch to dark mode for better visibility</p>
                  </div>
                  <div className="preference-item">
                    <div className="preference-header">
                      <h4>Language</h4>
                      <select className="form-control">
                        <option>English</option>
                        <option>Hindi</option>
                        <option>Marathi</option>
                      </select>
                    </div>
                    <p>Choose your preferred language</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
