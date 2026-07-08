import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Icon from "#components/ui/Icon.jsx";

export default function TermsPage() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-screen w-screen overflow-y-auto bg-[#FFF7E6] flex justify-center py-12 px-4 sm:px-6 lg:px-8"
        >
            <div className="w-full max-w-3xl bg-white rounded-2xl p-8 sm:p-12 shadow-sm font-body text-[#0F1D29] my-auto h-fit">
                <div className="flex items-center gap-4 mb-8 pb-8 border-b border-[#e5e7eb]">
                    <Icon height={2.5} width={2.5} />
                    <h1 className="font-headline text-3xl font-semibold text-[#0F1D29]">
                        Terms of Service
                    </h1>
                </div>

                <div className="prose prose-sm sm:prose-base prose-headings:font-headline prose-headings:font-semibold prose-a:text-[#8D4A52] max-w-none">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: July 8, 2026</p>

                    <h2 className="text-xl mt-8 mb-4">1. Acceptance of Terms</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        By accessing or using the ADA platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access or use the service. ADA ("we", "our", or "us") provides a software-as-a-service platform to help freelance professionals manage their business operations.
                    </p>

                    <h2 className="text-xl mt-8 mb-4">2. Description of Service</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        ADA is a freelance business management tool designed to track products, materials, client orders, and expenses, and to manage weekly availability. We reserve the right to modify, suspend, or discontinue any part of the service at any time without notice.
                    </p>

                    <h2 className="text-xl mt-8 mb-4">3. User Responsibilities</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        You are responsible for maintaining the security of your account and password. We cannot and will not be liable for any loss or damage from your failure to comply with this security obligation. You are responsible for all content posted and activity that occurs under your account. You agree not to use the service for any illegal or unauthorized purpose.
                    </p>

                    <h2 className="text-xl mt-8 mb-4">4. Data Ownership</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        You retain full ownership of all business data (including products, materials, orders, and expenses) that you input into the ADA platform. By using the service, you grant us a license to host, process, and securely store this data strictly for the purpose of providing the service to you.
                    </p>

                    <h2 className="text-xl mt-8 mb-4">5. Disclaimer of Warranties</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        The service is provided on an "as is" and "as available" basis. ADA makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                    </p>

                    <h2 className="text-xl mt-8 mb-4">6. Limitation of Liability</h2>
                    <p className="mb-4 text-gray-700 leading-relaxed">
                        In no event shall ADA be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ADA's website or platform.
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
