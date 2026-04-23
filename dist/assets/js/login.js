document.addEventListener('DOMContentLoaded', () => {
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');
    const form = document.querySelector('#adminLoginForm');
    const emailInput = document.querySelector('#email');
    const messageArea = document.querySelector('#messageArea');
    const signInBtn = document.querySelector('#signInBtn');
    const loginCard = document.querySelector('.login-card');
    const loginAsAdminLink = document.querySelector('#loginAsAdminLink');
    const loginAsUserLink = document.querySelector('#loginAsUserLink');

    // Password visibility toggle
    togglePassword.addEventListener('click', function () {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        
        // Toggle icon
        this.classList.toggle('fa-eye-slash');
        this.classList.toggle('fa-eye');
    });

    // Form submission & validation
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Reset states
        messageArea.textContent = '';
        messageArea.style.opacity = '1';
        
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Basic HTML validation check
        if (!email) {
            showError('Please enter your email address.');
            emailInput.focus();
            return;
        }
        
        if (!password) {
            showError('Please enter your password.');
            passwordInput.focus();
            return;
        }

        // Simulate loading state
        const originalBtnText = signInBtn.innerHTML;
        signInBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Authenticating...';
        signInBtn.disabled = true;

        // Simulate API call delay
        setTimeout(() => {
            // Check static credentials for either Admin or User
            if ((email === 'admin@hrms.com' && password === '1234') || 
                (email === 'user@hrms.com' && password === '1234')) {
                
                const role = email === 'admin@hrms.com' ? 'Admin' : 'User';
                
                // Success state
                signInBtn.innerHTML = `<i class="fa-solid fa-check"></i> ${role} Sign In Successful`;
                signInBtn.style.backgroundColor = 'var(--success-color)';
                signInBtn.style.color = 'white';
                
                messageArea.style.color = 'var(--success-color)';
                messageArea.textContent = `Redirecting to ${role} Dashboard...`;
                
                // Redirect based on role
                setTimeout(() => {
                    if (role === 'Admin') {
                        window.location.href = 'dashboard.php';
                    } else {
                        window.location.href = 'user-dashboard.php';
                    }
                }, 1500);
                
            } else {
                // Error state
                showError('Invalid credentials. Hint: admin or user @hrms.com / 1234');
                resetForm(originalBtnText);
                
                // Shake animation
                loginCard.classList.remove('shake');
                // Trigger reflow
                void loginCard.offsetWidth;
                loginCard.classList.add('shake');
            }
        }, 800); // 800ms fake delay
    });

    function showError(msg) {
        messageArea.style.color = 'var(--error-color)';
        messageArea.textContent = msg;
    }

    function resetForm(originalText) {
        signInBtn.innerHTML = originalText;
        signInBtn.disabled = false;
        signInBtn.style.backgroundColor = '';
        signInBtn.style.color = '';
    }

    // Quick login links
    if (loginAsAdminLink) {
        loginAsAdminLink.addEventListener('click', (e) => {
            e.preventDefault();
            emailInput.value = 'admin@hrms.com';
            passwordInput.value = '1234';
        });
    }

    if (loginAsUserLink) {
        loginAsUserLink.addEventListener('click', (e) => {
            e.preventDefault();
            emailInput.value = 'user@hrms.com';
            passwordInput.value = '1234';
        });
    }
});
