
import { Link } from "react-router-dom";

const VerifyEmail = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-gray-50">
    <div className="w-full max-w-md p-8 space-y-4 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-2">Email Verification Sent</h1>
      <p className="mb-6">Please check your inbox and click the verification link to activate your account.</p>
      
      <div className="text-sm text-gray-600 mt-4">
        <p>Didn't receive an email? Check your spam folder or</p>
        <Link to="/login?tab=register" className="text-primary hover:underline">
          return to sign up
        </Link>
      </div>
    </div>
  </div>
);

export default VerifyEmail;
