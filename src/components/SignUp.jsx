import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import swal from 'sweetalert';
import logo from '../assets/kior.webp';

export default function Signup() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState({ __html: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Invitation state
  const [inviteData, setInviteData] = useState(null);

  // Check for invitation parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteEmail = params.get('email');
    const projectId = params.get('projectId');
    const inviteToken = params.get('inviteToken');
    const role = params.get('role');
    const message = params.get('message');

    if (inviteEmail && projectId && inviteToken) {
      setInviteData({ projectId, inviteToken, role, message });
      setEmail(inviteEmail);
    }
  }, []);

  const validatePassword = (password) => {
    const errors = [];
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter.");
    }
    if (!/[!@#$%^&*(),.?\":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character.");
    }
    return errors;
  };

  // Function to complete invitation
  const completeInvitation = async (inviteToken, userToken) => {
    try {
      await axios.post('https://kior-backend.vercel.app/api/invite/complete', 
        { inviteToken },
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      console.error('Error completing invitation:', error);
    }
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    setError({ __html: "" });
    setLoading(true);

    const passwordErrors = validatePassword(password);
    if (passwordErrors.length > 0) {
      setError({ __html: passwordErrors.join("<br>") });
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError({ __html: "Passwords do not match." });
      setLoading(false);
      return;
    }

    try {
      // Send signup request to backend
      const response = await axios.post("https://kior-backend.vercel.app/register", {
        firstName,
        lastName,
        email,
        password,
      });

      // Save JWT token to localStorage
      localStorage.setItem("token", response.data.token);

      // Handle invitation completion
      if (inviteData) {
        await completeInvitation(inviteData.inviteToken, response.data.token);
        
        // Success message for invitation
        swal("Welcome!", `Account created successfully! You've been added to the project as a ${inviteData.role}.`, "success");
        
        // Redirect to the project they were invited to
        setTimeout(() => navigate(`/projects/${inviteData.projectId}`), 1500);
      } else {
        // Normal registration success
        swal("Good job!", "Account created successfully!", "success");
        
        // Redirect to dashboard
        setTimeout(() => navigate("/dashboard"), 1500);
      }

    } catch (err) {
      console.error(err);
      if (err.response && err.response.data.message) {
        setError({ __html: err.response.data.message });
      } else {
        setError({ __html: "Something went wrong. Try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-bricolage">
      <div className="max-w-2xl w-full space-y-8"> {/* Changed to max-w-2xl for wider layout */}
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto w-60 flex items-center justify-center mb-4">
            <span className=""><img src={logo} className='h-20 w-32' alt="" /></span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            {inviteData ? 'Complete Your ' : 'Create your '}
            <span className="text-purple-600">
              {inviteData ? 'Invitation!' : 'Account!'}
            </span>
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link 
              to={inviteData ? `/login?redirect=/projects/${inviteData.projectId}` : "/login"} 
              className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>

        {/* Invitation info display */}
        {inviteData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-700">
              <strong>🎉 You've been invited to join a project!</strong>
            </p>
            <p className="text-sm text-blue-600 mt-1">
              Role: <strong>{inviteData.role}</strong>
              {inviteData.message && (
                <span className="block mt-1">Message: "{inviteData.message}"</span>
              )}
            </p>
            <p className="text-xs text-blue-500 mt-2">
              Complete your registration to join the project.
            </p>
          </div>
        )}

        {/* Signup Form */}
        <form 
          className="mt-8 space-y-6 bg-white border border-gray-200 rounded-lg p-8 shadow-sm" 
          onSubmit={onSubmit}
        >
          {error.__html && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <div className="flex items-center">
                <span className="mr-2">⚠️</span>
                <div dangerouslySetInnerHTML={error} />
              </div>
            </div>
          )}

          <div className="space-y-6"> {/* Increased spacing between fields */}
            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-6"> {/* Increased gap */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={loading}
                  className="w-full text-black px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base" // Increased padding and font size
                  placeholder="Enter your first name"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={loading}
                  className="w-full text-black px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base" // Increased padding and font size
                  placeholder="Enter your last name"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email {inviteData && <span className="text-xs text-gray-500">(from invitation)</span>}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading || !!inviteData}
                className="w-full text-black px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base" // Increased padding and font size
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-2 gap-6"> {/* Increased gap */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full text-black px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 pr-12 disabled:opacity-50 disabled:cursor-not-allowed text-base" // Increased padding and font size
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    <span className="text-gray-400 text-lg">
                      {showPassword} {/* Fixed emoji icons */}
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    className="w-full text-black px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white transition-all duration-200 pr-12 disabled:opacity-50 disabled:cursor-not-allowed text-base" // Increased padding and font size
                    placeholder="Confirm password"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors duration-200 disabled:opacity-50"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    <span className="text-gray-400 text-lg">
                      {showConfirmPassword } {/* Fixed emoji icons */}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li className={password.length >= 8 ? "text-green-600" : ""}>• At least 8 characters long</li>
              <li className={/[A-Z]/.test(password) ? "text-green-600" : ""}>• One uppercase letter</li>
              <li className={/[!@#$%^&*(),.?":{}|<>]/.test(password) ? "text-green-600" : ""}>• One special character</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" // Increased padding and font size
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  {inviteData ? 'Joining Project...' : 'Creating Account...'}
                </div>
              ) : (
                inviteData ? 'Join Project!' : 'Create Account!'
              )}
            </button>
          </div>

          {/* Login link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link 
                to={inviteData ? `/login?redirect=/projects/${inviteData.projectId}` : "/login"} 
                className="font-medium text-purple-600 hover:text-purple-500 transition-colors duration-200"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </form>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center text-xs text-gray-600 mt-8">
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-lg mb-1">📊</div>
            <div>Systematic Reviews</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-lg mb-1">👥</div>
            <div>Collaborative Screening</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
            <div className="text-lg mb-1">🚀</div>
            <div>Real-time Updates</div>
          </div>
        </div>
      </div>
    </div>
  );
}
