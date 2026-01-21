const BASE_URL = 'https://scheme.jaigurujewellers.com/api/v1';

/* =========================
   NORMAL REGISTER
========================= */
export const registerUser = async (payload) => {
  try {
    console.log('Sending registration request to:', `${BASE_URL}/user/register`);
    console.log('Payload:', payload);

    const res = await fetch(`${BASE_URL}/user/register`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    console.log('Registration response:', data);
    
    if (!res.ok) {
      // Try to get error message from response
      const errorMsg = data?.error || 
                       data?.message || 
                       data?.errorMessage || 
                       'Registration failed';
      throw new Error(errorMsg);
    }
    
    return data;
  } catch (error) {
    console.error('Register API Error:', error);
    throw error;
  }
};

/* =========================
   NORMAL OTP VERIFY
========================= */
export const verifyOtp = async (payload) => {
  try {
    // Convert payload object to query params
    const queryParams = new URLSearchParams(payload).toString();

    const url = `${BASE_URL}/user/verify-otp?${queryParams}`;

    console.log('Sending OTP verification request to:', url);

    const res = await fetch(url, {
      method: 'POST', // or 'GET' if your backend expects GET
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.errorMessage || data?.message || 'OTP verification failed');
    }

    return data;
  } catch (error) {
    console.error('Verify OTP Error:', error);
    throw error;
  }
};


/* =========================
   NORMAL LOGIN
========================= */
export const loginUser = async (payload) => {
  console.log('Login Payload:', payload);
  try {
    const res = await fetch(`${BASE_URL}/user/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data?.errorMessage || data?.message || 'Login failed');
    }
    
    return data;
  } catch (error) {
    console.error('Login Error:', error);
    throw error;
  }
};

/* =========================
   GOOGLE LOGIN
========================= */
export const googleLogin = async (payload) => {
  try {
    console.log('Google Login Payload:', payload);

    const res = await fetch(`${BASE_URL}/google-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload), // ✅ already correct shape
    });

    const data = await res.json();
    console.log('Google Login Response:', data);

    if (!res.ok) {
      throw new Error(data?.message || data?.error || 'Google login failed');
    }

    return data;
  } catch (error) {
    console.error('Google Login Error:', error);
    throw error;
  }
};



/* =========================
   REQUEST GOOGLE CONTACT OTP
========================= */
export const requestGoogleContactOtp = async (payload) => {
  try {
    const { userId, newContactNumber, hashKey } = payload;

    const queryParams = new URLSearchParams({
      userId: String(userId),
      newContactNumber,
      ...(hashKey && { hashKey }),
    }).toString();

    const url = `${BASE_URL}/request-google-contact-update?${queryParams}`;

    console.log('Request Google OTP URL:', url);

    const res = await fetch(url, {
      method: 'POST', // ✅ POST
      // ❌ REMOVE Content-Type header
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message ||
        data?.errorMessage ||
        'OTP request failed'
      );
    }

    return data;
  } catch (error) {
    console.error('Request Google OTP Error:', error);
    throw error;
  }
};



/* =========================
   VERIFY GOOGLE CONTACT OTP
========================= */
export const verifyGoogleContactOtp = async (payload) => {
  try {
    const { newContactNumber, otp, userId } = payload;
    
    const queryParams = new URLSearchParams({
      newContactNumber,
      otp,
      ...(userId && { userId })
    }).toString();
    
    const url = `${BASE_URL}/verify-google-contact-otp?${queryParams}`;
    
    console.log('Verify Google Contact OTP URL:', url);
    
    const res = await fetch(url, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data?.errorMessage || data?.message || 'OTP verification failed');
    }
    
    return data;
  } catch (error) {
    console.error('Verify Google OTP Error:', error);
    throw error;
  }
};