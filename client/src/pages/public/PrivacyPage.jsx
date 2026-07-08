import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "#components/ui/Icon.jsx";

export default function PrivacyPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="min-h-screen bg-[#FFF7E6] flex justify-center py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="w-full max-w-3xl bg-white rounded-2xl p-8 sm:p-12 shadow-sm font-body text-[#0F1D29]">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#e5e7eb]">
                    <Icon height={2.5} width={2.5} />
                    <h1 className="font-headline text-3xl font-semibold text-[#0F1D29]">
                        Privacy Policy
                    </h1>
                </div>

                <div className="prose prose-sm sm:prose-base prose-headings:font-headline prose-headings:font-semibold prose-a:text-[#8D4A52] max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: July 8, 2026</p>

                    <h2 className="text-xl mt-8 mb-4">1. Information We Collect</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        At ADA, we collect information to provide you with the best experience in managing your freelance business. The data we collect includes:
                    </p>
                    <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-2">
                        <li><strong>Account Information:</strong> Your username, business name, email address, and encrypted password. If you sign up using Google OAuth, we collect your basic profile information (name and email) provided by Google.</li>
                        <li><strong>Business Data:</strong> Any products you create, raw materials you track, client orders and order items you process, expenses you log, and your weekly availability schedule.</li>
                        <li><strong>Notifications:</strong> Logs of system notifications sent to you regarding orders and business activity.</li>
                    </ul>

                    <h2 className="text-xl mt-8 mb-4">2. How We Use Your Information</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        We use the information we collect solely to operate and maintain the ADA platform. This includes:
                    </p>
                    <ul className="list-disc pl-5 mb-4 text-gray-700 space-y-2">
                        <li>Facilitating the core functionality of creating, selling, and tracking your freelance work.</li>
                        <li>Authenticating your access to your secure workspace.</li>
                        <li>Sending you important account updates, OTP verification emails, and password resets.</li>
                    </ul>

                    <h2 className="text-xl mt-8 mb-4">3. Data Sharing and Disclosure</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        <strong>We do not sell your personal or business data to third parties.</strong> We only share information with third-party service providers (such as Google for authentication or email delivery services) when it is strictly necessary to provide our services. These providers are bound by strict confidentiality and security protocols.
                    </p>

                    <h2 className="text-xl mt-8 mb-4">4. Data Security</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        We take the security of your data seriously. Your passwords are encrypted using industry-standard bcrypt hashing algorithms before being stored in our database. We use secure JSON Web Tokens (JWT) to protect your active sessions, ensuring that only you can access your business data.
                    </p>

                    <h2 className="text-xl mt-8 mb-4">5. Data Retention</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        Your data is retained for as long as your ADA account remains active. You maintain full control over your data and can request deletion of your account and associated business records at any time.
                    </p>

                    <div className="mt-12 pt-8 border-t border-[#e5e7eb] flex items-center justify-between">
                        <Link to="/signup" className="text-sm font-medium text-[#8D4A52] hover:underline">
                            &larr; Back to Sign Up
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
