export default function SupportPage() {
  const faqs = [
    {
      question: "How do I play the games?",
      answer: "Navigate to the Play tab and tap on any game to start playing. Some games are free to play, while premium games can be unlocked for $2.99."
    },
    {
      question: "How do I submit my information for a job opportunity?",
      answer: "Go to the Agent tab, fill out the form with your details including your resume, and submit. A recruiter will review your information and reach out with suitable opportunities."
    },
    {
      question: "How can I hire Alex for a project?",
      answer: "Visit the About tab and click 'Hire Alex'. You can choose from various services including app development, logo design, creative projects, or book a consultation call."
    },
    {
      question: "Are the games free?",
      answer: "Coin Flip, Dice Roll, Rock Paper Scissors, and Magic 8-Ball are free to play. Premium games like Tic Tac Toe, Snake, Fortune Cookie, and Hangman can be unlocked with a one-time purchase of $2.99."
    },
    {
      question: "How do I post a job on the community board?",
      answer: "Go to the Community tab, tap 'Post a Job', and fill out the job details including title, company, location, and description. All job postings are reviewed before being published."
    },
    {
      question: "How can I contact support?",
      answer: "You can reach our support team at support@alexenright.com. We typically respond within 24-48 hours."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Support Center</h1>
          <p className="text-gray-600">How can we help you today?</p>
        </div>

        {/* Contact Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-600 mb-4">
            Have a question or need assistance? Reach out to our support team and we'll get back to you within 24-48 hours.
          </p>
          <a 
            href="mailto:support@alexenright.com" 
            className="inline-flex items-center gap-2 text-accent font-medium hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            support@alexenright.com
          </a>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy Policy Link */}
        <div className="text-center">
          <a 
            href="/privacy-policy.html" 
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  );
}
