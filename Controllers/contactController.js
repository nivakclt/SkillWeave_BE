const transporter = require('../config/emailconfig')

const sendContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body

        // Validate required fields
        if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all fields'
            })
        }

        // Basic email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailPattern.test(email.trim())) {
            return res.status(400).json({
                success: false,
                message: 'Please enter a valid email address'
            })
        }

        // Send email to the SkillWeave project inbox
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email.trim(),
            subject: `SkillWeave Contact: ${subject.trim().replace(/[\r\n]/g, ' ')}`,
            text: `
            New message from the SkillWeave contact form
            Name: ${name.trim()}
            Email: ${email.trim()}
            Subject: ${subject.trim()}
            Message:
            ${message.trim()}
                        `
        })
        return res.status(200).json({
            success: true,
            message: 'Your message has been sent successfully'
        })

    } catch (error) {
        console.error('Contact form error:', error)

        return res.status(500).json({
            success: false,
            message: 'Unable to send your message. Please try again later.'
        })
    }
}

module.exports = { sendContactMessage }