'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Modal } from '@/components/ui/Modal'
import { submitContactForm } from '@/app/actions/contact'

export function AboutTab() {
  const [showHireModal, setShowHireModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [contactType, setContactType] = useState('')
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const handleHireOption = (option: string) => {
    if (option === 'donate') {
      window.open('https://venmo.com/Alexander-Enright', '_blank')
      setShowHireModal(false)
      return
    }
    setShowHireModal(false)
    if (option === 'job') {
      window.location.href = '/'
    } else if (option === 'call') {
      setShowPhoneModal(true)
    } else {
      setContactType(option)
      setShowContactModal(true)
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const phone = formData.get('phone') as string
    
    // Send to backend
    const result = await submitContactForm({
      type: 'call',
      phone: phone,
      message: `Phone: ${phone}`
    })
    
    if (result.success) {
      setShowPhoneModal(false)
      setShowSuccessModal(true)
    } else {
      setSubmitStatus({ type: 'error', message: result.error || 'Failed to submit' })
    }
  }

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const result = await submitContactForm({
      type: contactType,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      message: formData.get('message') as string
    })
    
    if (result.success) {
      setShowContactModal(false)
      setShowSuccessModal(true)
      e.currentTarget.reset()
    } else {
      setSubmitStatus({ type: 'error', message: result.error || 'Failed to send message' })
    }
  }

  return (
    <div className="p-4">
      {/* Profile Header */}
      <div className="text-center mb-8">
        <img 
          src="/ae.jpg" 
          alt="Alex Enright" 
          className="w-24 h-24 mx-auto rounded-full object-cover border-4 border-accent"
        />
        <h1 className="text-2xl font-bold mt-4">Alex Enright</h1>
        <p className="text-gray-600 mt-1">Creative builder, Creator, Hard worker</p>
        
        <Button
          onClick={() => setShowHireModal(true)}
          className="mt-4"
          size="lg"
        >
          Hire Alex
        </Button>
      </div>

      {/* Bio */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">About</h2>
        <p className="text-gray-600 leading-relaxed">
          Former Division I athlete with a competitive mindset and a team-first approach in everything I do.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          After graduating from Arizona State University, I've focused on channeling the work ethic and resilience I developed through athletics into how I approach sales and build lasting customer relationships. I'm passionate about entrepreneurship, growth, and being part of something that's being built the right way.
        </p>
        <p className="text-gray-600 leading-relaxed mt-3">
          Always open to connecting with people looking to build, grow, or level up their teams.
        </p>
      </section>

      {/* Current Project */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Current Project</h2>
        <a
          href="https://apps.apple.com/us/app/urepp-tv/id1116231076"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-accent transition-colors"
        >
          <img 
            src="/Blue1024.png" 
            alt="UREPP TV" 
            className="w-14 h-14 rounded-lg object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <div>
            <p className="font-medium text-lg">UREPP TV</p>
            <p className="text-sm text-gray-500">Watch on the App Store →</p>
          </div>
        </a>
      </section>

      {/* Music */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">What I'm Listening To</h2>
        <div className="bg-gray-100 rounded-xl overflow-hidden" style={{ height: '400px' }}>
          <iframe 
            src="https://open.spotify.com/embed/artist/65Ugrmba5ZkPNVxmHpnfFu?utm_source=generator&theme=0" 
            width="100%" 
            height="400" 
            frameBorder="0" 
            allowTransparency={true}
            allow="encrypted-media"
            loading="lazy"
            title="Spotify"
            style={{ borderRadius: '12px' }}
          />
        </div>
      </section>

      {/* Books */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Recommended Reading</h2>
        <div className="space-y-3">
          <a
            href="https://www.amazon.com/stores/Alexander-Enright/author/B0G3W49PNY"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-accent transition-colors"
          >
            <img 
              src="/journey.png" 
              alt="An Entrepreneur's Journey" 
              className="w-16 h-24 object-cover rounded-lg"
            />
            <div>
              <p className="font-medium text-lg">An Entrepreneur's Journey</p>
              <p className="text-sm text-gray-500">by Alexander Enright</p>
            </div>
          </a>
          
          <a
            href="https://www.amazon.com/stores/Alexander-Enright/author/B0G3W49PNY"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-accent transition-colors"
          >
            <img 
              src="/chance.png" 
              alt="An Entrepreneur's Chance" 
              className="w-16 h-24 object-cover rounded-lg"
            />
            <div>
              <p className="text-xs font-bold text-red-500">JOURNAL</p>
              <p className="font-medium text-lg">An Entrepreneur's Chance</p>
              <p className="text-sm text-gray-500">by Alexander Enright</p>
            </div>
          </a>
        </div>
      </section>

      {/* Art Gallery */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Art Gallery</h2>
        <p className="text-sm text-gray-500 mb-3">The Bench Series - Available For Sale</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { title: 'The Bench 6', url: 'https://www.saatchiart.com/art/Painting-The-Bench-6/2905359/13416657/view', img: '/6.jpeg' },
            { title: 'The Bench 5', url: 'https://www.saatchiart.com/art/Painting-The-Bench-5/2905359/13416653/view', img: '/5.jpeg' },
            { title: 'The Bench 4', url: 'https://www.saatchiart.com/art/Painting-The-Bench-4/2905359/13416647/view', img: '/4.jpeg' },
            { title: 'The Bench 3', url: 'https://www.saatchiart.com/art/Painting-The-Bench-3/2905359/13416629/view', img: '/3.jpeg' },
            { title: 'The Bench 2', url: 'https://www.saatchiart.com/art/Painting-The-Bench-2/2905359/13416623/view', img: '/2.jpeg' },
            { title: 'The Bench', url: 'https://www.saatchiart.com/art/Painting-The-Bench/2905359/13416589/view', img: '/1.jpeg' },
          ].map((art, i) => (
            <a
              key={i}
              href={art.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aspect-square bg-gray-100 rounded-xl overflow-hidden hover:opacity-90 transition-opacity"
            >
              <img 
                src={art.img} 
                alt={art.title}
                className="w-full h-full object-cover"
              />
            </a>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Connect</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { name: 'GitHub', url: 'https://github.com/alexander-enright-urepp/urepp' },
            { name: 'LinkedIn', url: 'https://www.linkedin.com/in/alex-enright-438aa7367' },
            { name: 'Twitter', url: 'https://twitter.com/alexrossenright' },
            { name: 'Venmo', url: 'https://venmo.com/Alexander-Enright' },
          ].map((link) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-100 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>
      </section>

      {/* Hire Modal (Popup Window) */}
      <Modal
        isOpen={showHireModal}
        onClose={() => setShowHireModal(false)}
        title="How can I help?"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-500 -mt-2 mb-2">Hourly rate is $30</p>
          
          <button
            onClick={() => handleHireOption('job')}
            className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-accent transition-colors"
          >
            <p className="font-medium">💼 Help me find a job</p>
            <p className="text-sm text-gray-500">Submit a job opportunity</p>
          </button>
          
          <button
            onClick={() => handleHireOption('app')}
            className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-accent transition-colors"
          >
            <p className="font-medium">📱 Build me an app</p>
            <p className="text-sm text-gray-500">Hire me for your project</p>
          </button>
          
          <button
            onClick={() => handleHireOption('logo')}
            className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-accent transition-colors"
          >
            <p className="font-medium">🎨 Design me a logo</p>
            <p className="text-sm text-gray-500">Custom logo design</p>
          </button>
          
          <button
            onClick={() => handleHireOption('creative')}
            className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-accent transition-colors"
          >
            <p className="font-medium">✨ Creative project</p>
            <p className="text-sm text-gray-500">Let's collaborate</p>
          </button>
          
          <button
            onClick={() => handleHireOption('call')}
            className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-accent transition-colors"
          >
            <p className="font-medium">📅 Book a call</p>
            <p className="text-sm text-gray-500">Leave your phone number</p>
          </button>
          
          <button
            onClick={() => handleHireOption('donate')}
            className="w-full p-4 text-left border border-gray-200 rounded-xl hover:border-accent transition-colors"
          >
            <p className="font-medium">💚 Donate</p>
            <p className="text-sm text-gray-500">Support via Venmo @Alexander-Enright</p>
          </button>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Get in touch"
      >
        <form onSubmit={handleContactSubmit} className="space-y-4">
          <Input name="name" label="Your Name" required />
          <Input name="email" type="email" label="Email" required />
          <Textarea
            name="message"
            label="Tell me about your project"
            rows={4}
            required
          />
          {submitStatus && (
            <div className={`p-3 rounded-lg text-sm ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {submitStatus.message}
            </div>
          )}
          <Button type="submit" className="w-full">Send Message</Button>
        </form>
      </Modal>

      {/* Phone Modal */}
      <Modal
        isOpen={showPhoneModal}
        onClose={() => setShowPhoneModal(false)}
        title="Book a call"
      >
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <p className="text-sm text-gray-600">Enter your phone number and I'll reach out to schedule a call.</p>
          <Input
            name="phone"
            type="tel"
            label="Phone Number"
            placeholder="+1 (555) 123-4567"
            required
          />
          {submitStatus && (
            <div className={`p-3 rounded-lg text-sm ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {submitStatus.message}
            </div>
          )}
          <Button type="submit" className="w-full">Submit</Button>
        </form>
      </Modal>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Success!"
      >
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-lg font-medium text-gray-900">Thank you for your inquiry!</p>
          <p className="text-gray-600 mt-2">We will be in contact with you shortly.</p>
          <Button onClick={() => setShowSuccessModal(false)} className="mt-6 w-full">
            Got it
          </Button>
        </div>
      </Modal>

      {/* Support Link */}
      <div className="mt-8 text-center">
        <a
          href="mailto:support@alexenright.com"
          className="text-accent text-sm hover:underline"
        >
          Any Questions? Contact Support
        </a>
      </div>
    </div>
  )
}
