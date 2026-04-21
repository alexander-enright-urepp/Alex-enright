import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendRecruiterNotification(
  submission: {
    name: string
    email: string
    phone?: string
    jobType?: string
    location?: string
    remotePref?: string
    linkedinUrl?: string
    note?: string
    resumeUrl?: string
  }
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'alex@alexenright.com'

  await resend.emails.send({
    from: 'AlexEnright.com <noreply@alexenright.com>',
    to: adminEmail,
    subject: `New Recruiter Submission from ${submission.name}`,
    html: `
      <h2>New Recruiter Submission</h2>
      <p><strong>Name:</strong> ${submission.name}</p>
      <p><strong>Email:</strong> ${submission.email}</p>
      ${submission.phone ? `<p><strong>Phone:</strong> ${submission.phone}</p>` : ''}
      ${submission.jobType ? `<p><strong>Job Type:</strong> ${submission.jobType}</p>` : ''}
      ${submission.location ? `<p><strong>Location:</strong> ${submission.location}</p>` : ''}
      ${submission.remotePref ? `<p><strong>Remote Preference:</strong> ${submission.remotePref}</p>` : ''}
      ${submission.linkedinUrl ? `<p><strong>LinkedIn:</strong> <a href="${submission.linkedinUrl}">${submission.linkedinUrl}</a></p>` : ''}
      ${submission.note ? `<p><strong>Note:</strong> ${submission.note}</p>` : ''}
      ${submission.resumeUrl ? `<p><strong>Resume:</strong> <a href="${submission.resumeUrl}">Download Resume</a></p>` : ''}
    `,
  })
}

export async function sendRecruiterConfirmation(userEmail: string, userName: string) {
  await resend.emails.send({
    from: 'AlexEnright.com <noreply@alexenright.com>',
    to: userEmail,
    subject: 'Thanks for your submission!',
    html: `
      <h2>Hi ${userName},</h2>
      <p>Thanks for reaching out! I've received your information and will review it soon.</p>
      <p>I'll be in touch if there's a good match.</p>
      <p>— Alex</p>
    `,
  })
}

export async function sendContactNotification(
  formData: {
    name: string
    email: string
    message: string
    projectType: string
  }
) {
  const adminEmail = process.env.ADMIN_EMAIL || 'alex@alexenright.com'

  await resend.emails.send({
    from: 'AlexEnright.com <noreply@alexenright.com>',
    to: adminEmail,
    subject: `New ${formData.projectType} Inquiry from ${formData.name}`,
    html: `
      <h2>New Project Inquiry</h2>
      <p><strong>Project Type:</strong> ${formData.projectType}</p>
      <p><strong>Name:</strong> ${formData.name}</p>
      <p><strong>Email:</strong> ${formData.email}</p>
      <p><strong>Message:</strong></p>
      <p>${formData.message}</p>
    `,
  })
}
