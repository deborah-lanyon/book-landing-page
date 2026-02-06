import mail from '@adonisjs/mail/services/main'
import User from '#models/user'
import Comment from '#models/comment'
import Section from '#models/section'

/**
 * Service for sending email notifications
 */
export default class NotificationService {
  /**
   * Send notification to all admin users about a new comment
   */
  static async notifyAdminsOfNewComment(comment: Comment) {
    // Get all admin users
    const admins = await User.query().where('role', 'admin')

    if (admins.length === 0) {
      console.log('No admin users found to notify about new comment')
      return
    }

    // Get the section title
    const section = await Section.find(comment.sectionId)
    const sectionTitle = section?.title || 'Unknown Section'

    // Build admin emails list
    const adminEmails = admins.map((admin) => admin.email)

    try {
      await mail.send((message) => {
        message
          .to(adminEmails)
          .subject('New Comment Pending Approval - Reading God\'s Word')
          .html(`
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2c3e50;">New Comment Requires Approval</h2>

              <p>A new comment has been submitted and requires your approval.</p>

              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>Section:</strong> ${sectionTitle}</p>
                <p style="margin: 0 0 10px 0;"><strong>Author:</strong> ${comment.authorName}</p>
                <p style="margin: 0 0 10px 0;"><strong>Email:</strong> ${comment.authorEmail}</p>
                <p style="margin: 0 0 10px 0;"><strong>Comment:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #667eea;">
                  ${comment.content.replace(/\n/g, '<br>')}
                </div>
              </div>

              <p>
                <a href="https://readinggodsword.org.au/admin/comments"
                   style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 4px;">
                  Review Comments
                </a>
              </p>

              <p style="color: #666; font-size: 12px; margin-top: 30px;">
                This email was sent from Reading God's Word. Please do not reply directly to this email.
              </p>
            </div>
          `)
      })

      console.log(`Notification sent to ${adminEmails.length} admin(s) for new comment`)
    } catch (error) {
      console.error('Failed to send comment notification email:', error)
      // Don't throw - we don't want email failures to block comment submission
    }
  }
}
